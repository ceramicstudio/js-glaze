import { StreamID } from '@ceramicnetwork/streamid'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'

export default class List extends Command<CommandFlags, { streamId?: string }> {
  static description = 'list pinned streams'

  static args = [
    {
      name: 'streamId',
      description: 'optional stream ID filter',
    },
  ]

  async run(): Promise<void> {
    this.spinner.start('Loading pins list...')
    try {
      const id = this.args.streamId ? StreamID.fromString(this.args.streamId) : undefined
      const iterator = await this.ceramic.pin.ls(id)
      const pinnedStreamIds = []
      for await (const id of iterator) {
        pinnedStreamIds.push(id)
      }
      this.spinner.succeed('Loaded pins list.')
      this.log(pinnedStreamIds.toString())
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
