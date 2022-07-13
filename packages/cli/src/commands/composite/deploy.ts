import { Command, type CommandFlags } from '../../command.js'
import { readEncodedComposite } from '@glazed/devtools-node'
import { Composite } from '@glazed/devtools'
import { EncodedCompositeDefinition } from '@glazed/types'

export default class CompositeDeploy extends Command<
  CommandFlags,
  { compositePath: string | undefined }
> {
  static description = 'deploy models included in the composite on connected ceramic node'

  static args = [
    {
      name: 'compositePath',
      required: false,
      description: 'A path to encoded composite definition',
    },
  ]

  async run(): Promise<void> {
    try {
      this.spinner.start('Deploying the composite...')
      let composite: Composite | undefined = undefined
      if (this.stdin !== undefined) {
        const definition = JSON.parse(this.stdin) as EncodedCompositeDefinition
        composite = await Composite.fromJSON({ ceramic: this.ceramic, definition })
      } else if (this.args.compositePath !== undefined) {
        composite = await readEncodedComposite(this.ceramic, this.args.compositePath)
      } else {
        this.spinner.fail(
          'You need to pass the composite definition either in stdin or as the compositePath param'
        )
        return
      }
      this.spinner.succeed(`Deploying the composite... Done!`)
      // Logging the model stream IDs to stdout, so that they can be piped using standard I/O or redirected to a file
      this.log(JSON.stringify(Object.keys(composite.toParams().definition.models)))
    } catch (e) {
      this.spinner.fail((e as Error).message)
      return
    }
  }
}
