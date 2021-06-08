import { StreamID } from '@ceramicnetwork/streamid'
import { fromString, toString } from 'uint8arrays'

export type CursorInput = Cursor | Uint8Array | string

export class Cursor {
  static BASE = 'base64url' as const

  static fromBytes(bytes: Uint8Array): Cursor {
    const view = new DataView(bytes.buffer)
    const index = view.getUint8(bytes.byteLength - 1)
    const id = StreamID.fromBytes(bytes.slice(0, -1))
    return new Cursor(id, index)
  }

  static fromString(value: string): Cursor {
    return Cursor.fromBytes(fromString(value, Cursor.BASE))
  }

  static from(input: CursorInput): Cursor {
    if (input instanceof Cursor) {
      return input
    }
    return typeof input === 'string' ? Cursor.fromString(input) : Cursor.fromBytes(input)
  }

  _sliceID: StreamID
  _itemIndex: number

  constructor(sliceID: StreamID, itemIndex: number) {
    this._sliceID = sliceID
    this._itemIndex = itemIndex
  }

  get sliceID(): StreamID {
    return this._sliceID
  }

  get itemIndex(): number {
    return this._itemIndex
  }

  toBytes(): Uint8Array {
    const id = this._sliceID.bytes
    const output = new Uint8Array(id.byteLength + 1)
    output.set(id)
    const view = new DataView(output.buffer)
    view.setUint8(id.byteLength, this._itemIndex)
    return output
  }

  toString(): string {
    return toString(this.toBytes(), Cursor.BASE)
  }

  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return `Cursor(${this._sliceID.toString()}:${this._itemIndex})`
  }
}
