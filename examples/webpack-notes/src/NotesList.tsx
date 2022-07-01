import { gql, useQuery } from '@apollo/client'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import NoteIcon from '@mui/icons-material/Note'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAuth } from './auth'

const NOTES_LIST_QUERY = gql`
  query NotesList($cursor: String) {
    viewer {
      data {
        noteCollection(last: 5, before: $cursor) {
          edges {
            node {
              id
              title
            }
          }
          pageInfo {
            hasPreviousPage
            startCursor
          }
        }
      }
    }
  }
`

export default function NotesList() {
  const [authState] = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const { data, fetchMore } = useQuery(NOTES_LIST_QUERY, {
    skip: authState.status !== 'done',
    onCompleted(pageData) {
      const pageInfo = pageData?.viewer.data.noteCollection.pageInfo
      if (pageInfo?.hasPreviousPage) {
        fetchMore({ variables: { cursor: pageInfo.startCursor } })
      }
    },
  })

  const draft = (
    <ListItem button onClick={() => navigate('/new')}>
      <ListItemIcon>
        <NoteAddIcon />
      </ListItemIcon>
      <ListItemText
        primary={authState.status === 'done' ? 'New note' : 'Authenticate to create note'}
      />
    </ListItem>
  )

  if (data == null) {
    return <List>{draft}</List>
  }

  const noteItems = [...data.viewer.data.noteCollection.edges].reverse().map((edge) => {
    const note = edge.node
    return (
      <ListItem
        button
        key={note.id}
        onClick={() => navigate(`/notes/${note.id}`)}
        selected={note.id === id}>
        <ListItemIcon>
          <NoteIcon />
        </ListItemIcon>
        <ListItemText primary={note.title} />
      </ListItem>
    )
  })

  return (
    <>
      <List>{draft}</List>
      <Divider />
      <List>{noteItems}</List>
    </>
  )
}
