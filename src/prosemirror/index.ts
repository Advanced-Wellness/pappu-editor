export * from './core'
export * from './api'
export * from './types'
export * from './commands'
export { Schema, Attrs } from './schema'

// TODO: use export { default as schema } from './schema'
import schema from './schema'
export { schema }
