import type { TileDocument } from '@ceramicnetwork/stream-tile'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import TextareaAutosize from '@mui/material/TextareaAutosize'
import Typography from '@mui/material/Typography'
import React, { useRef } from 'react'

import type { Note } from './env'
import type { IndexLoadedNote, StoredNote } from './state'
import { classes } from './style'

export type NoteScreenProps = {
  note: IndexLoadedNote | StoredNote
  placeholder: string
  save: (doc: TileDocument<Note>, text: string) => void
}

export default function NoteScreen({ note, placeholder, save }: NoteScreenProps) {
  const textRef = useRef<HTMLTextAreaElement>(null)

  if (note.status === 'loading failed') {
    return <Typography>Failed to load note!</Typography>
  }

  if (note.status === 'init' || note.status === 'loading') {
    return <Typography>Loading note...</Typography>
  }

  const doc = (note as StoredNote).doc
  return (
    <>
      <Paper elevation={5}>
        <TextareaAutosize
          className={classes.noteTextarea}
          disabled={note.status === 'saving'}
          defaultValue={doc.content.text}
          placeholder={placeholder}
          ref={textRef}
          minRows={10}
          maxRows={20}
        />
      </Paper>
      <Button
        className={classes.noteSaveButton}
        color="primary"
        disabled={note.status === 'saving'}
        onClick={() => save(doc, textRef.current?.value ?? '')}
        variant="contained">
        Save
      </Button>
    </>
  )
}
