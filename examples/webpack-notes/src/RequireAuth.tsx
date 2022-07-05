import React, { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from './auth'

type Props = {
  children: ReactNode
}

export default function RequireAuth({ children }: Props) {
  const [auth] = useAuth()
  const location = useLocation()

  return auth.status === 'done' ? (
    <>{children}</>
  ) : (
    <Navigate to="/authenticate" state={{ from: location }} replace />
  )
}
