import { StreamID } from '@ceramicnetwork/streamid'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'

export default class List extends Command<
  CommandFlags,
  {
    streamId: string
  }
> {
  static description = 'List pinned Streams'
  static args = [
    {
      name: 'streamId',
      required: true,
      description: 'StreamID to be queried',
    },
  ]

  async run(): Promise<void> {
    this.spinner.start(`Listing Streams related to ... ${this.args.streamId}`)
    try {
      const pinnedStreamIds = []

      const iterator = await this.ceramic.pin.ls(StreamID.fromString(this.args.streamId))
      for await (const id of iterator) {
        pinnedStreamIds.push(id)
      }
      this.spinner.succeed('Streams listed below.')
      this.log(pinnedStreamIds.toString())
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
