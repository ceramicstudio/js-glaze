import { flags } from '@oclif/command'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import type { TileMetadataArgs } from '@ceramicnetwork/stream-tile'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'

type Flags = CommandFlags & {
  metadata?: TileMetadataArgs
}

export default class Deterministic extends Command<
  Flags,
  {
    content: string
  }
> {
  static description = 'Create a new deterministic Stream'

  static args = [
    {
      name: 'content',
      description: 'The contents of the stream',
      required: true,
    },
  ]

  static flags = {
    ...Command.flags,
    metadata: flags.string({
      char: 'm',
      description: 'Stream Metadata',
      parse: JSON.parse,
    }),
  }

  async run(): Promise<void> {
    this.spinner.start('Creating stream...')
    let did: string | undefined
    if (this.flags.key != null) {
      did = this.authenticatedDID.id
    } else {
      throw new Error('No DID cached, please provide your key.')
    }
    try {
      const metadata = {
        ...this.flags.metadata,
        deterministic: true,
      } || {
        controllers: [did],
        deterministic: true,
      }

      metadata?.controllers ? undefined : (metadata.controllers = [did])

      const tile = await TileDocument.create(this.ceramic, this.args.content, metadata)

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
