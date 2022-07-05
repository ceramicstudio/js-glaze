import { ApolloProvider } from '@apollo/client'
import { StyledEngineProvider } from '@mui/material/styles'
import { Provider } from 'jotai'
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'

import './index.css'
import App from './App'
import { client } from './graphql'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <Provider>
        <ApolloProvider client={client}>
          <HashRouter>
            <App />
          </HashRouter>
        </ApolloProvider>
      </Provider>
    </StyledEngineProvider>
  </StrictMode>
)
