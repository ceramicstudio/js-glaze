import { DIDDataStore } from '@glazed/did-datastore'
import { Flags } from '@oclif/core'
import chalk from 'chalk'
import Listr from 'listr'
import type { ListrTask } from 'listr'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import UpdaterRenderer from 'listr-update-renderer'

import { Command, type CommandFlags } from '../../command.js'
import { EMPTY_MODEL } from '../../model.js'

type Flags = CommandFlags & {
  did?: string
}

export default class InspectDID extends Command<Flags> {
  static description = 'inspect the contents of a DID DataStore'

  static flags = {
    ...Command.flags,
    did: Flags.string({ description: 'DID', exclusive: ['key'] }),
  }

  async run(): Promise<void> {
    this.spinner.start('Loading Index stream...')
    try {
      let did: string
      if (this.flags.key != null) {
        did = this.authenticatedDID.id
      } else if (this.flags.did != null) {
        did = this.flags.did
      } else {
        throw new Error('Missing DID')
      }

      const store = new DIDDataStore({ ceramic: this.ceramic, model: EMPTY_MODEL })
      const index = await store.getIndex(did)
      if (index == null) {
        this.spinner.warn('Index stream is empty')
        return
      }

      this.spinner.succeed('Index stream loaded')

      const tasks = Object.keys(index).map((key) => {
        return {
          title: `${chalk.yellow(key)}`,
          task: () => {
            const getDef = store.getDefinition(key)
            return new Listr([
              {
                title: 'Load definition...',
                task: async (_ctx, task) => {
                  const def = await getDef
                  let title = `Definition: ${chalk.green(def.name)}`
                  if (def.description != null) {
                    title += ` (${def.description})`
                  }
                  if (def.url != null) {
                    title += ` - ${def.url}`
                  }
                  task.title = title
                },
              },
              {
                title: 'Check record...',
                task: (_ctx, task) => {
                  const recordID = index[key]
                  task.title = `Record: ${recordID ? chalk.magenta(recordID) : chalk.red('(none)')}`
                },
              },
              {
                title: 'Check schema...',
                task: async (_ctx, task) => {
                  const def = await getDef
                  task.title = `Schema: ${chalk.magenta(def.schema)}` ?? 'No Schema'
                },
              },
            ])
          },
        } as ListrTask
      })
      const list = new Listr(tasks, {
        concurrent: true,
        exitOnError: false,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        renderer: UpdaterRenderer,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        collapse: false,
      })
      await list.run()
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
