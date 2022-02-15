import type { TileDocument } from '@ceramicnetwork/stream-tile'
import { styled } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import TextareaAutosize from '@mui/material/TextareaAutosize'
import TextField from '@mui/material/TextField'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import type { Theme } from '@mui/material/styles'
import DownloadIcon from '@mui/icons-material/CloudDownload'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ErrorIcon from '@mui/icons-material/ErrorOutline'
import ListItemIcon from '@mui/material/ListItemIcon'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import NoteIcon from '@mui/icons-material/Note'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import UploadIcon from '@mui/icons-material/CloudUpload'
import { randomBytes } from '@stablelib/random'
import React, { useRef, useState } from 'react'
import { fromString, toString } from 'uint8arrays'

import type { Note } from './env'
import { useApp } from './state'
import type {
  AuthState,
  DraftStatus,
  IndexLoadedNote,
  State,
  StoredNote,
} from './state'

const PREFIX = 'App'
const classes = {
  title: `${PREFIX}-title`,
  noteSaveButton: `${PREFIX}-noteSaveButton`,
  noteTextarea: `${PREFIX}-noteTextarea`,
}

const drawerWidth = 300

const Root = styled('div')(({ theme }: { theme: Theme }) => ({
  display: 'flex',

  [`& .${classes.title}`]: {
    flexGrow: 1,
  },

  [`& .${classes.noteSaveButton}`]: {
    marginTop: theme.spacing(2),
  },

  [`& .${classes.noteTextarea}`]: {
    border: 0,
    fontSize: theme.typography.pxToRem(18),
    padding: theme.spacing(2),
    width: '100%',
  },
}))

type NotesListProps = {
  deleteDraft: () => void
  openDraft: () => void
  openNote: (docID: string) => void
  state: State
}

function NotesList({
  deleteDraft,
  openDraft,
  openNote,
  state,
}: NotesListProps) {
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
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={() => deleteDraft()}
            size="large">
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
      <ListItem
        button
        key={docID}
        onClick={() => openNote(docID)}
        selected={isSelected}>
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

type AuthenticateProps = {
  authenticate: (seed: Uint8Array) => void
  state: AuthState
}

function AuthenticateScreen({ authenticate, state }: AuthenticateProps) {
  const [seed, setSeed] = useState('')
  const isLoading = state.status === 'loading'

  return state.status === 'done' ? (
    <Typography>Authenticated with ID {state.store.id}</Typography>
  ) : (
    <>
      <Typography>
        You need to authenticate to load your existing notes and create new
        ones.
      </Typography>
      <Root>
        <TextField
          autoFocus
          disabled={isLoading}
          fullWidth
          id="seed"
          label="Seed"
          onChange={(event) => setSeed(event.target.value)}
          placeholder="base16-encoded string of 32 bytes length"
          type="text"
          value={seed}
          variant="standard"
        />
      </Root>
      <Button
        color="primary"
        disabled={seed === '' || isLoading}
        onClick={() => authenticate(fromString(seed, 'base16'))}
        variant="contained">
        Authenticate
      </Button>
      <Button
        color="primary"
        disabled={isLoading}
        onClick={() => setSeed(toString(randomBytes(32), 'base16'))}>
        Generate random seed
      </Button>
    </>
  )
}

type DraftScreenProps = {
  placeholder: string
  save: (title: string, text: string) => void
  status: DraftStatus
}

function DraftScreen({ placeholder, save, status }: DraftScreenProps) {
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
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title">
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

type NoteScreenProps = {
  note: IndexLoadedNote | StoredNote
  placeholder: string
  save: (doc: TileDocument<Note>, text: string) => void
}

function NoteScreen({ note, placeholder, save }: NoteScreenProps) {
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

export default function App() {
  const app = useApp()

  const [mobileOpen, setMobileOpen] = useState(false)
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const drawer = (
    <>
      <Toolbar>
        <Button
          href="https://developers.ceramic.network/tools/glaze/overview/"
          variant="outlined">
          Glaze documentation
        </Button>
      </Toolbar>
      <NotesList
        deleteDraft={app.deleteDraft}
        openDraft={app.openDraft}
        openNote={app.openNote}
        state={app.state}
      />
    </>
  )

  let screen
  switch (app.state.nav.type) {
    case 'draft':
      screen = (
        <DraftScreen
          placeholder={app.state.placeholderText}
          save={app.saveDraft}
          status={app.state.draftStatus}
        />
      )
      break
    case 'note':
      screen = (
        <NoteScreen
          key={app.state.nav.docID}
          note={app.state.notes[app.state.nav.docID]}
          placeholder={app.state.placeholderText}
          save={app.saveNote}
        />
      )
      break
    default:
      screen = (
        <AuthenticateScreen
          authenticate={app.authenticate}
          state={app.state.auth}
        />
      )
  }

  return (
    <Root>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
            size="large">
            <MenuIcon />
          </IconButton>
          <Typography className={classes.title} noWrap variant="h6">
            Glaze demo notes app
          </Typography>
          {app.state.nav.type === 'default' ? null : (
            <IconButton
              color="inherit"
              aria-label="reset"
              edge="end"
              onClick={() => {
                app.reset()
              }}
              size="large">
              <LogoutIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="notes">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}>
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open>
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}>
        <Toolbar />
        {screen}
      </Box>
    </Root>
  )
}
