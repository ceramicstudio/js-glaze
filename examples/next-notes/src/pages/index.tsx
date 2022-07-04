import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Link from 'next/link'

import AuthenticateForm from '../components/AuthenticateForm'
import { useAuthenticatedID } from '../hooks'

export default function HomePage() {
  const id = useAuthenticatedID()

  const contents = id ? (
    <>
      <Typography>Connected as {id}</Typography>
      <Link href={`/${id}`} passHref>
        <Button variant="outlined">List your notes</Button>
      </Link>{' '}
      <Link href="/new" passHref>
        <Button variant="outlined">Create a new note</Button>
      </Link>
    </>
  ) : (
    <AuthenticateForm />
  )

  return <Box padding={2}>{contents}</Box>
}
