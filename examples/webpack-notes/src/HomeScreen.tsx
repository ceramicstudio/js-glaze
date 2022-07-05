import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from './auth'

export default function HomeScreen() {
  const [authState] = useAuth()
  const navigate = useNavigate()

  return authState.status === 'done' ? (
    <Typography>Authenticated with ID {authState.id}</Typography>
  ) : (
    <Button color="primary" onClick={() => navigate('/authenticate')} variant="contained">
      Authenticate
    </Button>
  )
}
