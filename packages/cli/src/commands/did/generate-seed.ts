import { randomBytes } from 'crypto'
import chalk from 'chalk'
import { toString } from 'uint8arrays'

import { Command } from '../../command.js'

export default class GenerateSeed extends Command {
  static description = 'generate a random 32 bytes seed'

  static flags = Command.flags

  // eslint-disable-next-line @typescript-eslint/require-await
  async run(): Promise<void> {
    this.spinner.start('Generating a seed...')
    try {
      const seed = new Uint8Array(randomBytes(32))
      const base32repr = chalk.red(toString(seed, 'base16'))
      this.spinner.succeed(`New random seed: ${base32repr}`)
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
