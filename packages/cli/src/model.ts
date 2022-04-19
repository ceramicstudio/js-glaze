import type { CeramicApi } from '@ceramicnetwork/common'
import { DataModel } from '@glazed/datamodel'
import { ModelManager } from '@glazed/devtools'
import type { EncodedManagedModel, ModelAliases } from '@glazed/types'

import { config } from './config.js'
import { read } from './fs.js'

export const EMPTY_MODEL = { schemas: {}, definitions: {}, tiles: {} }

export async function loadManagedModel(name: string): Promise<EncodedManagedModel> {
  name = config.get('models')[name]?.path ?? name

  if (name.endsWith('.json')) {
    return await read(name)
  }

  let module: { model: EncodedManagedModel }
  try {
    module = (await import(name)) as { model: EncodedManagedModel }
  } catch {
    try {
      module = (await import(`@datamodels/${name}`)) as { model: EncodedManagedModel }
    } catch {
      throw new Error(`Could not load module ${name}`)
    }
  }
  if (module.model == null) {
    throw new Error(`Could not access model from module ${name}`)
  }

  return module.model
}

export async function deployManagedModel(
  ceramic: CeramicApi,
  model: EncodedManagedModel
): Promise<ModelAliases> {
  return await ModelManager.fromJSON({ ceramic, model }).deploy()
}

export async function createDataModel(
  ceramic: CeramicApi,
  name: string
): Promise<DataModel<ModelAliases>> {
  const aliases = await deployManagedModel(ceramic, await loadManagedModel(name))
  return new DataModel<ModelAliases>({ ceramic, aliases })
}
