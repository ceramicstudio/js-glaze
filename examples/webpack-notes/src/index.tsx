import { ApolloProvider } from '@apollo/client'
import { StyledEngineProvider } from '@mui/material/styles'
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App'
import { client } from './graphql'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </StyledEngineProvider>
  </StrictMode>
)
