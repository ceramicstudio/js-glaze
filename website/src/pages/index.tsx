import Head from '@docusaurus/Head'
import Link from '@docusaurus/Link'
import CodeBlock from '@theme/CodeBlock'
import useBaseUrl from '@docusaurus/useBaseUrl'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'
import ThemeProvider from '@theme/ThemeProvider'
import UserPreferencesProvider from '@theme/UserPreferencesProvider'
import clsx from 'clsx'
import React, { ReactNode } from 'react'

import styles from './styles.module.css'

const DESCRIPTION =
  'The most popular developer framework for building applications with decentralized identity and user-centric data'

const DISCORD_URL = 'https://chat.idx.xyz'
const GITHUB_URL = 'https://github.com/ceramicstudio/js-idx'

const CODE_DEFINE = `import { definitions } from '@ceramicstudio/idx-constants'

export const appDefinitions = {
  profile: definitions.basicProfile
}
`

const CODE_INTERACT = `import { IDX } from '@ceramicstudio/idx'

// Import definitions created during development or build time
import { appDefinitions } from './app-definitions'

const idx = new IDX({ ceramic, definitions: appDefinitions })
await idx.set('profile', { name: 'Alice' })
`

const CODE_DISCOVER = `import { IDX } from '@ceramicstudio/idx'
import { definitions } from '@ceramicstudio/idx-constants'

const idx = new IDX({ ceramic })
const profile = await idx.get(definitions.basicProfile, aliceDID)
`

function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <UserPreferencesProvider>{children}</UserPreferencesProvider>
    </ThemeProvider>
  )
}

