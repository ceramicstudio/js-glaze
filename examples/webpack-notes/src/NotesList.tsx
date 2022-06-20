import { gql, useQuery } from '@apollo/client'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import ListItemText from '@mui/material/ListItemText'
import DownloadIcon from '@mui/icons-material/CloudDownload'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ErrorIcon from '@mui/icons-material/ErrorOutline'
import ListItemIcon from '@mui/material/ListItemIcon'
import NoteIcon from '@mui/icons-material/Note'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import UploadIcon from '@mui/icons-material/CloudUpload'
import React from 'react'

import type { State } from './state'

const NOTES_LIST_QUERY = gql`
  query NotesList {
    viewer {
      noteConnection(last: 20, after: $cursor) {
        edges {
          node {
            id
            title
          }
        }
        pageInfo {
          hasPreviousPage
          endCursor
        }
      }
    }
  }
`

export type NotesListProps = {
  deleteDraft: () => void
  openDraft: () => void
  openNote: (docID: string) => void
  state: State
}

export default function NotesList({ deleteDraft, openDraft, openNote, state }: NotesListProps) {
  let draft
  if (state.nav.type === 'draft') {
    let icon
    switch (state.draftStatus) {
      case 'failed':
        icon = <ErrorIcon />
        break
      case 'saving':
        icon = <UploadIcon />
        break
      default:
        icon = <EditIcon />
    }
    draft = (
      <ListItem button onClick={() => openDraft()} selected>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary="Draft note" />
        <ListItemSecondaryAction>
          <IconButton edge="end" aria-label="delete" onClick={() => deleteDraft()} size="large">
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    )
  } else if (state.auth.status === 'done') {
    draft = (
      <ListItem button onClick={() => openDraft()}>
        <ListItemIcon>
          <NoteAddIcon />
        </ListItemIcon>
        <ListItemText primary="New note" />
      </ListItem>
    )
  } else {
    draft = (
      <ListItem>
        <ListItemIcon>
          <NoteAddIcon />
        </ListItemIcon>
        <ListItemText primary="Authenticate to create note" />
      </ListItem>
    )
  }

  const notes = Object.entries(state.notes).map(([docID, note]) => {
    const isSelected = state.nav.type === 'note' && state.nav.docID === docID

    let icon
    switch (note.status) {
      case 'loading failed':
      case 'saving failed':
        icon = <ErrorIcon />
        break
      case 'loading':
        icon = <DownloadIcon />
        break
      case 'saving':
        icon = <UploadIcon />
        break
      default:
        icon = isSelected ? <EditIcon /> : <NoteIcon />
    }

    return (
      <ListItem button key={docID} onClick={() => openNote(docID)} selected={isSelected}>
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={note.title} />
      </ListItem>
    )
  })

  return (
    <>
      <List>{draft}</List>
      <Divider />
      <List>{notes}</List>
    </>
  )
}
