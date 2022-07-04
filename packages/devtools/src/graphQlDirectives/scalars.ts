import { GraphQLScalarType } from 'graphql'

import type { ScalarSchema } from '../types.js'

export const extraScalars: Record<string, ScalarSchema> = {
  CommitID: { type: 'string', title: 'CeramicCommitID', maxLength: 200 },
  DID: {
    type: 'string',
    title: 'GraphQLDID',
    pattern: "/^did:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/",
    maxLength: 100,
  },
}

const scalars: Record<string, ScalarSchema> = {
  ...extraScalars,
  Boolean: { type: 'boolean' },
  Float: { type: 'number' },
  ID: { type: 'string', title: 'GraphQLID' },
  Int: { type: 'integer' },
  String: { type: 'string' },
}

export type SupportedScalarName = keyof typeof scalars

export function getScalarSchema(scalar: GraphQLScalarType | string): ScalarSchema {
  const name = scalar instanceof GraphQLScalarType ? scalar.name : scalar
  const schema = scalars[name]
  if (schema == null) {
    throw new Error(`Unsupported scalar name: ${name}`)
  }
  return { ...schema }
}
