import { TileDocument } from '@ceramicnetwork/stream-tile'
import { flags } from '@oclif/command'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'
import { parseControllers } from '../../utils'

type Flags = CommandFlags & {
  'only-genesis'?: boolean

  did?: string
  controller?: string
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
      parse: JSON.parse,
    },
  ]
  static flags = {
    ...Command.flags,
    'only-genesis': flags.boolean({
      char: 'g',
      description: 'Only create the genesis object. No anchor will be created',
      default: false,
    }),

    did: flags.string({
      exclusive: ['key'],
      description: 'Creator DID',
    }),
    controller: flags.string({
      char: 'c',
      description: 'Comma separated list of controller',
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
      if (this.flags.controller !== undefined) {
        parsedControllers = parseControllers(this.flags.controller)
      } else if (did !== undefined) {
        parsedControllers = parseControllers(did)
      } else {
        throw new Error('No DID to assign as a controller')
      }

      const metadata = {
        controller: parsedControllers,
        schema: undefined,
      }

      const tile = await TileDocument.create(this.ceramic, this.args.content, metadata, {
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
