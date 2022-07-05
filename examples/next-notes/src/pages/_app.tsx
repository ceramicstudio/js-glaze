import CssBaseline from '@mui/material/CssBaseline'
import { Provider } from 'jotai'
import type { AppProps } from 'next/app'
import Head from 'next/head'

import Layout from '../components/Layout'
import RelayProvider from '../components/RelayProvider'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider>
      <CssBaseline />
      <Head>
        <title>Glaze Notes App</title>
        <meta name="description" content="Glaze example app using Next.js and Relay" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <RelayProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </RelayProvider>
    </Provider>
  )
}
