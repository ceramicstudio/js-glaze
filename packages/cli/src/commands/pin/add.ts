import { StreamID } from '@ceramicnetwork/streamid'

import { Command, type CommandFlags } from '../../command.js'

export default class Add extends Command<CommandFlags, { streamId: string }> {
  static description = 'pin a stream'

  static args = [
    {
      name: 'streamId',
      required: true,
      description: 'ID of stream to be pinned',
    },
  ]

  async run(): Promise<void> {
    this.spinner.start(`Pinning stream ${this.args.streamId}...`)
    try {
      await this.ceramic.pin.add(StreamID.fromString(this.args.streamId))
      this.spinner.succeed('Stream pinned.')
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
