import { Composite } from '@glazed/devtools'
import { Command, type CommandFlags } from '../../command.js'
import { Flags } from '@oclif/core'
import fs from 'fs-extra'
import Table from 'cli-table3'

type CompositeModelInfo = {
  id: string
  name: string
  description: string
  alias?: string
}

export default class CompositeModels extends Command<CommandFlags, { compositePath: string }> {
  static description = 'display the list of models included in a composite'

  static args = [
    {
      name: 'compositePath',
      required: true,
      description: 'A path to encoded composite definition',
    },
  ]

  static flags = {
    ...Command.flags,
    'id-only': Flags.boolean({
      description: `display only model streamIDs`,
    }),
    table: Flags.boolean({
      description: 'display results in a table',
    }),
  }

  async run(): Promise<void> {
    try {
      if (this.flags['id-only'] === true && this.flags.table === true) {
        this.spinner.fail(`--id-only and --table cannot be used together`)
        return
      }

      const encoded = await fs.readFile(this.args.compositePath, { encoding: 'utf-8' })
      const composite = await Composite.fromJSON({
        ceramic: this.ceramic,
        definition: JSON.parse(encoded),
      })
      if (this.flags['id-only'] === true) {
        this.spinner.succeed(JSON.stringify(Object.keys(composite.toParams().definition.models)))
      } else if (this.flags.table === true) {
        const table = new Table({
          head: ['Name', 'ID', 'Alias', 'Description'],
          colWidths: [32, 65, 32, 100],
        })
        const internalDefinition = composite.toParams().definition
        Object.entries(internalDefinition.models).map(([modelStreamID, modelDefinition]) => {
          table.push([
            modelDefinition.name,
            modelStreamID,
            internalDefinition.aliases && internalDefinition.aliases[modelStreamID]
              ? internalDefinition.aliases[modelStreamID]
              : '(none)',
            modelDefinition.description || '',
          ])
        })
        console.log(table.toString())
      } else {
        const result: Array<CompositeModelInfo> = []
        const internalDefinition = composite.toParams().definition
        Object.entries(internalDefinition.models).map(([modelStreamID, modelDefinition]) => {
          const modelInfo: CompositeModelInfo = {
            id: modelStreamID,
            name: modelDefinition.name,
            description: modelDefinition.description || '',
          }
          if (
            internalDefinition.aliases &&
            internalDefinition.aliases[modelStreamID] !== undefined
          ) {
            modelInfo.alias = internalDefinition.aliases[modelStreamID]
          }
          result.push(modelInfo)
        })
        // Not using the spinner here, so that the output can be piped using standard I/O
        console.log(JSON.stringify(result, null, 2))
      }
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
