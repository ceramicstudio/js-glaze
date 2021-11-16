import { flags } from '@oclif/command'
import { TileDocument } from '@ceramicnetwork/stream-tile'

import { Command } from '../../../command'
import type { CommandFlags } from '../../../command'
import { parseControllers, parseContent } from '../../../utils'

type Flags = CommandFlags & {
  controllers?: string
}

export default class Update extends Command<
  Flags,
  {
    streamId: string
    content: string
  }
> {
  static description = 'Update a Schema'
  static args = [
    { name: 'streamId', description: 'Schema streamId to be updated' },
    { name: 'content', description: 'updated schema structure' },
  ]

  static flags = {
    ...Command.flags,
    controllers: flags.string({
      char: 'c',
      description: 'Change controllers of this document',
    }),
  }

  async run(): Promise<void> {
    this.spinner.start('Updating Schema...')

    let did: any
    if (this.flags.key != null) {
      did = this.authenticatedDID.id
    } else if (this.flags.did !== null) {
      did = this.flags.did
    } else {
      throw new Error('Missing DID')
    }

    try {
      const doc = await TileDocument.load(this.ceramic, this.args.streamId)

      const parsedControllers = parseControllers(this.flags.controllers || did)
      const parsedContent = parseContent(this.args.content)

      const metadata = {
        controllers: parsedControllers,
      }

      await doc.update(parsedContent, metadata)
      this.spinner.succeed('Updated Schema')
      this.logJSON({
        streamId: doc.id.toString(),
        commitId: doc.commitId.toString(),
        content: doc.content,
      })
    } catch (e) {
      this.spinner.fail((e as Error).message)
      throw e
    }
  }
}
