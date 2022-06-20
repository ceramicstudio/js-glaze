import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { randomBytes } from '@stablelib/random'
import React, { useState } from 'react'
import { fromString, toString } from 'uint8arrays'

import Root from './Root'
import type { AuthState } from './state'

export type AuthenticateProps = {
  authenticate: (seed: Uint8Array) => void
  state: AuthState
}

export default function AuthenticateScreen({ authenticate, state }: AuthenticateProps) {
  const [seed, setSeed] = useState('')
  const isLoading = state.status === 'loading'

  return state.status === 'done' ? (
    <Typography>Authenticated with ID {state.store.id}</Typography>
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
        onClick={() => authenticate(fromString(seed, 'base16'))}
        variant="contained">
        Authenticate
      </Button>
      <Button
        color="primary"
        disabled={isLoading}
        onClick={() => setSeed(toString(randomBytes(32), 'base16'))}>
        Generate random seed
      </Button>
    </>
  )
}
