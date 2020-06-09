import {
  Plugin as BasePlugin,
  EditorState as BaseEditorState,
  Transaction as BaseTransaction
} from 'prosemirror-state'
import {
  EditorView as BaseEditorView,
  DirectEditorProps
} from 'prosemirror-view'
import {
  NodeType as BaseNodeType,
  MarkType as BaseMarkType,
  Node as BaseNode,
  Mark as BaseMark,
  Fragment as BaseFragment
} from 'prosemirror-model'
import { Schema } from '../schema'
import { Command } from '../commands'

export interface ITimelineEditorProps {}

export type ApplyCommand = (command: Command) => any

export interface ProseMirrorInstance {
  view: EditorView
  initialState: EditorState
  subscribe: (callback: () => any) => () => any
  applyCommand: ApplyCommand
}

export type EditorView = BaseEditorView<Schema>
export type EditorState = BaseEditorState<Schema>
export type Transaction = BaseTransaction<Schema>
export type Dispatch = (tr: Transaction) => void

export type NodeType = BaseNodeType<Schema>

export type MarkType = BaseMarkType<Schema>

export type Node = BaseNode<Schema>

export type Mark = BaseMark<Schema>

export type Fragment = BaseFragment<Schema>
