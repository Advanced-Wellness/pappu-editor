import * as React from 'react'
import applyDevTools from 'prosemirror-dev-tools'
import styled from 'styled-components'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { undo, redo, history } from 'prosemirror-history'
import { keymap } from 'prosemirror-keymap'
import { baseKeymap } from 'prosemirror-commands'

import { TimelineEditorSchema } from '../Schema/TimelineEditor'
import MenuBar from './Menubar'

export interface ITimelineEditorProps {}

export default class TimelineEditor extends React.Component<ITimelineEditorProps> {
  element?: HTMLDivElement

  EditorView?: EditorView

  editorState?: EditorState

  componentDidMount() {
    this.editorState = EditorState.create({
      schema: TimelineEditorSchema,
      plugins: [history(), keymap({ 'Mod-z': undo, 'Mod-y': redo }), keymap(baseKeymap)]
    })
    this.EditorView = new EditorView(this.element, {
      state: this.editorState,
      dispatchTransaction: (transaction) => {
        // console.log('transaction:', transaction)
        if (!this.EditorView) {
          return
        }
        const { state } = this.EditorView.state.applyTransaction(transaction)

        this.EditorView.updateState(state)

        // Because Prosemirror and React are not linked we must tell React that
        // a render is needed whenever the Prosemirror state changes.
        this.forceUpdate()
      },
      handlePaste: (view, event, slice) => {
        console.log('view:', view, event, slice)
        return false
      }
    })
    this.forceUpdate()
    if (process.env.NODE_ENV !== 'production') {
      applyDevTools(this.EditorView)
    }
  }

  render() {
    return (
      <div>
        <div>
          {this.editorState && this.EditorView && (
            <MenuBar editorView={this.EditorView as EditorView} editorState={this.editorState as EditorState} />
          )}
        </div>
        <EditorContainer ref={(ref) => (this.element = ref as HTMLDivElement)} />
      </div>
    )
  }
}

const EditorContainer = styled.div`
  padding: 5px;
  border: 1px solid silver;

  .ProseMirror {
    position: relative;
    outline: none;
    word-wrap: break-word;
    white-space: pre-wrap;
    white-space: break-spaces;
    -webkit-font-variant-ligatures: none;
    font-variant-ligatures: none;
    font-feature-settings: 'liga' 0; /* the above doesn't seem to work in Edge */
  }
  p {
    margin: 2px;
  }
  .left-align-text {
    text-align: left;
  }
  .center-align-text {
    text-align: center;
  }
  .right-align-text {
    text-align: right;
  }
`
