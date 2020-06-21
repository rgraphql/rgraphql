import { rgraphql } from 'rgraphql'

// HandleResultValue handles the next value in the sequence, optionally
// returning a handler for the next value(s) in the sequence.
// If val == undefined, delete the value.
export type ResultTreeHandler = ((val: rgraphql.IRGQLValue | undefined) => ResultTreeHandler) | null
