import { definitions, schemas } from '@ceramicstudio/idx-constants'
import Listr from 'listr'
import type { ListrTask } from 'listr'
// @ts-ignore
import UpdaterRenderer from 'listr-update-renderer'

import { Command } from '../../command'
import type { CommandFlags } from '../../command'
import { getPublicDID } from '../../config'

function reverse(record: Record<string, string>): Record<string, string> {
  return Object.entries(record).reduce((acc, [key, value]) => {
    acc[value] = key
    return acc
  }, {} as Record<string, string>)
}

const DEFINITIONS_LOOKUP = reverse(definitions)
const SCHEMAS_LOOKUP = reverse(schemas)

export default class InspectIndex extends Command<CommandFlags, { did: string }> {
  static description = 'inspect the contents of an IDX document'

  static flags = Command.flags

  static args = [{ name: 'did', description: 'DID or label', required: true }]

  async run(): Promise<void> {
    this.spinner.start('Loading IDX document...')
    try {
      const did = await getPublicDID(this.args.did)
      if (did == null) {
        this.spinner.fail('No local DID found for given label')
        return
      }

      const idx = await this.getIDX()
      const index = await idx.getIndex(did)
      if (index == null) {
        this.spinner.warn('IDX document is empty')
        return
      }

      this.spinner.succeed('IDX document loaded')

      const tasks = Object.keys(index).map((key) => {
        const keyAlias = DEFINITIONS_LOOKUP[key]
        return {
          title: keyAlias ? `${key} (IDX ${keyAlias})` : key,
          task: () => {
            const getDef = idx.getDefinition(key)
            return new Listr([
              {
                title: 'Load definition...',
                task: async (_ctx, task) => {
                  const def = await getDef
                  let title = `Definition: ${def.name}`
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
                title: 'Check schema...',
                task: async (_ctx, task) => {
                  const def = await getDef
                  const schemaAlias = SCHEMAS_LOOKUP[def.schema]
                  task.title = schemaAlias
                    ? `Schema: ${def.schema} (IDX ${schemaAlias})`
                    : `Schema: ${def.schema}` ?? 'No Schema'
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
        // @ts-ignore
        collapse: false,
      })
      await list.run()
    } catch (err) {
      this.spinner.fail((err as Error).message)
    }
  }
}
