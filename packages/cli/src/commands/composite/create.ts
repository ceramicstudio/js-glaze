import { Composite } from '@glazed/devtools'
import { Command, type CommandFlags } from '../../command.js'

export default class CreateComposite extends Command<CommandFlags, { graphQLSchemaString: string }> {
  static description = 'create a Composite (a list of Model Streams) from a graphQL Schema Definition Language definition'

  static args = [
    {
      name: 'graphQLSchemaString',
      required: true,
      description: 'A graphQL SDL definition of the Composite encoded as a string',
    },
  ]

  async run(): Promise<void> {
    this.spinner.start('Creating the composite...')
    try {
      const composite = await Composite.create({
        ceramic: this.ceramic,
        schema: this.args.graphQLSchemaString
      })
      const runtimeAsJSON = JSON.stringify(composite.toRuntime(), null, 4)
      this.spinner.succeed(`Created composite with runtime representation: ${runtimeAsJSON}.`)
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
