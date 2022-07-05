import { GraphQLScalarType } from 'graphql'

import type { ScalarSchema } from '../types.js'

export const extraScalars: Record<string, ScalarSchema> = {
  CommitID: { type: 'string', title: 'CeramicCommitID', maxLength: 200 },
  CountryCode: {
    type: 'string',
    title: 'GraphQLCountryCode',
    // From https://github.com/Urigo/graphql-scalars/blob/master/src/scalars/CountryCode.ts
    pattern:
      '^(AD|AE|AF|AG|AI|AL|AM|AO|AQ|AR|AS|AT|AU|AW|AX|AZ|BA|BB|BD|BE|BF|BG|BH|BI|BJ|BL|BM|BN|BO|BQ|BR|BS|BT|BV|BW|BY|BZ|CA|CC|CD|CF|CG|CH|CI|CK|CL|CM|CN|CO|CR|CU|CV|CW|CX|CY|CZ|DE|DJ|DK|DM|DO|DZ|EC|EE|EG|EH|ER|ES|ET|FI|FJ|FK|FM|FO|FR|GA|GB|GD|GE|GF|GG|GH|GI|GL|GM|GN|GP|GQ|GR|GS|GT|GU|GW|GY|HK|HM|HN|HR|HT|HU|ID|IE|IL|IM|IN|IO|IQ|IR|IS|IT|JE|JM|JO|JP|KE|KG|KH|KI|KM|KN|KP|KR|KW|KY|KZ|LA|LB|LC|LI|LK|LR|LS|LT|LU|LV|LY|MA|MC|MD|ME|MF|MG|MH|MK|ML|MM|MN|MO|MP|MQ|MR|MS|MT|MU|MV|MW|MX|MY|MZ|NA|NC|NE|NF|NG|NI|NL|NO|NP|NR|NU|NZ|OM|PA|PE|PF|PG|PH|PK|PL|PM|PN|PR|PS|PT|PW|PY|QA|RE|RO|RS|RU|RW|SA|SB|SC|SD|SE|SG|SH|SI|SJ|SK|SL|SM|SN|SO|SR|SS|ST|SV|SX|SY|SZ|TC|TD|TF|TG|TH|TJ|TK|TL|TM|TN|TO|TR|TT|TV|TW|TZ|UA|UG|UM|US|UY|UZ|VA|VC|VE|VG|VI|VN|VU|WF|WS|YE|YT|ZA|ZM|ZW)$',
    maxLength: 2,
  },
  Date: { type: 'string', title: 'GraphQLDate', format: 'date', maxLength: 100 },
  DateTime: { type: 'string', title: 'GraphQLDateTime', format: 'date-time', maxLength: 100 },
  DID: {
    type: 'string',
    title: 'GraphQLDID',
    // From https://github.com/Urigo/graphql-scalars/blob/master/src/scalars/DID.ts
    pattern: "^did:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$",
    maxLength: 100,
  },
  Time: { type: 'string', title: 'GraphQLTime', format: 'time', maxLength: 100 },
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
