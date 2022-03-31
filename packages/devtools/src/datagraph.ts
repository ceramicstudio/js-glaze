export class DataGraph {
  // Deterministic account to single record (IDX)
  async getRecord(type: string, did?: string): Promise<any> {}
  async setRecord(type: string, content: any): Promise<any> {}
  async removeRecord(type: string): Promise<any> {}

  // Account to multiple records
  async listCollectionRecords(type: string, did?: string): Promise<any> {}
  async addCollectionRecord(type: string, content: any): Promise<any> {}
  async removeCollectionRecord(id: string): Promise<any> {}

  // Deterministic account links
  async getAccountLink(type: string, did: string): Promise<any> {}
  async setAccountLink(type: string, did: string, content?: any): Promise<any> {}
  async removeAccountLink(type: string, did: string): Promise<any> {}

  // Account links query
  async listAccountLinksFrom(type: string, did?: string): Promise<any> {}
  async listAccountLinksTo(type: string, did?: string): Promise<any> {}
  async listReciprocalAccountLinks(type: string, did?: string): Promise<any> {}
  async listAccountLinksRecords(
    linkType: string,
    collectionType: string,
    did?: string
  ): Promise<any> {}

  // Records associated to stream -- should these use the CollectionRecords APIs?
  // Need to define query parameters for collections
  async listChildrenRecords(streamID: string, type: string): Promise<any> {}
  async addChildRecord(streamID: string, type: string, content: any): Promise<any> {}
  // Should this simply be removeCollectionRecord?
  async removeChildRecord(streamID: string, type: string, id: string): Promise<any> {}

  // TODO: getCollection with all basic profiles
}
