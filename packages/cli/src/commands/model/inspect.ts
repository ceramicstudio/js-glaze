import { CliUx } from '@oclif/core'
import chalk from 'chalk'

import { Command, type CommandFlags } from '../../command.js'

type Args = {
  name: string
}

export default class InspectModel extends Command<CommandFlags, Args> {
  static description = 'inspect a model'

  static flags = Command.flags

  static args = [{ name: 'name', description: 'local model name or package', required: true }]

  async run(): Promise<void> {
    this.spinner.start('Loading model...')
    try {
      const { name } = this.args
      const manager = await this.getModelManager(name)
      const model = manager.model

      const tree = CliUx.ux.tree()
      this.spinner.succeed(`Loaded model ${name}`)
      this.log('model')

      const schemasTree = CliUx.ux.tree()
      for (const [id, schema] of Object.entries(model.schemas)) {
        const schemaTree = CliUx.ux.tree()
        schemaTree.insert(`alias: ${chalk.green(schema.alias)}`)
        schemaTree.insert(`version: ${chalk.magenta(schema.version)}`)

        const dependenciesTree = CliUx.ux.tree()
        for (const [depID, depProp] of Object.entries(schema.dependencies)) {
          dependenciesTree.insert(`${chalk.blue(depProp)}: ${chalk.yellow(depID)}`)
        }
        schemaTree.insert('dependencies', dependenciesTree)

        schemasTree.insert(chalk.yellow(id), schemaTree)
      }
      tree.insert('schemas', schemasTree)

      const definitionsTree = CliUx.ux.tree()
      for (const [id, definition] of Object.entries(model.definitions)) {
        const definitionTree = CliUx.ux.tree()
        definitionTree.insert(`alias: ${chalk.green(definition.alias)}`)
        definitionTree.insert(`version: ${chalk.magenta(definition.version)}`)
        definitionTree.insert(`schema: ${chalk.yellow(definition.schema)}`)
        definitionsTree.insert(chalk.yellow(id), definitionTree)
      }
      tree.insert('definitions', definitionsTree)

      const tilesTree = CliUx.ux.tree()
      for (const [id, tile] of Object.entries(model.tiles)) {
        const tileTree = CliUx.ux.tree()
        tileTree.insert(`alias: ${chalk.green(tile.alias)}`)
        tileTree.insert(`version: ${chalk.magenta(tile.version)}`)
        tileTree.insert(`schema: ${chalk.yellow(tile.schema)}`)
        tilesTree.insert(chalk.yellow(id), tileTree)
      }
      tree.insert('tiles', tilesTree)

      tree.display()
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
