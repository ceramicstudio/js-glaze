import { useCallback } from 'react'
import { graphql, useFragment, useMutation } from 'react-relay'

import type { UpdateNote$key } from '../__generated__/relay/UpdateNote.graphql'
import type { UpdateNoteMutation } from '../__generated__/relay/UpdateNoteMutation.graphql'

import NoteForm from './NoteForm'
import type { Note } from './NoteForm'

type Props = {
  note: UpdateNote$key
  onClose: (saved: boolean) => void
}

export default function UpdateNote({ note, onClose }: Props) {
  const data = useFragment(
    graphql`
      fragment UpdateNote on Note {
        id
        title
        text
      }
    `,
    note
  )

  const [commit, isInFlight] = useMutation<UpdateNoteMutation>(graphql`
    mutation UpdateNoteMutation($input: UpdateNoteInput!) {
      updateNote(input: $input) {
        document {
          ...DisplayNote
        }
      }
    }
  `)

  const onCancel = useCallback(() => {
    onClose(false)
  }, [])

  const onSave = useCallback(
    (note: Note) => {
      console.log('onSave note', note)
      commit({
        variables: { input: { id: data.id, content: note } },
        onError: (err) => {
          console.log('mutation failed', err)
          onClose(false)
        },
        onCompleted: () => {
          console.log('mutation completed')
          onClose(true)
        },
      })
    },
    [commit]
  )

  return (
    <NoteForm
      disabled={isInFlight}
      note={{ text: data.text ?? '', title: data.title ?? '' }}
      onCancel={onCancel}
      onSave={onSave}
    />
  )
}
