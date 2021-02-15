declare module 'uint8arrays' {
  export function toString(b: Uint8Array, enc?: string): string
  export function fromString(s: string, enc?: string): Uint8Array
}
