import { Command, type QueryCommandFlags } from '../../command.js'
import { Flags } from '@oclif/core'
import { CliUx } from '@oclif/core'
import { Model } from '@ceramicnetwork/stream-model'
import Table from 'cli-table3'
import { Page, StreamState } from '@ceramicnetwork/common'

type PartialModelDefinition = {
  idString: string
  name: string
  description: string
}

type ModelListFlags = QueryCommandFlags & {
  table?: boolean
}

export default class ModelList extends Command<ModelListFlags> {
  PAGE_SIZE = 3

  lastLoadedPage: Page<StreamState> | null = null

  static description = 'load a list of models with optional pagination'

  static flags = {
    ...Command.flags,
    table: Flags.boolean({
      description: 'display the results as a table',
    }),
  }

  async run(): Promise<void> {
    try {
      this.lastLoadedPage = await this.ceramic.index.queryIndex({
        first: this.PAGE_SIZE,
        model: Model.MODEL,
      })

      this.displayPage(this.lastLoadedPage)

      while (this.lastLoadedPage.pageInfo.hasNextPage) {
        await CliUx.ux.anykey('Press any key to load the next page')
        this.lastLoadedPage = await this.ceramic.index.queryIndex({
          first: this.PAGE_SIZE,
          model: Model.MODEL,
          after: this.lastLoadedPage?.pageInfo.endCursor,
        })
        this.displayPage(this.lastLoadedPage)
      }
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }

  displayPage(page: Page<StreamState>): void {
    const fields: Array<PartialModelDefinition> = page.edges.map((edge) => {
      const stream = this.ceramic.buildStreamFromState(edge.node)
      return {
        idString: stream.id.toString(),
        name: (stream.content as Record<string, any>).name,
        description: (stream.content as Record<string, any>).description,
      }
    })

    if (this.flags.table === true) {
      const table = new Table({
        head: ['Name', 'ID', 'Description'],
        colWidths: [32, 65, 100],
      })
      fields.forEach((field) => {
        table.push([field.name, field.idString.toString(), field.description])
      })
      // Not using the spinner here, so that the table is laid out properly
      this.log(table.toString())
    } else {
      this.log(JSON.stringify(fields))
    }
  }
}
