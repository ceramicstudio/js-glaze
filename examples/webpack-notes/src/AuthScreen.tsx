import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import Root from './Root'
import { randomSeed, useAuth } from './auth'

export default function AuthScreen() {
  const [state, authenticate] = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [seed, setSeed] = useState('')

  const isLoading = state.status === 'loading'

  return state.status === 'done' ? (
    <Typography>Authenticated with ID {state.id}</Typography>
  ) : (
    <>
      <Typography>
        You need to authenticate to load your existing notes and create new ones.
      </Typography>
      <Root>
        <TextField
          autoFocus
          disabled={isLoading}
          fullWidth
          id="seed"
          label="Seed"
          onChange={(event) => setSeed(event.target.value)}
          placeholder="base16-encoded string of 32 bytes length"
          type="text"
          value={seed}
          variant="standard"
        />
      </Root>
      <Button
        color="primary"
        disabled={seed === '' || isLoading}
        onClick={() => {
          authenticate(seed).then(() => navigate(location.state?.from?.pathname || '/'))
        }}
        variant="contained">
        Authenticate
      </Button>
      <Button color="primary" disabled={isLoading} onClick={() => setSeed(randomSeed())}>
        Generate random seed
      </Button>
    </>
  )
}
