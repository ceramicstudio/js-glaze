import { useAtomValue } from 'jotai'

import { authenticatedIDAtom, relayEnvironmentAtom } from './state'

export function useAuthenticatedID() {
  return useAtomValue(authenticatedIDAtom)
}

export function useRelayEnvironment() {
  return useAtomValue(relayEnvironmentAtom)
}
