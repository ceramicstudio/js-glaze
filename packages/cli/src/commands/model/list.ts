import { Command, type QueryCommandFlags } from '../../command.js'
import { Flags } from '@oclif/core'
import { Model } from '@ceramicnetwork/stream-model'
import Table from 'cli-table3'
import { StreamID } from '@ceramicnetwork/streamid'

type PartialModelDefinition = {
  id: StreamID
  name: string
  description: string
}

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
      const page = await this.ceramic.index.queryIndex({
        first: 1000,
        model: Model.MODEL,
      })
      const fieldsToDisplay: Array<PartialModelDefinition> = page.edges.map((edge) => {
        const stream = this.ceramic.buildStreamFromState(edge.node)
        return {
          id: stream.id,
          name: (stream.content as Record<string, any>).name,
          description: (stream.content as Record<string, any>).description,
        }
      })
      if (this.flags.table === true) {
        const table = new Table({
          head: ['Name', 'ID', 'Description'],
          colWidths: [32, 65, 100],
        })
        fieldsToDisplay.forEach((field) => {
          table.push([field.name, field.id.toString(), field.description])
        })
        // Not using the spinner here, so that the table is laid out properly
        this.log(table.toString())
      } else {
        console.log(JSON.stringify(fieldsToDisplay))
      }
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
