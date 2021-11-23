import { StreamID } from '@ceramicnetwork/streamid'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'

export default class Remove extends Command<
  CommandFlags,
  {
    streamId: string
  }
> {
  static description = 'Unpin Stream'
  static args = [
    {
      name: 'streamId',
      required: true,
      description: 'StreamID to be unpinned',
    },
  ]

  async run(): Promise<void> {
    this.spinner.start('Unpinning stream...')
    try {
      const result = await this.ceramic.pin.rm(StreamID.fromString(this.args.streamId))
      this.spinner.succeed('Stream unpinned')
      this.log(JSON.stringify(result, null, 2))
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
