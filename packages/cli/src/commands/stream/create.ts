import { flags } from '@oclif/command'
import { TileDocument } from '@ceramicnetwork/stream-tile'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'
import { parseContent, parseControllers } from '../../utils'

type Flags = CommandFlags & {
  determinitic?: boolean
  'only-genesis'?: boolean

  did?: string
  controllers?: string
}

export default class Create extends Command<
  Flags,
  {
    schema: string
    content: string
  }
> {
  static description = 'create a new stream'

  static args = [
    {
      name: 'schema',
      description: 'the StreamId of the schema to use',
      required: true,
    },
    {
      name: 'content',
      description: 'the Stream body',
      required: true,
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

    did: flags.string({
      exclusive: ['key'],
      description: 'Creator DID',
    }),
    controllers: flags.string({
      char: 'c',
      description: 'Comma separated list of controllers',
    }),
  }

  async run(): Promise<void> {
    this.spinner.start('Creating stream...')
    let did: string | undefined
    if (this.flags.key != null) {
      did = this.authenticatedDID.id
    } else if (this.flags.did !== null) {
      did = this.flags.did
    } else {
      throw new Error('Missing DID')
    }
    try {
      let parsedControllers: Array<string>
      if (this.flags.controllers !== undefined) {
        parsedControllers = parseControllers(this.flags.controllers)
      } else if (did !== undefined) {
        parsedControllers = parseControllers(did)
      } else {
        throw new Error('No DID to assign as a controller')
      }
      const parsedContent = parseContent(this.args.content)

      const localDeterministic =
        this.flags.deterministic !== undefined ? this.flags.determinitic : false

      const metadata = {
        controllers: parsedControllers,
        schema: this.args.schema,
        deterministic: localDeterministic,
      }

      const tile = await TileDocument.create(this.ceramic, parsedContent, metadata, {
        anchor: !this.flags['only-genesis'],
        publish: !this.flags['only-genesis'],
      })

      this.spinner.succeed(`Created Stream ${tile.commitId.toString()}.`)
      this.logJSON({
        streamID: tile.id.toString(),
        commitId: tile.commitId.toString(),
        body: tile.content,
      })
    } catch (e) {
      console.error(e)
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
