import { TileDocument } from '@ceramicnetwork/stream-tile'
import { useCallback, useReducer } from 'react'

import { getEnv } from './env'
import type { Context, Env, Note } from './env'

type AuthStatus = 'pending' | 'loading' | 'failed'
export type DraftStatus = 'unsaved' | 'saving' | 'failed' | 'saved'
type NoteLoadingStatus = 'init' | 'loading' | 'loading failed'
type NoteSavingStatus = 'loaded' | 'saving' | 'saving failed' | 'saved'

type UnauthenticatedState = { status: AuthStatus }
type AuthenticatedState = Context & { status: 'done' }
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
  draftStatus: DraftStatus
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
export type State = Store & (DefaultState | NoteState)

const DEFAULT_STATE: State = {
  auth: { status: 'pending' },
  draftStatus: 'unsaved',
  nav: { type: 'default' },
  notes: {},
  placeholderText: '',
}

type AuthAction = { type: 'auth'; status: AuthStatus }
type AuthSuccessAction = { type: 'auth success' } & Env
type NavResetAction = { type: 'nav reset' }
type NavDraftAction = { type: 'nav draft' }
type NavNoteAction = { type: 'nav note'; docID: string }
type DraftDeleteAction = { type: 'draft delete' }
type DraftStatusAction = { type: 'draft status'; status: 'saving' | 'failed' }
type DraftSavedAction = {
  type: 'draft saved'
  title: string
  docID: string
  doc: TileDocument<Note>
}
type NoteLoadedAction = {
  type: 'note loaded'
  docID: string
  doc: TileDocument<Note>
}
type NoteLoadingStatusAction = {
  type: 'note loading status'
  docID: string
  status: NoteLoadingStatus
}
type NoteSavingStatusAction = {
  type: 'note saving status'
  docID: string
  status: NoteSavingStatus
}
type ResetAction = { type: 'reset' }
type Action =
  | AuthAction
  | AuthSuccessAction
  | NavResetAction
  | NavDraftAction
  | NavNoteAction
  | DraftDeleteAction
  | DraftStatusAction
  | DraftSavedAction
  | NoteLoadedAction
  | NoteLoadingStatusAction
  | NoteSavingStatusAction
  | ResetAction

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'auth':
      return {
        ...state,
        nav: { type: 'default' },
        auth: { status: action.status },
      }
    case 'auth success': {
      const auth = {
        status: 'done',
        loader: action.loader,
        model: action.model,
        store: action.store,
      } as AuthenticatedState
      return action.notes.length
        ? {
            ...state,
            auth,
            notes: action.notes.reduce((acc, item) => {
              acc[item.id] = { status: 'init', title: item.title }
              return acc
            }, {} as Record<string, IndexLoadedNote>),
            placeholderText: action.placeholderText,
          }
        : {
            auth,
            draftStatus: 'unsaved',
            nav: { type: 'draft' },
            notes: {},
            placeholderText: action.placeholderText,
          }
    }
    case 'nav reset':
      return { ...state, nav: { type: 'default' } }
    case 'nav draft':
      return {
        ...state,
        auth: state.auth as AuthenticatedState,
        nav: { type: 'draft' },
      }
    case 'draft status':
      return {
        ...state,
        auth: state.auth as AuthenticatedState,
        draftStatus: action.status,
      }
    case 'draft delete':
      return {
        ...state,
        draftStatus: 'unsaved',
        nav: { type: 'default' },
      }
    case 'draft saved': {
      return {
        auth: state.auth as AuthenticatedState,
        draftStatus: 'unsaved',
        nav: { type: 'note', docID: action.docID },
        notes: {
          ...state.notes,
          [action.docID]: {
            status: 'saved',
            title: action.title,
            doc: action.doc,
          },
        },
        placeholderText: state.placeholderText,
      }
    }
    case 'nav note':
      return {
        ...state,
        auth: state.auth as AuthenticatedState,
        nav: {
          type: 'note',
          docID: action.docID,
        },
      }
    case 'note loaded': {
      const id = (state.nav as NavNoteState).docID
      const noteState = state.notes[id]
      return {
        ...state,
        auth: state.auth as AuthenticatedState,
        notes: {
          ...state.notes,
          [id]: {
            status: 'loaded',
            title: noteState.title,
            doc: action.doc,
          },
        },
      }
    }
    case 'note loading status': {
      const id = (state.nav as NavNoteState).docID
      const noteState = state.notes[id] as IndexLoadedNote
      return {
        ...state,
        auth: state.auth as AuthenticatedState,
        notes: {
          ...state.notes,
          [id]: { ...noteState, status: action.status },
        },
      }
    }
    case 'note saving status': {
      const id = (state.nav as NavNoteState).docID
      const noteState = state.notes[id] as StoredNote
      return {
        ...state,
        auth: state.auth as AuthenticatedState,
        notes: {
          ...state.notes,
          [id]: { ...noteState, status: action.status },
        },
      }
    }
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
    [state.auth],
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
    [state.auth, state.notes],
  )

  const saveNote = useCallback(
    async (doc: TileDocument<Note>, text: string) => {
      const docID = doc.id.toString()
      dispatch({ type: 'note saving status', docID, status: 'saving' })
      try {
        await doc.update({ date: new Date().toISOString(), text })
        dispatch({ type: 'note saving status', docID, status: 'saved' })
      } catch (err) {
        console.log('failed to save note', err)
        dispatch({ type: 'note saving status', docID, status: 'saving failed' })
      }
    },
    [],
  )

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
