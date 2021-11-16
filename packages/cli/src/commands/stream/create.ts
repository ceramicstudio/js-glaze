import { flags } from '@oclif/command'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'
import { parseContent, parseControllers } from '../../utils'
import { TileDocument } from '@ceramicnetwork/stream-tile'

type Flags = CommandFlags & {
  determinitic?: boolean
  did?: string
  'only-genesis'?: boolean
}

export default class Create extends Command<
  Flags,
  {
    schema: string
    content: string
    controllers?: string
  }
> {
  static description = 'create a new stream'

  static args = [
    {
      name: 'schema',
      description: 'the streamId of the schema to use',
      required: true,
    },
    {
      name: 'content',
      description: 'the stream body',
      required: true,
    },
    {
      name: 'controllers',
      description: 'the stream controllers',
      required: false,
    },
  ]

  static flags = {
    ...Command.flags,
    'only-genesis': flags.boolean({
      char: 'g',
      description: 'only generate genesis block',
      default: false,
    }),
    deterministic: flags.boolean({
      char: 'd',
      description: 'generate deterministic stream',
      default: false,
    }),
  }

  async run(): Promise<void> {
    this.spinner.start('Creating stream')
    try {
      const parsedControllers = parseControllers(this.args.controllers)
      const parsedContent = parseContent(this.args.content)

      const localDeterministic =
        this.flags.deterministic != undefined ? this.flags.determinitic : false

      const metadata = {
        controllers: parsedControllers,
        schema: this.args.schema,
        deterministic: localDeterministic,
      }

      const tile = await TileDocument.create(this.ceramic, parsedContent, metadata, {
        anchor: !this.flags['only-genesis'],
        publish: !this.flags['only-genesis'],
      })

      this.spinner.succeed(`Created Stream ${tile.commitId}`)
      this.logJSON({
        commitId: tile.id.toString(),
        body: tile.content,
      })
    } catch (e) {
      console.error(e)
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
