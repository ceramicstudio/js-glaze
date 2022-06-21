import { gql, useMutation, useQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import TextareaAutosize from '@mui/material/TextareaAutosize'
import Typography from '@mui/material/Typography'
import React, { useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'

import { classes } from './style'

const NOTE_QUERY = gql`
  query Note($id: ID!) {
    note: node(id: $id) {
      ... on Note {
        text
        title
      }
    }
  }
`

const UPDATE_NOTE_MUTATION = gql`
  mutation UpdateNote($input: UpdateNoteInput!) {
    updateNote(input: $input) {
      node {
        id
      }
    }
  }
`

export default function NoteScreen() {
  const { id } = useParams()
  const noteQuery = useQuery(NOTE_QUERY, { variables: { id } })
  const [updateNote, updateNoteState] = useMutation(UPDATE_NOTE_MUTATION)

  const textRef = useRef<HTMLTextAreaElement>(null)

  const onSave = useCallback(() => {
    const content = { title: noteQuery.data.note.title, text: textRef.current?.value ?? '' }
    updateNote({ variables: { input: { id, content } } })
  }, [id, noteQuery.data])

  if (noteQuery.error) {
    return <Typography>Failed to load note!</Typography>
  }

  if (noteQuery.loading) {
    return <Typography>Loading note...</Typography>
  }

  return (
    <>
      <Paper elevation={5}>
        <TextareaAutosize
          className={classes.noteTextarea}
          disabled={updateNoteState.loading}
          defaultValue={noteQuery.data.note.text}
          ref={textRef}
          minRows={10}
          maxRows={20}
        />
      </Paper>
      <Button
        className={classes.noteSaveButton}
        color="primary"
        disabled={updateNoteState.loading}
        onClick={() => onSave()}
        variant="contained">
        Save
      </Button>
    </>
  )
}
