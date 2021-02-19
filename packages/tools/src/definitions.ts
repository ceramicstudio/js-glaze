import type { DefinitionName, PublishedSchemas } from '@ceramicstudio/idx-constants'
import type { DID } from 'dids'

import { signIDXDefinitions } from './signing'
import type { Definition, SignedDefinitions } from './types'

export function createIDXDefinitions(
  schemas: PublishedSchemas
): Record<DefinitionName, Definition> {
  return {
    alsoKnownAs: {
      name: 'Also Known As',
      description:
        'Also Known As is a data set that stores a list of accounts that are publicly linked to the users DID',
      schema: schemas.AlsoKnownAs,
    },
    basicProfile: {
      name: 'Basic Profile',
      description: 'Basic profile information for a DID',
      schema: schemas.BasicProfile,
    },
    cryptoAccounts: {
      name: 'Crypto Accounts',
      description: 'Crypto accounts linked to your DID',
      schema: schemas.CryptoAccounts,
    },
    threeIdKeychain: {
      name: '3ID Keychain',
      description: 'Key data for 3ID',
      schema: schemas.ThreeIdKeychain,
    },
  }
}

export async function createIDXSignedDefinitions(
  did: DID,
  schemas: PublishedSchemas
): Promise<SignedDefinitions> {
  const definitions = createIDXDefinitions(schemas)
  return await signIDXDefinitions(did, schemas.Definition, definitions)
}
