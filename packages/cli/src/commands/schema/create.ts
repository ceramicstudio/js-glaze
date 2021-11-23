import { TileDocument } from '@ceramicnetwork/stream-tile'
import { flags } from '@oclif/command'

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
    content: string
  }
> {
  static description = 'Create a new Schema'

  static args = [
    {
      name: 'content',
      required: true,
      description: 'Schema Body',
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
    'only-genesis': flags.boolean({
      char: 'g',
      description: 'Only create the genesis object. No anchor will be created',
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
    this.spinner.start('Creating Schema...')
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
        schema: undefined,
        deterministic: localDeterministic,
      }

      const tile = await TileDocument.create(this.ceramic, parsedContent, metadata, {
        anchor: !this.flags['only-genesis'],
        publish: !this.flags['only-genesis'],
      })

      this.spinner.succeed(`Created Schema ${tile.id.toString()}.`)
      this.logJSON({
        streamId: tile.id.toString(),
        commitId: tile.commitId.toString(),
        content: tile.content,
      })
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
