import { CeramicClient } from '@ceramicnetwork/http-client'
import { DataModel } from '@glazed/datamodel'
import { ModelManager } from '@glazed/devtools'
import type { EncodedManagedModel, PublishedModel } from '@glazed/types'

import { config } from './config'
import { read } from './fs'

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

export async function publishManagedModel(
  ceramic: CeramicClient,
  model: EncodedManagedModel
): Promise<PublishedModel> {
  return await ModelManager.fromJSON(ceramic, model).toPublished()
}

export async function createDataModel(
  ceramic: CeramicClient,
  name: string
): Promise<DataModel<PublishedModel>> {
  const model = await publishManagedModel(ceramic, await loadManagedModel(name))
  return new DataModel<PublishedModel>({ ceramic, model })
}
