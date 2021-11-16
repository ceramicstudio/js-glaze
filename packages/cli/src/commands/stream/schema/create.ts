import { TileDocument } from '@ceramicnetwork/stream-tile'
import { flags } from '@oclif/command'

import { Command } from '../../../command'
import type { CommandFlags } from '../../../command'
import { parseContent, parseControllers } from '../../../utils'

type Flags = CommandFlags & {
  did?: string
  determinitic?: boolean
  'only-genesis'?: boolean
}

export default class Create extends Command<
  Flags,
  {
    content: string
    controllers?: string
  }
> {
  static description = 'Create a new Schema'

  static args = [
    {
      name: 'content',
      description: 'Schema Body',
      required: true,
    },
    {
      name: 'controllers',
      description: 'Controllers for the Schema',
      required: false,
    },
  ]
  static flags = {
    ...Command.flags,
    deterministic: flags.boolean({
      char: 'd',
      description:
        'Document content is created deterministically from the inputs.  This means ' +
        'that creating a schema document with identical content to an existing schema document ' +
        'will be a no-op.',
      default: false,
    }),
    did: flags.string({
      exclusive: ['key'],
      description: 'Creator DID',
    }),
    'only-genesis': flags.boolean({
      char: 'g',
      description: 'Only create the genesis object. No anchor will be created',
      default: false,
    }),
  }

  async run(): Promise<void> {
    this.spinner.start('Creating Schema...')
    let did: any
    if (this.flags.key != null) {
      did = this.authenticatedDID.id
    } else if (this.flags.did !== null) {
      did = this.flags.did
    } else {
      throw new Error('Missing DID')
    }
    try {
      const parsedControllers = parseControllers(did)
      const parsedContent = parseContent(this.args.content)

      const localDeterministic =
        this.flags.deterministic != undefined ? this.flags.determinitic : false

      const metadata = {
        controllers: parsedControllers,
        schema: undefined,
        deterministic: localDeterministic,
      }

      const tile = await TileDocument.create(this.ceramic, parsedContent, metadata, {
        anchor: !this.flags['only-genesis'],
        publish: !this.flags['only-genesis'],
      })

      this.spinner.succeed(`Created Schema ${this.chalk.bold.green(tile.id)}.`)
      this.logJSON({
        streamId: tile.id.toString(),
        commitId: tile.commitId.toString(),
        content: tile.content,
      })
    } catch (e) {
      this.spinner.fail((e as Error).message)
      throw e
    }
  }
}
