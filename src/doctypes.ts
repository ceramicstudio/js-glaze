export interface DoctypeConfig {
  schema: string | undefined
  tags: Array<string>
}

export const IDX_DOCTYPE_CONFIGS: Record<string, DoctypeConfig> = {
  root: { schema: undefined, tags: ['RootIndex', 'DocIdMap'] },
  profiles: { schema: undefined, tags: ['ProfilesIndex', 'DocIdMap'] },
  keychains: { schema: undefined, tags: [] },
  accounts: { schema: undefined, tags: ['AccountsIndex', 'DocIdMap'] },
  connections: { schema: undefined, tags: [] },
  collections: { schema: undefined, tags: ['CollectionsIndex', 'DocIdDocIdMap'] },
  services: { schema: undefined, tags: [] },
  settings: { schema: undefined, tags: [] }
}

export type IdxDoctypeName = keyof typeof IDX_DOCTYPE_CONFIGS
