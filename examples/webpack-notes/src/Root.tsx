import { type Theme, styled } from '@mui/material/styles'

import { classes } from './style'

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

export default Root
