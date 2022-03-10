import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { useEffect } from 'react'
import { graphql, usePaginationFragment } from 'react-relay'

import type { NotesList_notesList$key } from '../__generated__/relay/NotesList_notesList.graphql'
import type { NotesListPaginationQuery } from '../__generated__/relay/NotesListPaginationQuery.graphql'

type Note = { id: string; title: string }

type Props = {
  active?: string
  did: string
  list: NotesList_notesList$key
}

export default function NotesList({ active, did, list }: Props) {
  const { data, hasPrevious, loadPrevious, isLoadingPrevious } = usePaginationFragment<
    NotesListPaginationQuery,
    NotesList_notesList$key
  >(
    graphql`
      fragment NotesList_notesList on NotesList
      @argumentDefinitions(
        count: { type: Int, defaultValue: 20 }
        cursor: { type: String, defaultValue: null }
      )
      @refetchable(queryName: "NotesListPaginationQuery") {
        notesConnection(last: $count, before: $cursor)
          @connection(key: "NotesList__notesConnection") {
          edges {
            cursor
            node {
              id
              title
            }
          }
        }
      }
    `,
    list
  )

  useEffect(() => {
    if (hasPrevious && !isLoadingPrevious) {
      loadPrevious(20)
    }
  }, [hasPrevious, isLoadingPrevious, loadPrevious])

  const notes = (data?.notesConnection?.edges ?? [])
    .map((e) => e?.node)
    .filter(Boolean) as Array<Note>
  const links = notes.map((note) => {
    const link = (
      <Link href={`/${did}/${note.id}`} passHref>
        <Button disabled={note.id === active} sx={{ flex: 1, padding: 2, justifyContent: 'left' }}>
          {note.title}
        </Button>
      </Link>
    )
    return (
      <Paper key={note.id} elevation={2} sx={{ display: 'flex', marginBottom: 1 }}>
        {link}
      </Paper>
    )
  })

  return <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', margin: 1 }}>{links}</Box>
}
