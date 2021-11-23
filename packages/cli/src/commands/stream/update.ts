import { flags } from '@oclif/command'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import type { StreamMetadata } from '@ceramicnetwork/common'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'
import { parseControllers } from '../../utils'

type Flags = CommandFlags & {
  controller?: string
  metadata?: StreamMetadata
}

export default class Update extends Command<
  Flags,
  {
    content: string
    streamId: string
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
    controller: flags.string({
      char: 'c',
      description:
        'Stream Controller, once set this is the only DID that will be able to update the stream.',
    }),
    metadata: flags.string({
      char: 'm',
      description: 'Optional metadata for the stream.',
      parse: JSON.parse,
    }),
  }

  async run(): Promise<void> {
    this.spinner.start('Updating stream...')

    let did: string | undefined
    if (this.flags.key != null) {
      did = this.authenticatedDID.id
    } else {
      throw new Error('No DID cached, please provide your key.')
    }
    try {
      let parsedControllers: Array<string>
      if (this.flags.controller !== undefined) {
        parsedControllers = parseControllers(this.flags.controller)
      } else if (did !== undefined) {
        parsedControllers = parseControllers(did)
      } else {
        throw new Error('No DID cached, please provide your key.')
      }

      const doc = await TileDocument.load(this.ceramic, this.args.streamId)

      const metadata = {
        controllers: this.flags.metadata?.controllers || parsedControllers,
        tags: this.flags.metadata?.tags || [],
        family: this.flags.metadata?.family || '',
        schema: this.flags.metadata?.schema || '',
      }

      await doc.update(this.args.content, metadata)
      this.spinner.succeed('Updated stream')
      this.logJSON({ commitId: doc.commitId.toString(), content: doc.content })
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
