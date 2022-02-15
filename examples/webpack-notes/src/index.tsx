import { StyledEngineProvider } from '@mui/material/styles'
import React, { StrictMode } from 'react'
import ReactDOM from 'react-dom'

import './index.css'
import App from './App'

ReactDOM.render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <App />
    </StyledEngineProvider>
  </StrictMode>,
  document.getElementById('root'),
)
