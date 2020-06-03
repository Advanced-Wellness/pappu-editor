import { EditorState, Transaction } from 'prosemirror-state'
import { NodeType } from 'prosemirror-model'

export function ChangeBlockType(state: EditorState, newtype: NodeType, newattribs: object, dispatch: (tr: Transaction<any>) => void) {
  let transaction = state.tr

  state.doc.nodesBetween(state.selection.from, state.selection.to, (node, pos) => {
    // We will not change text nodes because they are leafs
    if (!node.isText) {
      transaction.setNodeMarkup(pos, newtype, { ...node.attrs, ...newattribs }) // undefined means keep the original node
    }
  })

  dispatch(transaction)
}

export function ChangeAlignment(state: EditorState, align: string | null, dispatch: (tr: Transaction<any>) => void) {
  let transaction = state.tr

  state.doc.nodesBetween(state.selection.from, state.selection.to, (node, pos) => {
    // Now check if node can have align atrib or not
    // Also check if node is text because we don't apply it to text
    if (!node.isText && 'align' in node.attrs) {
      transaction.setNodeMarkup(pos, undefined, { ...node.attrs, align }) // undefined means keep the original node
    }
  })

  dispatch(transaction)
}
