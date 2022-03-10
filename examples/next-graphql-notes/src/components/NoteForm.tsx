import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { useState } from 'react'

export type Note = {
  text: string
  title: string
}

type Props = {
  disabled: boolean
  note?: Note
  onCancel?: () => void
  onSave: (note: Note) => void
}

export default function NoteForm({ disabled, note: initialNote, onCancel, onSave }: Props) {
  const [note, setNote] = useState<Note>(initialNote ?? { text: '', title: '' })

  return (
    <>
      <TextField
        autoFocus
        disabled={disabled}
        fullWidth
        id="title"
        label="Title"
        onChange={(event) => setNote({ ...note, title: event.target.value })}
        type="text"
        value={note.title}
        variant="standard"
      />
      <TextField
        disabled={disabled}
        fullWidth
        id="text"
        label="Text"
        maxRows={20}
        minRows={10}
        multiline
        onChange={(event) => setNote({ ...note, text: event.target.value })}
        type="text"
        value={note.text}
        variant="standard"
      />
      <Box sx={{ flexDirection: 'row' }}>
        <Button
          color="primary"
          disabled={disabled || note.text === '' || note.title === ''}
          onClick={() => onSave(note)}
          variant="contained">
          Save
        </Button>
        {onCancel ? (
          <Button disabled={disabled} onClick={() => onCancel()}>
            Cancel
          </Button>
        ) : null}
      </Box>
    </>
  )
}
