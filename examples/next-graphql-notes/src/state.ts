import { atom } from 'jotai'
import type { Environment as RelayEnvironment } from 'react-relay'

import { defaultRelayEnvironment } from './environment'
import type { Environment } from './environment'

export const environmentAtom = atom<Environment | null>(null)

export const relayEnvironmentAtom = atom<RelayEnvironment>((get) => {
  return get(environmentAtom)?.relay ?? defaultRelayEnvironment
})

export const authenticatedIDAtom = atom<string | null>((get) => {
  const env = get(environmentAtom)
  return env?.did.authenticated ? env.did.id : null
})
