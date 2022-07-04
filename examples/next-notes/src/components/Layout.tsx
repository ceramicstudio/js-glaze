import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import type { ReactNode } from 'react'

import AuthenticateButton from './AuthenticateButton'

type Props = { children: ReactNode }

export default function Layout({ children }: Props) {
  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Link href="/">
            <Typography noWrap variant="h6">
              Glaze Notes
            </Typography>
          </Link>
          <Box sx={{ color: 'white', flex: 1, flexDirection: 'row', px: 2 }}>
            <Link href="/new" passHref>
              <Button color="inherit" variant="outlined">
                New note
              </Button>
            </Link>
          </Box>
          <AuthenticateButton />
        </Toolbar>
      </AppBar>
      {children}
    </>
  )
}
