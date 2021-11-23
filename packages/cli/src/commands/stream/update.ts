import { flags } from '@oclif/command'
import { TileDocument } from '@ceramicnetwork/stream-tile'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'
import { parseControllers } from '../../utils'

type Flags = CommandFlags & {
  controller?: string
  did?: string
}

export default class Update extends Command<
  Flags,
  {
    streamId: string
    content: string
  }
> {
  static description = 'Update a stream'

  static args = [
    {
      name: 'streamId',
      description: 'Document StreamID',
      required: true,
    },
    {
      name: 'content',
      description: 'Document Content',
      required: true,
      parse: JSON.parse,
    },
  ]
  static flags = {
    ...Command.flags,

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
    this.spinner.start('Updating stream...')

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

      const doc = await TileDocument.load(this.ceramic, this.args.streamId)

      const metadata = {
        controller: parsedControllers,
      }

      await doc.update(this.args.content, metadata)
      this.spinner.succeed('Updated stream')
      this.logJSON({ commitId: doc.commitId.toString(), content: doc.content })
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
