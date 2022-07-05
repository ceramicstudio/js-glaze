import Box from '@mui/material/Box'

import AuthenticateForm from '../components/AuthenticateForm'
import CreateNote from '../components/CreateNote'
import { useAuthenticatedID } from '../hooks'

export default function NewPage() {
  const did = useAuthenticatedID()
  return <Box padding={2}>{did ? <CreateNote did={did} /> : <AuthenticateForm />}</Box>
}
