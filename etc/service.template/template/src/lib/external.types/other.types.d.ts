/* eslint-disable no-inner-declarations */

declare module 'thunky/promise' {
  export default function <T>(fn: () => Promise<T>): () => Promise<T>;
}

declare module 'heaps-permute' {
  export default function permute<T>(values: T[]): T[][];
}
