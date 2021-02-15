import Table from 'cli-table3'

import { Command } from '../../command'

export default class ListDIDs extends Command {
  static description = 'list the DIDs stored locally'

  async run(): Promise<void> {
    const cfg = await this.getConfig()
    const dids = cfg.get('dids')
    const keys = Object.keys(dids)

    if (keys.length === 0) {
      this.spinner.info('No DID stored locally')
    } else {
      const table = new Table({ head: ['DID', 'Label', 'Created'] })
      for (const did of keys) {
        const { label, createdAt } = dids[did]
        table.push([did, label ?? '(no label)', new Date(createdAt).toString()])
      }
      this.log(table.toString())
    }
  }
}
