import { StreamID } from '@ceramicnetwork/streamid'

import { Command, type CommandFlags } from '../../command.js'

export default class List extends Command<CommandFlags, { streamId?: string }> {
  static description = 'list pinned streams'

  static args = [
    {
      name: 'streamId',
      description: 'optional stream ID filter',
    },
  ]

  async run(): Promise<void> {
    this.spinner.start('Loading pins list... \n')
    try {
      const id = this.args.streamId ? StreamID.fromString(this.args.streamId) : undefined
      const iterator = await this.ceramic.pin.ls(id)
      for await (const id of iterator) {
        this.log(id.toString())
      }
      this.spinner.succeed('Loaded pins list.')
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
