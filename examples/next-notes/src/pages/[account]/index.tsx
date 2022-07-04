import Box from '@mui/material/Box'
import type { GetServerSideProps } from 'next'
import { Suspense, useEffect } from 'react'
import { type PreloadedQuery, graphql, useQueryLoader, usePreloadedQuery } from 'react-relay'

import { AccountNotesPageQuery } from '../../__generated__/relay/AccountNotesPageQuery.graphql'

import NotesList from '../../components/NotesList'

const query = graphql`
  query AccountNotesPageQuery($did: ID!) {
    account: node(id: $did) {
      ... on CeramicAccount {
        ...NotesList_account
      }
    }
  }
`

type ListProps = {
  queryRef: PreloadedQuery<AccountNotesPageQuery>
}

function AccountNotesList({ queryRef }: ListProps) {
  const data = usePreloadedQuery<AccountNotesPageQuery>(query, queryRef)
  return data.account ? <NotesList account={data.account} /> : null
}

type Props = {
  did: string
}

export const getServerSideProps: GetServerSideProps<Props, { account: string }> = (ctx) => {
  const did = ctx.params?.account ?? null
  const res =
    did === null ? { redirect: { destination: '/', permanent: true } } : { props: { did } }
  return Promise.resolve(res)
}

export default function AccountNotesPage({ did }: Props) {
  const [queryRef, loadQuery] = useQueryLoader<AccountNotesPageQuery>(query)

  useEffect(() => {
    if (queryRef == null) {
      loadQuery({ did })
    }
  }, [queryRef])

  const loading = <Box sx={{ padding: 2 }}>Loading...</Box>

  return queryRef == null ? (
    loading
  ) : (
    <Suspense fallback={loading}>
      <Box sx={{ display: 'flex', width: 300 }}>
        <AccountNotesList queryRef={queryRef} />
      </Box>
    </Suspense>
  )
}
