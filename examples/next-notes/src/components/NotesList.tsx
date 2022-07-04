import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Link from 'next/link'
import { useEffect } from 'react'
import { graphql, usePaginationFragment } from 'react-relay'

import type { NotesList_account$key } from '../__generated__/relay/NotesList_account.graphql'
import type { NotesListPaginationQuery } from '../__generated__/relay/NotesListPaginationQuery.graphql'

type Note = { id: string; title: string }

type Props = {
  account: NotesList_account$key
  active?: string
}

export default function NotesList({ account, active }: Props) {
  const { data, hasPrevious, loadPrevious, isLoadingPrevious } = usePaginationFragment<
    NotesListPaginationQuery,
    NotesList_account$key
  >(
    graphql`
      fragment NotesList_account on CeramicAccount
      @argumentDefinitions(
        count: { type: Int, defaultValue: 20 }
        cursor: { type: String, defaultValue: null }
      )
      @refetchable(queryName: "NotesListPaginationQuery") {
        id
        noteList(last: $count, before: $cursor) @connection(key: "NotesList_noteList") {
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
    account
  )

  useEffect(() => {
    if (hasPrevious && !isLoadingPrevious) {
      loadPrevious(20)
    }
  }, [hasPrevious, isLoadingPrevious, loadPrevious])

  const notes = (data?.noteList?.edges ?? []).map((e) => e?.node).filter(Boolean) as Array<Note>
  const links = notes.map((note) => {
    const link = (
      <Link href={`/${data?.id}/${note.id}`} passHref>
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
