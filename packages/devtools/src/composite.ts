import type { CeramicApi } from '@ceramicnetwork/common'
import type {
  CompositeDefinition,
  CompositeViewsDefinition,
  EncodedCompositeDefinition,
  Model,
  ModelDefinition,
  RuntimeCompositeDefinition,
  StreamCommits,
} from '@glazed/types'
import type { GraphQLSchema } from 'graphql'
import cloneDeep from 'lodash-es/cloneDeep'
import merge from 'lodash-es/merge'

import { decodeSignedMap, encodeSignedMap } from './formats/json.js'
import { createRuntimeDefinition } from './formats/runtime.js'

type StrictCompositeDefinition = Required<CompositeDefinition>

function toStrictDefinition(definition: CompositeDefinition): StrictCompositeDefinition {
  return {
    aliases: {},
    commonShapes: [],
    views: { account: {}, root: {}, models: {} },
    ...definition,
  }
}

function isSupportedVersion(supported: string, check: string): boolean {
  const [supportedMajor] = supported.split('.')
  const [checkMajor] = check.split('.')
  return supportedMajor === checkMajor
}

function assertSupportedVersion(supported: string, check: string): void {
  if (!isSupportedVersion(supported, check)) {
    throw new Error(`Unsupported Composite version ${check}, expected version ${supported}`)
  }
}

function assertModelsHaveCommits(
  models: Record<string, ModelDefinition>,
  commits: Record<string, StreamCommits>
): void {
  for (const id of Object.keys(models)) {
    if (commits[id] == null) {
      throw new Error(`Missing commits for model ${id}`)
    }
  }
}

async function loadModelsFromCommits<Models = Record<string, StreamCommits>>(
  _ceramic: CeramicApi,
  modelsCommits: Models
): Promise<Record<keyof Models, ModelDefinition>> {
  const definitions = await Promise.all(
    Object.values(modelsCommits).map(async (_commits): Promise<Model> => {
      throw new Error('Not implemented')
      // return await Model.fromCommits(ceramic, commits)
    })
  )
  return Object.keys(modelsCommits).reduce((acc, id, index) => {
    const model = definitions[index]
    if (model == null) {
      throw new Error(`Missing Model for id ${id}`)
    }
    const modelID = model.id.toString() as keyof Models
    if (modelID !== id) {
      throw new Error(`Unexpected Model stream ID: expected ${id}, got ${modelID}`)
    }
    acc[modelID] = model.content
    return acc
  }, {} as Record<keyof Models, ModelDefinition>)
}

export type CompositeParams = {
  commits: Record<string, StreamCommits>
  definition: CompositeDefinition
}

export type FromJSONParams = {
  ceramic: CeramicApi
  definition: EncodedCompositeDefinition
}

export type FromSchemaParams = {
  ceramic: CeramicApi
  schema: string | GraphQLSchema
}

export type ComposeInput = Composite | CompositeParams
export type ComposeOptions = {
  aliases?: Record<string, string>
}

export class Composite {
  static VERSION = '1.0'

  static compose(composites: Array<ComposeInput>, options?: ComposeOptions): Composite {
    const [first, ...rest] = composites
    const composite = first instanceof Composite ? first.clone() : new Composite(first)
    composite.composeWith(rest, options)
    return composite
  }

  static async fromJSON(params: FromJSONParams): Promise<Composite> {
    const { models, ...definition } = params.definition
    const commits = decodeSignedMap(models)
    return new Composite({
      commits,
      definition: {
        ...definition,
        models: await loadModelsFromCommits(params.ceramic, commits),
      },
    })
  }

  static async fromSchema(_params: FromSchemaParams): Promise<Composite> {
    // TODO: convert the schema to models, create the models on the Ceramice node, load their commits
    throw new Error('Not implemented')
  }

  #commits: Record<string, StreamCommits>
  #definition: CompositeDefinition

  constructor(params: CompositeParams) {
    assertSupportedVersion(Composite.VERSION, params.definition.version)
    assertModelsHaveCommits(params.definition.models, params.commits)
    this.#commits = params.commits
    this.#definition = params.definition
  }

  clone(): Composite {
    return new Composite(this.toParams())
  }

  composeWith(other: ComposeInput | Array<ComposeInput>, options?: ComposeOptions) {
    const commonShapes = new Set<string>()

    for (const composite of Array.isArray(other) ? other : [other]) {
      const { commits, definition } =
        composite instanceof Composite ? composite.toParams() : composite
      assertSupportedVersion(this.#definition.version, definition.version)
      assertModelsHaveCommits(definition.models, commits)

      const def = toStrictDefinition(definition)
      Object.assign(this.#commits, commits)
      Object.assign(this.#definition.models, definition.models)
      Object.assign(this.#definition.aliases ?? {}, def.aliases)
      merge(this.#definition.views ?? {}, def.views)
      for (const shape of def.commonShapes) {
        commonShapes.add(shape)
      }
    }

    this.#definition.commonShapes = Array.from(commonShapes)
    if (options?.aliases != null) {
      Object.assign(this.#definition.aliases ?? {}, options.aliases)
    }
  }

  setAliases(aliases: Record<string, string>, replace = false) {
    const existing = replace ? {} : this.#definition.aliases ?? {}
    this.#definition.aliases = { ...existing, ...aliases }
  }

  setViews(views: CompositeViewsDefinition, replace = false) {
    const existing = replace ? {} : this.#definition.views ?? {}
    this.#definition.views = merge(existing, views)
  }

  toJSON(): EncodedCompositeDefinition {
    return {
      version: this.#definition.version,
      models: encodeSignedMap(this.#commits),
      aliases: this.#definition.aliases,
      views: this.#definition.views,
    }
  }

  toParams(): CompositeParams {
    return {
      commits: cloneDeep(this.#commits),
      definition: cloneDeep(this.#definition),
    }
  }

  toRuntime(): RuntimeCompositeDefinition {
    return createRuntimeDefinition(this.#definition)
  }
}
