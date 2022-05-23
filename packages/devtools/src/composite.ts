import type { CeramicApi } from '@ceramicnetwork/common'
import type {
  CompositeViewsDefinition,
  EncodedCompositeDefinition,
  InternalCompositeDefinition,
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

type StrictCompositeDefinition = Required<InternalCompositeDefinition>

function toStrictDefinition(definition: InternalCompositeDefinition): StrictCompositeDefinition {
  return {
    aliases: {},
    commonEmbeds: [],
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
    Object.values(modelsCommits).map((_commits): Promise<Model> => {
      throw new Error('Not implemented')
      // return await Model.fromCommits(ceramic, commits)
    })
  )
  return Object.keys(modelsCommits).reduce((acc, id, index) => {
    const model = definitions[index]
    if (model == null) {
      throw new Error(`Missing Model for id ${id}`)
    }
    const modelID = model.id.toString()
    if (modelID !== id) {
      throw new Error(`Unexpected Model stream ID: expected ${id}, got ${modelID}`)
    }
    acc[modelID as keyof Models] = model.content
    return acc
  }, {} as Record<keyof Models, ModelDefinition>)
}

export type CompositeParams = {
  commits: Record<string, StreamCommits>
  definition: InternalCompositeDefinition
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
  commonEmbeds?: 'all' | 'none' | Array<string>
  views?: CompositeViewsDefinition
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

  static fromSchema(_params: FromSchemaParams): Promise<Composite> {
    // TODO: convert the schema to models, create the models on the Ceramice node, load their commits
    throw new Error('Not implemented')
  }

  #commits: Record<string, StreamCommits>
  #definition: StrictCompositeDefinition

  constructor(params: CompositeParams) {
    assertSupportedVersion(Composite.VERSION, params.definition.version)
    assertModelsHaveCommits(params.definition.models, params.commits)
    this.#commits = cloneDeep(params.commits)
    this.#definition = toStrictDefinition(cloneDeep(params.definition))
  }

  clone(): Composite {
    return new Composite(this.toParams())
  }

  copy(models: Array<string>): Composite {
    if (models.length === 0) {
      throw new Error('Missing models to copy')
    }

    const { commits, definition } = this.toParams()
    const def = toStrictDefinition(definition)

    const nameIDs = Object.entries(def.models).reduce((acc, [id, model]) => {
      acc[model.name] = id
      return acc
    }, {} as Record<string, string>)
    const aliasIDs = Object.entries(def.aliases).reduce((acc, [id, alias]) => {
      acc[alias] = id
      return acc
    }, {} as Record<string, string>)

    const nextCommits: Record<string, StreamCommits> = {}
    const nextModels: Record<string, ModelDefinition> = {}
    const nextAliases: Record<string, string> = {}
    const nextViews: CompositeViewsDefinition = { account: {}, root: {}, models: {} }

    for (const model of models) {
      const id = aliasIDs[model] ?? nameIDs[model] ?? model
      if (def.models[id] == null) {
        throw new Error(`Model not found: ${model}`)
      }

      nextCommits[id] = commits[id]
      nextModels[id] = def.models[id]
      if (def.aliases[id] != null) {
        nextAliases[id] = def.aliases[id]
      }
      if (def.views.models[id] != null) {
        // TODO: check relations to other models, ensure there's no missing model in the subset
        nextViews.models[id] = def.views.models[id]
      }
      // TODO: account and root views
    }

    return new Composite({
      commits: nextCommits,
      definition: {
        version: def.version,
        commonEmbeds: def.commonEmbeds,
        models: nextModels,
        aliases: nextAliases,
        views: nextViews,
      },
    })
  }

  composeWith(other: ComposeInput | Array<ComposeInput>, options: ComposeOptions = {}) {
    const collectedEmbeds = new Set<string>()
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
      for (const name of def.commonEmbeds) {
        collectedEmbeds.add(name)
      }
    }

    if (options.aliases != null) {
      this.setAliases(options.aliases)
    }
    const commonEmbeds = options.commonEmbeds ?? 'none'
    if (commonEmbeds === 'all') {
      this.setCommonEmbeds(collectedEmbeds)
    } else if (Array.isArray(commonEmbeds)) {
      this.setCommonEmbeds(commonEmbeds, true)
    }
    if (options.views != null) {
      this.setViews(options.views)
    }
  }

  setAliases(aliases: Record<string, string>, replace = false) {
    const existing = replace ? {} : this.#definition.aliases
    this.#definition.aliases = { ...existing, ...aliases }
  }

  setCommonEmbeds(names: Array<string> | Set<string>, replace = false) {
    const existing = replace ? [] : this.#definition.commonEmbeds
    this.#definition.commonEmbeds = Array.from(new Set([...existing, ...names]))
  }

  setViews(views: CompositeViewsDefinition, replace = false) {
    const existing = replace ? {} : this.#definition.views
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
