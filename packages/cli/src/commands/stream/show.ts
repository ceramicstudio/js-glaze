import { TileDocument } from '@ceramicnetwork/stream-tile'
import StreamID from '@ceramicnetwork/streamid'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'

export default class Show extends Command<
  CommandFlags,
  {
    streamId: string
  }
> {
  static description = 'Show content of a Stream'
  static args = [
    {
      name: 'streamId',
      required: true,
      description: 'StreamID to be queried',
    },
  ]

  async run(): Promise<void> {
    this.spinner.start(`Querying stream ${this.args.streamId}`)
    try {
      const stream = await TileDocument.load(this.ceramic, StreamID.fromString(this.args.streamId))
      this.spinner.succeed(`Retrieved details of stream ${this.args.streamId}`)
      this.logJSON(stream.content)
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
