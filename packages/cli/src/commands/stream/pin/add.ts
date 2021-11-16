import { Command } from '../../../command'
import type { CommandFlags } from '../../../command'

import { StreamID } from '@ceramicnetwork/streamid'

export default class Add extends Command<
  CommandFlags,
  {
    streamId: string
  }
> {
  static description = 'Pin stream'
  static args = [{ name: 'streamId', required: true, description: 'Stream ID' }]

  async run(): Promise<void> {
    this.spinner.start('Pinning stream...')
    try {
      const result = await this.ceramic.pin.add(StreamID.fromString(this.args.streamId))
      this.spinner.succeed('Stream pinned.')
      this.log(JSON.stringify(result, null, 2))
    } catch (e) {
      this.spinner.fail((e as Error).message)
      throw e
    }
  }
}
