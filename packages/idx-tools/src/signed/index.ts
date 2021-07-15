import { decodeSignedMap } from '../encoding'

import encodedDefinitions from './definitions.json'
import encodedSchemas from './schemas.json'

export const signedDefinitions = decodeSignedMap(encodedDefinitions)
export const signedSchemas = decodeSignedMap(encodedSchemas)
