import { SyncOptions } from '@ceramicnetwork/common/lib/streamopts'
import { TileDocument } from '@ceramicnetwork/stream-tile'

import { 
  Command, 
  type CommandFlags,
  SYNC_OPTIONS_MAP,
} from '../../command.js'

type Flags = CommandFlags & {
  syncOption?: SyncOptions
}

async function parseSyncOption(input: string): Promise<SyncOptions> {
  return new Promise((resolve, reject) => {
    const syncOption = SYNC_OPTIONS_MAP[input]
    if (syncOption) {
      resolve(syncOption)
    } else {
      reject()
    }
  })
}

export default class ShowTile extends Command<Flags, { streamId: string }> {
  static description = 'show the contents of a Tile stream'

  static args = [
    {
      name: 'streamId',
      required: true,
      description: 'ID of the stream',
    },
    {
      name: 'sync',
      required: false,
      options: Object.keys(SYNC_OPTIONS_MAP),
      description: `
      Defines if the tile should be retrieved from node's cache, if it's available, always or never.
      Available choices: 'prefer-cache', 'sync-always', 'sync-never'.
      'prefer-cache' is the default
      `
    },
  ]

  static flags = {
    ...Command.flags,
    syncOption: Flags.integer({
      char: 's',
      options: Object.keys(SYNC_OPTIONS_MAP),
      description: `Controls if the current stream state should be synced over the network or not. 'prefer-cache' will return the state from the node's local cache if present, and will sync from the network if the stream isn't in the cache. 'always-sync' always syncs from the network, even if there is cached state for the stream. 'never-sync' never syncs from the network.`,
      parse: parseSyncOption
    }),
  }

  async run(): Promise<void> {
    this.spinner.start(`Loading stream ${this.args.streamId}`)
    try {
      const stream = await TileDocument.load(
        this.ceramic, 
        this.args.streamId,
        { sync: this.flags.syncOption }
      )
      
      this.spinner.succeed(`Retrieved details of stream ${this.args.streamId}.`)
      this.logJSON(stream.content)
    } catch (e) {
      this.spinner.fail((e as Error).message)
    }
  }
}