function Layout({ children }: { children: ReactNode }) {
  const { siteConfig = {} } = useDocusaurusContext()
  const {
    favicon,
    title,
    themeConfig: { image }
  } = siteConfig
  const metaImageUrl = useBaseUrl(image, { absolute: true })
  const faviconUrl = useBaseUrl(favicon)

  return (
    <Providers>
      <Head>
        <html lang="en" />
        <title>{title}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta
          name="keywords"
          content="idx, idx.xyz, identity index, index, web3, dweb, did, dids, identity, identity system, open identity, decentralized identity, decentralized identifier, user-centric data, user-managed data, interoperability, data, data sharing, share data, 3box, 3box labs, javascript, developers, developer tools, library, build, client, client-side, encryption, control, framework, self-sovereign identity, ssi, ssid, w3c, standard, standards, user control, privacy, ceramic, ceramic network, ceramic protocol, ipfs, filecoin, ethereum, flow, polkadot, near, blockchain, protocol, system, wallets, wallet, cross-chain, chain-agnostic, decentralized, distributed, distributed web, serverless, jamstack, user data, data management, identity management, user management, users, without servers, p2p, peer-to-peer, cross-platform, log-in, authentication, auth, platform, docs, documentation, tutorial, guides, reviews, best, popular, how to, easy, simple, open source, implementation, code, demo"
        />
        <link rel="shortcut icon" href={faviconUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content={metaImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:site" content="@identityindex" />
        <meta name="twitter:image" content={metaImageUrl} />
        <meta name="twitter:image:alt" content={`Image for ${title}`} />
      </Head>
      <div className="main-wrapper">{children}</div>
    </Providers>
  )
}

interface MainFeatureProps {
  icon: string
  title: string
  text: string
}
function MainFeature({ icon, title, text }: MainFeatureProps) {
  return (
    <div className="col">
      <img alt={icon} src={`img/icon_${icon}.svg`} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

interface OpenFeatureProps {
  logo: string
  title: string
  text: string
  url: string
}
function OpenFeature({ logo, title, text, url }: OpenFeatureProps) {
  return (
    <div className="col">
      <div className={styles.openFeatureCol}>
        <h3>
          <img alt={title} src={`img/logo_${logo}.png`} />
        </h3>
        <p>{text}</p>
        <Link to={url}>Learn more →</Link>
      </div>
    </div>
  )
}

interface ContentRowProps {
  children: ReactNode
  image: ReactNode
  imageFirst?: boolean
  title: string
}
function ContentRow({ children, image, imageFirst, title }: ContentRowProps) {
  const imageCol = <div className={clsx('col', styles.imageCol)}>{image}</div>

  const textCol = (
    <div className={clsx('col', styles.flexCol)}>
      <h2>{title}</h2>
      <ul className={styles.checklist}>{children}</ul>
    </div>
  )

  return imageFirst ? (
    <div className="row">
      {imageCol}
      {textCol}
    </div>
  ) : (
    <div className="row">
      {textCol}
      {imageCol}
    </div>
  )
}

interface SocialLinkProps {
  logo: string
  title: string
  url: string
}
function SocialLink({ logo, title, url }: SocialLinkProps) {
  return (
    <Link to={url}>
      <img alt={title} src={`img/social_${logo}.png`} title={title} />
    </Link>
  )
}

export default function Home() {
  return (
    <Layout>
      <nav className={styles.navBar}>
        <div className={styles.navLogo}>
          <img alt="IDX" src="img/logo_idx.png" />
        </div>
        <div className={styles.navButtons}>
          <Link className="button button--outline button--primary" to={DISCORD_URL}>
            Discord
          </Link>
          <Link className="button button--outline button--primary" to={GITHUB_URL}>
            Github
          </Link>
          <Link className="button button--primary" to={useBaseUrl('docs')}>
            Docs
          </Link>
        </div>
      </nav>
      <header>
        <div className="container">
          <div className="row">
            <div className={clsx('col', styles.imageCol)}>
              <img alt="Build" src="img/home_build.png" />
            </div>
            <div className={clsx('col', styles.flexCol, styles.header)}>
              <h1 className={styles.headerTitle}>Build with open identity</h1>
              <p>
                IDX is an open source development framework for decentralized identity and
                user-centric data.
              </p>
              <div className={styles.buttons}>
                <Link
                  className={clsx('button button--primary button--lg', styles.getStarted)}
                  to={useBaseUrl('docs')}>
                  Read the docs
                </Link>
                <Link
                  className={clsx(
                    'button button--outline button--primary button--lg',
                    styles.getStarted
                  )}
                  to={DISCORD_URL}>
                  Join Discord
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main>
        <section className={clsx(styles.featuresSection, styles.mainFeaturesSection)}>
          <div className="container">
            <div className="row">
              <div className={clsx('col', styles.featuresHeader)}>
                <h2>Identity for a safer, more open web.</h2>
                <p>
                  Easily add users and data to your app with zero infrastructure, lock-in, or
                  trusted third parties.
                </p>
              </div>
            </div>
            <div className="row">
              <div className={clsx('col', styles.featuresCodeExample)}>
                <Tabs
                  defaultValue="define"
                  values={[
                    { label: 'Define data models', value: 'define' },
                    { label: 'Interact with known definitions', value: 'interact' },
                    { label: 'Discover user data', value: 'discover' }
                  ]}>
                  <TabItem value="define">
                    <CodeBlock className="ts">{CODE_DEFINE}</CodeBlock>
                  </TabItem>
                  <TabItem value="interact">
                    <CodeBlock className="ts">{CODE_INTERACT}</CodeBlock>
                  </TabItem>
                  <TabItem value="discover">
                    <CodeBlock className="ts">{CODE_DISCOVER}</CodeBlock>
                  </TabItem>
                </Tabs>
              </div>
            </div>
            <div className={clsx('row', styles.featuresContainer)}>
              <MainFeature
                icon="simplify"
                title="Simplify development"
                text="Eliminiate the need to run a backend for user management, and optionally data storage."
              />
              <MainFeature
                icon="share"
                title="Share data across apps"
                text="Bootstrap your application by discovering and importing user data from third-party apps. "
              />
              <MainFeature
                icon="control"
                title="Give users control"
                text="Improve security and privacy by letting users decide who gets to see their data."
              />
            </div>
          </div>
        </section>
        <section>
          <div className={clsx('container', styles.contentsContainer)}>
            <ContentRow
              title="Create and manage decentralized identities."
              image={<img alt="Identities" src="img/home_identities.png" />}>
              <li>Independent, globally unique ID</li>
              <li>Controlled by users; portable across platforms</li>
              <li>Login with any identity or crypto wallet</li>
              <li>Connect crypto, social, and other accounts</li>
            </ContentRow>
            <ContentRow
              title="Store user and app data on the decentralized web."
              image={<img alt="Data" src="img/home_data.png" />}
              imageFirst>
              <li>Store data in dynamic JSON documents</li>
              <li>Similar to a NoSQL document store</li>
              <li>Stored on IPFS; secured by blockchain</li>
              <li>Controlled by the user's DID</li>
            </ContentRow>
            <ContentRow
              title="Or store data anywhere else."
              image={<img alt="Store" src="img/home_store.png" />}>
              <li>
                Store data in traditional or p2p databases, decentralized file storage networks, or
                blockchain registries
              </li>
              <li>Publish schemas to make data interoperable</li>
              <li>Publish metadata and endpoint for routing</li>
            </ContentRow>
            <ContentRow
              title="Add datasets to a user's personal index."
              image={<img alt="Datasets" src="img/home_datasets.png" />}
              imageFirst>
              <li>
                Decentralized key-value store document lists mappings from data definitions to
                resources
              </li>
              <li>One per user; controlled by the user’s DID</li>
              <li>
                Discover data from all apps and storage contexts in a unified, user-centric location
              </li>
            </ContentRow>
            <ContentRow
              title="Discover and share a world of data across apps."
              image={<img alt="Discover" src="img/home_discover.png" />}>
              <li>
                From profiles and social graphs to application data, lookup a user’s index to see
                what’s available
              </li>
              <li>
                Query a specific resource to return the data or it’s location on another network or
                server
              </li>
              <li>Request permission to access encrypted data</li>
            </ContentRow>
          </div>
        </section>
        <section className={clsx(styles.featuresSection, styles.openFeaturesSection)}>
          <div className="container">
            <div className="row">
              <div className={clsx('col', styles.featuresHeader)}>
                <h2>Zero lock-in.</h2>
                <p>
                  Easily add users and data to your app with zero infrastructure, lock-in, or
                  trusted third parties.
                </p>
              </div>
            </div>
            <div className="row">
              <OpenFeature
                logo="ceramic"
                title="Ceramic"
                text="Identities, indexes, and documents are stored on Ceramic, a permissionless dataweb built on IPFS and blockchain."
                url="https://ceramic.network"
              />
              <OpenFeature
                logo="w3c_dids"
                title="W3C DIDs"
                text="Identities conform to the W3C standard for unique, decentralized, cross-platform identifiers."
                url="https://www.w3.org/TR/did-core/"
              />
              <OpenFeature
                logo="identity_index"
                title="Identity Index"
                text="Indexes conform to the Identity Index standard (CIP-3) which promotes cross-platform data interoperability."
                url="https://github.com/ceramicnetwork/CIP/issues/3"
              />
            </div>
          </div>
        </section>
        <footer>
          <div className="container">
            <div className="row">
              <div className={clsx('col', styles.flexCol)}>
                <h2 className={styles.getStartedHeader}>Get started with IDX</h2>
                <div className={styles.buttons}>
                  <Link
                    className={clsx('button button--primary button--lg', styles.getStarted)}
                    to={useBaseUrl('docs')}>
                    Read the docs
                  </Link>
                  <Link
                    className={clsx(
                      'button button--outline button--primary button--lg',
                      styles.getStarted
                    )}
                    to={DISCORD_URL}>
                    Join Discord
                  </Link>
                </div>
              </div>
              <div className={clsx('col', styles.imageCol, styles.footerImage)}>
                <img alt="Get started" src="img/home_footer.png" />
              </div>
            </div>
            <div className={clsx('row', styles.footer)}>
              <div className={styles.footerLogos}>
                <span className={styles.footerLogo}>
                  <img alt="IDX" src="img/logo_idx.png" />
                </span>
                <SocialLink logo="discord" title="Discord" url={DISCORD_URL} />
                <SocialLink logo="github" title="GitHub" url={GITHUB_URL} />
                <SocialLink
                  logo="twitter"
                  title="Twitter"
                  url="https://twitter.com/identityindex"
                />
              </div>
              <div className={styles.footerCopyright}>made with ❤️ by 3Box Labs</div>
            </div>
          </div>
        </footer>
      </main>
    </Layout>
  )
}
