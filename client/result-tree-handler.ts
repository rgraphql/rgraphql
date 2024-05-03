// HandleResultValue handles the next value in the sequence, optionally
// returning a handler for the next value(s) in the sequence.

import { RGQLValue } from '../rgraphql.pb.js'

// If val == undefined, delete the value.
export type ResultTreeHandler = ((val: RGQLValue | undefined) => ResultTreeHandler) | null
