import { Doctype } from '@ceramicnetwork/ceramic-common'

export type MutationFunc<T = Doctype> = (current: T) => Promise<T>

type RejectFunc = (error: Error) => void

type QueueItem<T = Doctype> = {
  reject: RejectFunc
  run: (value: T) => Promise<void>
}

export class DoctypeProxy<T = Doctype> {
  _getRemote: () => Promise<T>
  _getPromise: Promise<T> | null = null
  _queue: Array<QueueItem<T>> = []
  _promiseValue!: Promise<T>
  _deferValue!: { resolve: (value: T) => any; reject: RejectFunc }

  constructor(getRemote: () => Promise<T>) {
    this._getRemote = getRemote
    this._createValuePromise()
  }

  _createValuePromise(): void {
    this._promiseValue = new Promise((resolve, reject) => {
      this._deferValue = { resolve, reject }
    })
  }

  change(mutation: MutationFunc<T>): Promise<void> {
    return new Promise((resolve, reject) => {
      const run = async (current: T): Promise<void> => {
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
        this._start()
      }
    })
  }

  async get(): Promise<T> {
    return this._queue.length === 0 ? await this._getRemote() : await this._promiseValue
  }

  async _start(): Promise<void> {
    try {
      const value = await this._getRemote()
      this._next(value)
    } catch (err) {
      this._queue.forEach(item => {
        item.reject(err)
      })
      this._queue = []
      this._deferValue.reject(err)
      this._createValuePromise()
    }
  }

  _next(value: T): void {
    const item = this._queue.shift()
    if (item == null) {
      this._end(value)
    } else {
      item.run(value)
    }
  }

  _end(value: T): void {
    this._deferValue.resolve(value)
    this._createValuePromise()
  }
}
