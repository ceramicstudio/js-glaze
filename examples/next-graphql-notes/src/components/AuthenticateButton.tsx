import LogoutIcon from '@mui/icons-material/Logout'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { useSetAtom } from 'jotai'
import Link from 'next/link'

import { useAuthenticatedID } from '../hooks'
import { environmentAtom } from '../state'

export default function AuthenticateButton() {
  const id = useAuthenticatedID()
  const setEnvironment = useSetAtom(environmentAtom)

  const button = id ? (
    <Box display="flex" flexDirection="row" justifyContent="center" alignItems="center">
      <Link href={`/${id}`} passHref>
        <Button color="inherit">{id}</Button>
      </Link>
      <IconButton
        color="inherit"
        aria-label="reset"
        onClick={() => {
          setEnvironment(null)
        }}
        size="large">
        <LogoutIcon />
      </IconButton>
    </Box>
  ) : (
    <Link href="/" passHref>
      <Button color="inherit" variant="outlined">
        Authenticate
      </Button>
    </Link>
  )

  return <Box sx={{ color: 'white' }}>{button}</Box>
}
