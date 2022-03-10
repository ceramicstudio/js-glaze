import Box from '@mui/material/Box'
import type { GetServerSideProps } from 'next'
import { Suspense, useEffect, useRef } from 'react'
import { type PreloadedQuery, graphql, useQueryLoader, usePreloadedQuery } from 'react-relay'

import { NotePageQuery } from '../../__generated__/relay/NotePageQuery.graphql'

import DisplayNote from '../../components/DisplayNote'
import NotesList from '../../components/NotesList'

export const query = graphql`
  query NotePageQuery($did: ID!, $id: ID!) {
    account(id: $did) {
      store {
        notePad {
          ...NotesList_notesList
        }
      }
    }
    note: node(id: $id) {
      ... on Note {
        ...DisplayNote
      }
    }
  }
`

type ListProps = {
  active: string
  did: string
  queryRef: PreloadedQuery<NotePageQuery>
}

function AccountNotesList({ active, did, queryRef }: ListProps) {
  const data = usePreloadedQuery<NotePageQuery>(query, queryRef)
  const notePad = data.account?.store?.notePad
  return notePad ? <NotesList active={active} did={did} list={notePad} /> : null
}

type NoteProps = {
  queryRef: PreloadedQuery<NotePageQuery>
}

function Note({ queryRef }: NoteProps) {
  const data = usePreloadedQuery<NotePageQuery>(query, queryRef)
  return data.note ? <DisplayNote note={data.note} /> : null
}

type Props = {
  did: string
  id: string
}

export const getServerSideProps: GetServerSideProps<Props, { account: string; note: string }> = (
  ctx
) => {
  const did = ctx.params?.account ?? null
  const id = ctx.params?.note ?? null

  if (did === null) {
    return Promise.resolve({ destination: '/', permanent: true })
  }

  const res =
    id === null ? { redirect: { destination: `/${did}`, permanent: true } } : { props: { did, id } }
  return Promise.resolve(res)
}

export default function NotePage({ did, id }: Props) {
  const pageRef = useRef<string>('')
  const pageID = `${did}/${id}`

  const [queryRef, loadQuery, disposeQuery] = useQueryLoader<NotePageQuery>(query)

  useEffect(() => {
    if (pageID !== pageRef.current) {
      pageRef.current = pageID
      disposeQuery()
      loadQuery({ did, id })
    }
  }, [pageID])

  const loading = <Box sx={{ padding: 2 }}>Loading...</Box>

  return queryRef == null ? (
    loading
  ) : (
    <Suspense fallback={loading}>
      <Box sx={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
        <Box sx={{ display: 'flex', width: 300 }}>
          <AccountNotesList active={id} did={did} queryRef={queryRef} />
        </Box>
        <Note queryRef={queryRef} />
      </Box>
    </Suspense>
  )
}
