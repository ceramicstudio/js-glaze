import { flags } from '@oclif/command'
import { TileDocument } from '@ceramicnetwork/stream-tile'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'
import { parseControllers, parseContent } from '../../utils'

type Flags = CommandFlags & {
  controllers?: string
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
    { name: 'streamId', description: 'Document StreamID', required: true },
    { name: 'content', description: 'Document Content', required: true },
  ]
  static flags = {
    ...Command.flags,

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
      const parsedContent = parseContent(this.args.content)
      let parsedControllers: Array<string>
      if (this.flags.controllers !== undefined) {
        parsedControllers = parseControllers(this.flags.controllers)
      } else if (did !== undefined) {
        parsedControllers = parseControllers(did)
      } else {
        throw new Error('No DID to assign as a controller')
      }

      const doc = await TileDocument.load(this.ceramic, this.args.streamId)

      const metadata = {
        controllers: parsedControllers,
      }

      await doc.update(parsedContent, metadata)
      this.spinner.succeed('Updated stream')
      this.logJSON({ commitId: doc.commitId.toString(), content: doc.content })
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
