import { flags } from '@oclif/command'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import type { TileMetadataArgs } from '@ceramicnetwork/stream-tile'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'

type Flags = CommandFlags & {
  metadata?: TileMetadataArgs
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
      const doc = await TileDocument.load(this.ceramic, this.args.streamId)

      const metadata = this.flags.metadata || { controllers: [did] }

      metadata?.controllers ? undefined : (metadata.controllers = [did])

      await doc.update(this.args.content, metadata)
      this.spinner.succeed('Updated stream')
      this.logJSON({ commitId: doc.commitId.toString(), content: doc.content })
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
