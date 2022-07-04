import { Command, type CommandFlags } from '../../command.js'
import { readEncodedComposite } from '@glazed/devtools-node'

export default class CompositeDeploy extends Command<CommandFlags, { compositePath: string }> {
  static description = 'deploy models included in the composite on connected ceramic node'

  static args = [
    {
      name: 'compositePath',
      required: true,
      description: 'A path to encoded composite definition',
    },
  ]

  async run(): Promise<void> {
    try {
      const composite = await readEncodedComposite(this.ceramic, this.args.compositePath)
      this.spinner.succeed(
        `Deployed composite's models with streamIDs: ${JSON.stringify(
          Object.keys(composite.toParams().definition.models)
        )}`
      )
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
