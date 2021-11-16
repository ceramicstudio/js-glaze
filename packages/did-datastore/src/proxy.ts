import type { TileDocument } from '@ceramicnetwork/stream-tile'

export type TileContent = Record<string, any> | null | undefined
export type TileDoc = TileDocument<TileContent>
export type MutationFunc = (current: TileDoc) => Promise<TileDoc>

type RejectFunc = (error: Error) => void

type QueueItem<TileDoc> = {
  reject: RejectFunc
  run: (value: TileDoc) => Promise<void>
}

export class TileProxy {
  #getRemote: () => Promise<TileDoc>
  #queue: Array<QueueItem<TileDoc>> = []
  #promiseValue!: Promise<TileDoc>
  #deferValue!: { resolve: (value: TileDoc) => any; reject: RejectFunc }

  constructor(getRemote: () => Promise<TileDoc>) {
    this.#getRemote = getRemote
    this._createValuePromise()
  }

  /** @internal */
  _createValuePromise(): void {
    this.#promiseValue = new Promise((resolve, reject) => {
      this.#deferValue = { resolve, reject }
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

      this.#queue.push({ reject, run })
      if (this.#queue.length === 1) {
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
    return this.#queue.length === 0 ? await this.#getRemote() : await this.#promiseValue
  }

  /** @internal */
  async _start(): Promise<void> {
    try {
      const value = await this.#getRemote()
      this._next(value)
    } catch (err) {
      this.#queue.forEach((item) => {
        item.reject(err as Error)
      })
      this.#queue = []
      this.#deferValue.reject(err as Error)
      this._createValuePromise()
    }
  }

  /** @internal */
  _next(value: TileDoc): void {
    const item = this.#queue.shift()
    if (item == null) {
      this._end(value)
    } else {
      void item.run(value)
    }
  }

  /** @internal */
  _end(value: TileDoc): void {
    this.#deferValue.resolve(value)
    this._createValuePromise()
  }
}
