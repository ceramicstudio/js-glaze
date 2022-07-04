import { Command, type QueryCommandFlags } from '../../command.js'
import { Flags } from '@oclif/core'
import { CliUx } from '@oclif/core'
import { Model } from '@ceramicnetwork/stream-model'
import Table from 'cli-table3'
import { Edge, Page, PageInfo, StreamState} from '@ceramicnetwork/common'

type PartialModelDefinition = {
  id: string
  name: string
  description: string
}

type ModelListFlags = QueryCommandFlags & {
  table?: boolean
}

export default class ModelList extends Command<ModelListFlags> {
  PAGE_SIZE = 34

  fetchedFields: Array<PartialModelDefinition> = []
  lastLoadedPageInfo: PageInfo | null = null

  static description = 'load a list of models with pagination'

  static flags = {
    ...Command.flags,
    table: Flags.boolean({
      description: 'display the results as a table',
    }),
  }

  async run(): Promise<void> {
    try {
      console.clear()
      this.log('Loading models...')
      const page = await this.ceramic.index.queryIndex({
        first: this.PAGE_SIZE,
        model: Model.MODEL,
      })
      this.lastLoadedPageInfo = page.pageInfo
      this.fetchedFields = this.fetchedFields.concat(this.getFieldsFromEdges(page.edges))
      this.displayPartialDefinitions(this.fetchedFields)

      while (this.lastLoadedPageInfo?.hasNextPage) {
        await CliUx.ux.anykey('Press any key to load more models')
        this.log('Loading models...')
        const nextPage: Page<StreamState> = await this.ceramic.index.queryIndex({
          first: this.PAGE_SIZE,
          model: Model.MODEL,
          after: this.lastLoadedPageInfo?.endCursor,
        })
        this.lastLoadedPageInfo = nextPage.pageInfo
        this.fetchedFields = this.fetchedFields.concat(this.getFieldsFromEdges(nextPage.edges))
        this.displayPartialDefinitions(this.fetchedFields)
      }
      this.log('Finished loading models')
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }

  getFieldsFromEdges(edges: Array<Edge<StreamState>>): Array<PartialModelDefinition> {
    return edges.map((edge) => {
      const stream = this.ceramic.buildStreamFromState(edge.node)
      return {
        id: stream.id.toString(),
        name: (stream.content as Record<string, any>).name,
        description: (stream.content as Record<string, any>).description,
      }
    })
  }

  displayPartialDefinitions(definitions: Array<PartialModelDefinition>): void {
    console.clear()
    if (this.flags.table === true) {
      const table = new Table({
        head: ['#', 'Name', 'ID', 'Description'],
        colWidths: [4, 32, 65, 100],
      })
      definitions.forEach((definition, index) => {
        table.push([index + 1, definition.name, definition.id.toString(), definition.description])
      })
      // Not using the spinner here, so that the table is laid out properly
      this.log(`${table.toString()}\n`)
    } else {
      let output = ''
      definitions.forEach((definition) => {
        output += `${JSON.stringify(definition)}\n`
      })
      this.log(output)
    }
  }
}
