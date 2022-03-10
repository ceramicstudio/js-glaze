import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useSetAtom } from 'jotai'
import { useCallback, useState } from 'react'
import { fromString, toString } from 'uint8arrays'

import { createEnvironment } from '../environment'
import { environmentAtom } from '../state'

function randomSeed(): string {
  const seed = new Uint8Array(32)
  self.crypto.getRandomValues(seed)
  return toString(seed, 'base16')
}

function useSetEnvironment(): [boolean, (seed: string) => void] {
  const setEnvironmentState = useSetAtom(environmentAtom)
  const [isLoading, setLoading] = useState<boolean>(false)

  const setEnvironment = useCallback(
    (seed: string) => {
      setLoading(true)
      createEnvironment(fromString(seed, 'base16')).then(
        (env) => {
          setLoading(false)
          setEnvironmentState(env)
        },
        (err) => {
          console.warn('Failed to create environment', err)
          setLoading(false)
        }
      )
    },
    [setEnvironmentState, setLoading]
  )

  return [isLoading, setEnvironment]
}

export default function AuthenticateForm() {
  const [seed, setSeed] = useState<string>('')
  const [isLoading, setEnvironment] = useSetEnvironment()

  return (
    <>
      <Typography>
        You need to authenticate to load your existing notes and create new ones.
      </Typography>
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
      <Button
        color="primary"
        disabled={seed === '' || isLoading}
        onClick={() => setEnvironment(seed)}
        variant="contained">
        Authenticate
      </Button>
      <Button color="primary" disabled={isLoading} onClick={() => setSeed(randomSeed())}>
        Generate random seed
      </Button>
    </>
  )
}
