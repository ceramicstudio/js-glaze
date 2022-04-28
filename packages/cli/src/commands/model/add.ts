import { StreamRef } from '@ceramicnetwork/streamid'
import { ModelManager } from '@glazed/devtools'
import type { EncodedManagedModel } from '@glazed/types'
import { Flags } from '@oclif/core'

import { Command, type CommandFlags } from '../../command.js'
import { config } from '../../config.js'
import { read, write } from '../../fs.js'

type Flags = CommandFlags & {
  schema?: string
}

type Args = {
  name: string
  type: 'schema' | 'definition' | 'tile'
  alias: string
  stream: string
}

export default class AddModel extends Command<Flags, Args> {
  static description = 'add a stream to a model'

  static flags = {
    ...Command.flags,
    schema: Flags.string({ name: 'schema', description: 'tile schema' }),
  }

  static args = [
    { name: 'name', required: true },
    { name: 'type', required: true, options: ['schema', 'definition', 'tile'] },
    { name: 'alias', required: true },
    {
      name: 'stream',
      description: 'Stream reference or string-encoded JSON content',
      required: true,
    },
  ]

  async run(): Promise<void> {
    this.spinner.start('Updating model...')
    try {
      const { name, type, alias, stream } = this.args
      const models = config.get('models')
      if (models[name] == null) {
        throw new Error(`Model ${name} does not exist`)
      }

      const model = await read<EncodedManagedModel>(models[name].path)
      const manager = ModelManager.fromJSON({ ceramic: this.ceramic, model })

      try {
        const id = StreamRef.from(stream)
        // eslint-disable-next-line
        // @ts-ignore
        await manager.usePublished(type, alias, id)
      } catch {
        await manager.create(type, alias, JSON.parse(stream), { schema: this.flags.schema })
      }

      await write(models[name].path, manager.toJSON())
      this.spinner.succeed('Model successfully updated')
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
