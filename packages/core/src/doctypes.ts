import type { TileDocument } from '@ceramicnetwork/stream-tile'

export type TileContent = Record<string, any> | null
export type TileDoc = TileDocument<TileContent>
export type MutationFunc = (current: TileDoc) => Promise<TileDoc>

type RejectFunc = (error: Error) => void

type QueueItem<TileDoc> = {
  reject: RejectFunc
  run: (value: TileDoc) => Promise<void>
}

export class DoctypeProxy {
  _getRemote: () => Promise<TileDoc>
  _getPromise: Promise<TileDoc> | null = null
  _queue: Array<QueueItem<TileDoc>> = []
  _promiseValue!: Promise<TileDoc>
  _deferValue!: { resolve: (value: TileDoc) => any; reject: RejectFunc }

  constructor(getRemote: () => Promise<TileDoc>) {
    this._getRemote = getRemote
    this._createValuePromise()
  }

  _createValuePromise(): void {
    this._promiseValue = new Promise((resolve, reject) => {
      this._deferValue = { resolve, reject }
    })
  }

  change(mutation: MutationFunc): Promise<void> {
    return new Promise((resolve, reject) => {
      const run = async (current: TileDoc): Promise<void> => {
        try {
          const next = await mutation(current)
          resolve()
          this._next(next)
        } catch (err) {
          reject(err)
          this._next(current)
        }
      }

      this._queue.push({ reject, run })
      if (this._queue.length === 1) {
        void this._start()
      }
    })
  }

  async changeContent(change: (content: TileContent) => TileContent): Promise<void> {
    const mutation = async (doc: TileDoc): Promise<TileDoc> => {
      await doc.update(change(doc.content), doc.metadata)
      return doc
    }
    return await this.change(mutation)
  }

  async get(): Promise<TileDoc> {
    return this._queue.length === 0 ? await this._getRemote() : await this._promiseValue
  }

  async _start(): Promise<void> {
    try {
      const value = await this._getRemote()
      this._next(value)
    } catch (err) {
      this._queue.forEach((item) => {
        item.reject(err)
      })
      this._queue = []
      this._deferValue.reject(err)
      this._createValuePromise()
    }
  }

  _next(value: TileDoc): void {
    const item = this._queue.shift()
    if (item == null) {
      this._end(value)
    } else {
      void item.run(value)
    }
  }

  _end(value: TileDoc): void {
    this._deferValue.resolve(value)
    this._createValuePromise()
  }
}
