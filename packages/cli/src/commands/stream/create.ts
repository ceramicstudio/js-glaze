import { flags } from '@oclif/command'
import { TileDocument } from '@ceramicnetwork/stream-tile'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'
import { StreamMetadata } from '@ceramicnetwork/common'

type Flags = CommandFlags & {
  'only-genesis'?: boolean
  metadata?: StreamMetadata
}

export default class Create extends Command<
  Flags,
  {
    content: string
  }
> {
  static description = 'Create a new Stream'

  static args = [
    {
      name: 'content',
      description: 'the Stream body',
      required: true,
      parse: JSON.parse,
    },
  ]

  static flags = {
    ...Command.flags,
    'only-genesis': flags.boolean({
      char: 'g',
      description: 'only generate genesis block',
      default: false,
    }),
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
      const metadata = this.flags.metadata || { controllers: [did] }

      metadata?.controllers ? undefined : (metadata.controllers = [did])

      const tile = await TileDocument.create(this.ceramic, this.args.content, metadata, {
        anchor: !this.flags['only-genesis'],
        publish: !this.flags['only-genesis'],
      })

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
