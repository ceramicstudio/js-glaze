import { RuntimeScalarType } from '@glazed/types'
import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  type GraphQLScalarType,
  GraphQLString,
} from 'graphql'
import { GraphQLDID } from 'graphql-scalars'

import { CeramicCommitID } from './ceramic.js'

export { GraphQLDID } from 'graphql-scalars'
export { CeramicCommitID } from './ceramic.js'

export type ScalarMap = Record<RuntimeScalarType, GraphQLScalarType>

export const scalars: ScalarMap = {
  boolean: GraphQLBoolean,
  commitid: CeramicCommitID,
  did: GraphQLDID,
  float: GraphQLFloat,
  id: GraphQLID,
  integer: GraphQLInt,
  string: GraphQLString,
}

export const scalarTypes = Object.keys(scalars)

export function isSupportedScalar(type: string): type is RuntimeScalarType {
  return scalarTypes.includes(type)
}

export function getScalar(type: RuntimeScalarType): GraphQLScalarType {
  if (isSupportedScalar(type)) {
    return scalars[type]
  }
  throw new Error(`Unsupported scalar type: ${type as string}`)
}
