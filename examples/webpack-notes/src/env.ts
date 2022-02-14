import { CeramicClient } from '@ceramicnetwork/http-client'
import { DataModel } from '@glazed/datamodel'
import { DIDDataStore } from '@glazed/did-datastore'
import { TileLoader } from '@glazed/tile-loader'
import { DID } from 'dids'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver } from 'key-did-resolver'

import aliases from './model.json'

export type Note = {
  date: string
  text: string
}

export type NoteItem = {
  id: string
  title: string
}

export type NotesList = { notes: Array<NoteItem> }

export type ModelTypes = {
  schemas: {
    Note: Note
    Notes: NotesList
  }
  definitions: {
    notes: 'Notes'
  }
  tiles: {
    placeholderNote: 'Note'
  }
}

export type Context = {
  loader: TileLoader
  model: DataModel<ModelTypes>
  store: DIDDataStore<ModelTypes>
}

export type Env = Context & NotesList & { placeholderText: string }

// Use shared cache
const cache = new Map()

export async function getEnv(seed: Uint8Array): Promise<Env> {
  // Create and authenticate the DID
  const did = new DID({
    provider: new Ed25519Provider(seed),
    resolver: getResolver(),
  })
  await did.authenticate()

  // Create the Ceramic instance and inject the DID
  const ceramic = new CeramicClient('http://localhost:7007')
  ceramic.did = did

  // Create the loader, model and store
  const loader = new TileLoader({ ceramic, cache })
  const model = new DataModel<ModelTypes>({ loader, aliases })
  const store = new DIDDataStore({ ceramic, loader, model })

  // Load the existing notes associated to the DID and the placeholder note
  const [notesList, placeholderNote] = await Promise.all([
    store.get('notes'),
    model.loadTile('placeholderNote'),
  ])

  return {
    loader,
    model,
    store,
    notes: notesList?.notes ?? [],
    placeholderText: placeholderNote?.content?.text ?? 'Note contents...',
  }
}
