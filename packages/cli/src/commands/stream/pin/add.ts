import { StreamID } from '@ceramicnetwork/streamid'

import { Command } from '../../../command'
import type { CommandFlags } from '../../../command'

export default class Add extends Command<
  CommandFlags,
  {
    streamId: string
  }
> {
  static description = 'Pin Stream'
  static args = [{ name: 'streamId', required: true, description: 'StreamID' }]

  async run(): Promise<void> {
    this.spinner.start(`Pinning stream ${this.args.streamId}...`)
    try {
      const result = await this.ceramic.pin.add(StreamID.fromString(this.args.streamId))
      this.spinner.succeed('Stream pinned.')
      this.logJSON(result)
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
