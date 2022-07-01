import { Command, type QueryCommandFlags } from '../../command.js'
import { Flags } from '@oclif/core'

type ModelListFlags = QueryCommandFlags & {
  table?: boolean
}

export default class ModelList extends Command<ModelListFlags> {
  static description = 'load a list of models with optional pagination'

  static flags = {
    ...Command.flags,
    table: Flags.boolean({
      description: 'display the results as a table',
    }),
  }

  async run(): Promise<void> {
    try {
      // const results = await this.ceramic.index.queryIndex({
      //   first: 1000,
      //   model: Model.MODEL,
      // })
      // const modelDefinitions = buildModelDefinitionsFromStreamStates(results.entries)
      //
      // if (this.flags.table === true) {
      //   const table = new Table({
      //     head: ['Name', 'ID', 'Alias', 'Description'],
      //     colWidths: [32, 65, 32, 100],
      //   })
      //
      // } else {
      //   console.log(JSON.stringify(modelDefinitions))
      // }
      return Promise.resolve()
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
