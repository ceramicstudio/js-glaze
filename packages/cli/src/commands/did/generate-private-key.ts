import { randomBytes } from 'crypto'
import { toString } from 'uint8arrays'

import { Command } from '../../command.js'

export default class GeneratePrivateKey extends Command {
  static description = 'generate a random 32 bytes private key'

  static flags = Command.flags

  async run(): Promise<void> {
    try {
      this.spinner.start('Generating random private key...')
      const seed = new Uint8Array(randomBytes(32))
      this.spinner.succeed('Generating random private key... Done!')
      // Logging the seed to stdout, so that it can be piped using standard I/O or redirected to a file
      this.log(toString(seed, 'base16'))
      return Promise.resolve()
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
