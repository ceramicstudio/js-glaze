import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useCallback, useState } from 'react'
import { graphql, useFragment } from 'react-relay'

import type { DisplayNote$key } from '../__generated__/relay/DisplayNote.graphql'

import UpdateNote from './UpdateNote'

type Props = {
  note: DisplayNote$key
}

export default function DisplayNote({ note }: Props) {
  const [isEditing, setEditing] = useState(false)

  const data = useFragment(
    graphql`
      fragment DisplayNote on Note {
        ...UpdateNote
        author {
          isViewer
        }
        id
        title
        text
      }
    `,
    note
  )

  const onClose = useCallback(() => {
    console.log('close edit form')
    setEditing(false)
  }, [])

  let content
  if (isEditing) {
    content = <UpdateNote note={data} onClose={onClose} />
  } else {
    const editButton = data.author.isViewer ? (
      <Button onClick={() => setEditing(true)} variant="outlined">
        Edit
      </Button>
    ) : null

    content = (
      <>
        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h2">{data.title}</Typography>
          </Box>
          <Box>{editButton}</Box>
        </Box>
        <Typography>{data.text}</Typography>
      </>
    )
  }

  return <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', padding: 2 }}>{content}</Box>
}
