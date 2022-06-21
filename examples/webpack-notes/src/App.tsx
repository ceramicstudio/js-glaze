import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import React, { useCallback, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'

import AuthScreen from './AuthScreen'
import DraftScreen from './DraftScreen'
import HomeScreen from './HomeScreen'
import NoteScreen from './NoteScreen'
import NotesList from './NotesList'
import RequireAuth from './RequireAuth'
import Root from './Root'
import { useAuth } from './auth'
import { classes } from './style'

const drawerWidth = 300

export default function App() {
  const [authState, _, resetAuth] = useAuth()
  const navigate = useNavigate()

  const onClickLogout = useCallback(() => {
    resetAuth()
    navigate('/')
  }, [navigate, resetAuth])

  const [mobileOpen, setMobileOpen] = useState(false)
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const drawer = (
    <>
      <Toolbar>
        <Button href="https://developers.ceramic.network/tools/glaze/overview/" variant="outlined">
          Glaze documentation
        </Button>
      </Toolbar>
      <NotesList />
    </>
  )
  return (
    <Root>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
            size="large">
            <MenuIcon />
          </IconButton>
          <Typography className={classes.title} noWrap variant="h6">
            Glaze demo notes app
          </Typography>
          {authState.status === 'done' ? (
            <IconButton
              color="inherit"
              aria-label="reset"
              edge="end"
              onClick={onClickLogout}
              size="large">
              <LogoutIcon />
            </IconButton>
          ) : null}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="notes">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}>
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open>
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}>
        <Toolbar />
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/authenticate" element={<AuthScreen />} />
          <Route
            path="/new"
            element={
              <RequireAuth>
                <DraftScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/notes/:id"
            element={
              <RequireAuth>
                <NoteScreen />
              </RequireAuth>
            }
          />
        </Routes>
      </Box>
    </Root>
  )
}
