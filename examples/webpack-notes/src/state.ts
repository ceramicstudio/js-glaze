import { TileDocument } from '@ceramicnetwork/stream-tile'
import { useCallback, useReducer } from 'react'

import { getEnv } from './env'
import type { Env, Note } from './env'

type AuthStatus = 'pending' | 'loading' | 'failed'
export type DraftStatus = 'unsaved' | 'saving' | 'failed' | 'saved'
type NoteLoadingStatus = 'init' | 'loading' | 'loading failed'
type NoteSavingStatus = 'loaded' | 'saving' | 'saving failed' | 'saved'

type UnauthenticatedState = { status: AuthStatus }
type AuthenticatedState = { status: 'done' }
export type AuthState = UnauthenticatedState | AuthenticatedState

type NavDefaultState = { type: 'default' }
type NavDraftState = { type: 'draft' }
type NavNoteState = { type: 'note'; docID: string }

export type IndexLoadedNote = { status: NoteLoadingStatus; title: string }
export type StoredNote = {
  status: NoteSavingStatus
  title: string
  doc: TileDocument<Note>
}

type Store = {
  notes: Record<string, IndexLoadedNote | StoredNote>
  placeholderText: string
}
type DefaultState = {
  auth: AuthState
  nav: NavDefaultState
}
type NoteState = {
  auth: AuthenticatedState
  nav: NavDraftState | NavNoteState
}
export type State = {
  authStatus: AuthStatus | 'done'
  draftStatus: DraftStatus
}

const DEFAULT_STATE: State = {
  authStatus: 'pending',
  draftStatus: 'unsaved',
}

type AuthAction = { type: 'auth'; status: AuthStatus }
type AuthSuccessAction = { type: 'auth success' }
type DraftDeleteAction = { type: 'draft delete' }
type DraftStatusAction = { type: 'draft status'; status: 'saving' | 'failed' }
type DraftSavedAction = { type: 'draft saved'; docID: string }
// type NoteSavingStatusAction = {
//   type: 'note saving status'
//   docID: string
//   status: NoteSavingStatus
// }
type ResetAction = { type: 'reset' }
type Action =
  | AuthAction
  | AuthSuccessAction
  | DraftDeleteAction
  | DraftStatusAction
  | DraftSavedAction
  // | NoteSavingStatusAction
  | ResetAction

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'auth':
      return { ...state, authStatus: action.status }
    case 'auth success':
      return { ...state, authStatus: 'done' }
    case 'draft status':
      return { ...state, draftStatus: action.status }
    case 'draft delete':
    case 'draft saved':
      return { ...state, draftStatus: 'unsaved' }
    case 'reset':
      return DEFAULT_STATE
  }
}

export function useApp() {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE)

  const authenticate = useCallback(async (seed: Uint8Array) => {
    dispatch({ type: 'auth', status: 'loading' })
    try {
      const env = await getEnv(seed)
      dispatch({ type: 'auth success', ...env })
    } catch (err) {
      console.warn('authenticate call failed', err)
      dispatch({ type: 'auth', status: 'failed' })
    }
  }, [])

  const openDraft = useCallback(() => {
    dispatch({ type: 'nav draft' })
  }, [])

  const deleteDraft = useCallback(() => {
    dispatch({ type: 'draft delete' })
  }, [])

  const saveDraft = useCallback(
    async (title: string, text: string) => {
      dispatch({ type: 'draft status', status: 'saving' })
      const { model, store } = state.auth as AuthenticatedState
      try {
        const [doc, notesList] = await Promise.all([
          model.createTile('Note', { date: new Date().toISOString(), text }),
          store.get('notes'),
        ])
        const notes = notesList?.notes ?? []
        await store.set('notes', {
          notes: [...notes, { id: doc.id.toUrl(), title }],
        })
        const docID = doc.id.toString()
        dispatch({ type: 'draft saved', docID, title, doc })
      } catch (err) {
        console.log('failed to save draft', err)
        dispatch({ type: 'draft status', status: 'failed' })
      }
    },
    [state.auth]
  )

  const openNote = useCallback(
    async (docID: string) => {
      dispatch({ type: 'nav note', docID })

      if (state.notes[docID] == null || state.notes[docID].status === 'init') {
        const { loader } = state.auth as AuthenticatedState
        try {
          const doc = await loader.load<Note>(docID)
          dispatch({ type: 'note loaded', docID, doc })
        } catch (err) {
          console.log('failed to open note', err)
          dispatch({
            type: 'note loading status',
            docID,
            status: 'loading failed',
          })
        }
      }
    },
    [state.auth, state.notes]
  )

  const saveNote = useCallback(async (doc: TileDocument<Note>, text: string) => {
    const docID = doc.id.toString()
    dispatch({ type: 'note saving status', docID, status: 'saving' })
    try {
      await doc.update({ date: new Date().toISOString(), text })
      dispatch({ type: 'note saving status', docID, status: 'saved' })
    } catch (err) {
      console.log('failed to save note', err)
      dispatch({ type: 'note saving status', docID, status: 'saving failed' })
    }
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'reset' })
  }, [])

  return {
    authenticate,
    deleteDraft,
    openDraft,
    openNote,
    saveDraft,
    saveNote,
    reset,
    state,
  }
}
