import type { ReactNode } from 'react'
import { RelayEnvironmentProvider } from 'react-relay'

import { useRelayEnvironment } from '../hooks'

type Props = { children: ReactNode }

export default function RelayProvider({ children }: Props) {
  return (
    <RelayEnvironmentProvider environment={useRelayEnvironment()}>
      {children}
    </RelayEnvironmentProvider>
  )
}
