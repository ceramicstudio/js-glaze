import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { graphql, useMutation } from 'react-relay'

import type { CreateNoteMutation } from '../__generated__/relay/CreateNoteMutation.graphql'

import NoteForm from './NoteForm'
import type { Note } from './NoteForm'

type Props = {
  did: string
}

export default function CreateNote({ did }: Props) {
  const router = useRouter()

  const [commit, isInFlight] = useMutation<CreateNoteMutation>(graphql`
    mutation CreateNoteMutation($input: AddNotePadNotesListNotesEdgeInput!) {
      addNotePadNotesListNotesEdge(input: $input) {
        edge {
          node {
            ...DisplayNote
            id
          }
        }
      }
    }
  `)

  const onSave = useCallback(
    (note: Note) => {
      console.log('onSave note', note)
      commit({
        variables: { input: { content: note } },
        onError: (err) => {
          console.log('mutation failed', err)
        },
        onCompleted: (res) => {
          console.log('mutation completed')
          const id = res.addNotePadNotesListNotesEdge?.edge.node?.id
          router.push(id ? `/${did}/${id}` : `/${did}`)
        },
      })
    },
    [commit]
  )

  return <NoteForm disabled={isInFlight} onSave={onSave} />
}
