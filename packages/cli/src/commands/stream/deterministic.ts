import { flags } from '@oclif/command'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import type { TileMetadataArgs } from '@ceramicnetwork/stream-tile'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'
import { parseControllers } from '../../utils'

type Flags = CommandFlags & {
  controller?: string
  metadata?: TileMetadataArgs
}

export default class Deterministic extends Command<
  Flags,
  {
    content: string
    schemaId?: string
  }
> {
  static description = 'Create a new deterministic Stream'

  static args = [
    {
      name: 'schema',
      description: 'StreamID of desired Schema',
      required: false,
    },
  ]

  static flags = {
    ...Command.flags,
    controller: flags.string({
      char: 'c',
      description:
        'Stream Controller, once set this is the only DID that will be able to update the stream.',
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
      let parsedControllers: Array<string>
      if (this.flags.controller !== undefined) {
        parsedControllers = parseControllers(this.flags.controller)
      } else if (did !== undefined) {
        parsedControllers = parseControllers(did)
      } else {
        throw new Error('No DID to assign as a controller')
      }

      const metadata = {
        controllers: this.flags.metadata?.controllers || parsedControllers,
        tags: this.flags.metadata?.tags || [],
        family: this.flags.metadata?.family || '',
        schema: this.flags.metadata?.schema || '',
        deterministic: true,
        anchor: false,
        publish: false,
      }

      const tile = await TileDocument.create(this.ceramic, metadata)

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
