import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Paper from '@mui/material/Paper'
import TextareaAutosize from '@mui/material/TextareaAutosize'
import TextField from '@mui/material/TextField'
import React, { useRef, useState } from 'react'

import type { DraftStatus } from './state'
import { classes } from './style'

export type DraftScreenProps = {
  placeholder: string
  save: (title: string, text: string) => void
  status: DraftStatus
}

export default function DraftScreen({ placeholder, save, status }: DraftScreenProps) {
  const [open, setOpen] = useState(false)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleSave = () => {
    const text = textRef.current?.value
    const title = titleRef.current?.value
    if (text && title) {
      save(title, text)
    }
    setOpen(false)
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Save note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            label="Note title"
            inputRef={titleRef}
            type="text"
            variant="standard"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" variant="outlined">
            Save note
          </Button>
        </DialogActions>
      </Dialog>
      <Paper elevation={5}>
        <TextareaAutosize
          className={classes.noteTextarea}
          disabled={status === 'saving'}
          placeholder={placeholder}
          ref={textRef}
          minRows={10}
          maxRows={20}
        />
      </Paper>
      <Button
        className={classes.noteSaveButton}
        color="primary"
        disabled={status === 'saving'}
        onClick={handleOpen}
        variant="contained">
        Save
      </Button>
    </>
  )
}
