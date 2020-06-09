import * as React from 'react'
import applyDevTools from 'prosemirror-dev-tools'
import styled from 'styled-components'
import { EditorState } from 'prosemirror-state'
import { DOMParser } from 'prosemirror-model'
import { EditorView } from 'prosemirror-view'
import { undo, redo, history } from 'prosemirror-history'
import { keymap } from 'prosemirror-keymap'
import { baseKeymap } from 'prosemirror-commands'

import { TimelineEditorSchema } from '../Schema/TimelineEditor'
import MenuBar from './Menubar'

export interface ITimelineEditorProps {
  /** Gives you the current value */
  onChange?: (content: object, state: EditorState, view: EditorView) => void
  /** If its readonly, then it will show the content passed in 'content' prop. (default: false) */
  readOnly?: boolean
  /** Styles of Editor Area */
  editorStyles?: React.CSSProperties
  /** Styles of Complete Container */
  containerStyles?: React.CSSProperties
  /** Enables the prosemirror dev tools. (default: true) */
  enableDevTools?: boolean
  /** Content of the editor */
  content?: string | object | undefined | null
  /** Dont change it for now */
  emptyDocument?: object | null
}

export default class TimelineEditor extends React.Component<ITimelineEditorProps> {
  static defaultProps = {
    readOnly: false,
    enableDevTools: true,
    value: null,
    emptyDocument: {
      type: 'doc',
      content: [
        {
          type: 'paragraph'
        }
      ]
    }
  }

  element?: HTMLDivElement

  editorView?: EditorView

  editorState?: EditorState

  componentDidMount() {
    let doc = this.createDocument(this.props.content)
    this.editorState = EditorState.create({
      schema: TimelineEditorSchema,
      doc,
      plugins: [history(), keymap({ 'Mod-z': undo, 'Mod-y': redo }), keymap(baseKeymap)]
    })
    this.editorView = new EditorView(this.element, {
      state: this.editorState,
      editable: () => !this.props.readOnly,
      dispatchTransaction: (transaction) => {
        if (!this.editorView) {
          return
        }
        const { state, transactions } = this.editorView.state.applyTransaction(transaction)

        this.editorView.updateState(state)

        // If any of the transactions being dispatched resulted in the doc
        // changing then call our own change handler to let the outside world
        // know
        if (transactions.some((tr) => tr.docChanged)) {
          this.handleChange(state, this.editorView)
        }

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
    if (process.env.NODE_ENV !== 'production' && this.props.enableDevTools) {
      applyDevTools(this.editorView)
    }
  }

  componentDidUpdate(prevProps: ITimelineEditorProps) {
    if (this.props.content !== prevProps.content) {
      const doc = this.createDocument(this.props.content)
      this.editorView?.destroy()
      this.editorState = EditorState.create({
        schema: TimelineEditorSchema,
        doc,
        plugins: [history(), keymap({ 'Mod-z': undo, 'Mod-y': redo }), keymap(baseKeymap)]
      })
      this.editorView = new EditorView(this.element, {
        state: this.editorState,
        editable: () => !this.props.readOnly,
        dispatchTransaction: (transaction) => {
          if (!this.editorView) {
            return
          }
          const { state, transactions } = this.editorView.state.applyTransaction(transaction)

          this.editorView.updateState(state)

          // If any of the transactions being dispatched resulted in the doc
          // changing then call our own change handler to let the outside world know
          if (transactions.some((tr) => tr.docChanged)) {
            this.handleChange(state, this.editorView)
          }

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
    }
  }

  componentWillUnmount() {
    this.editorView?.destroy()
  }

  handleChange = (state: EditorState, view: EditorView) => {
    if (this.props.onChange && !this.props.readOnly) {
      this.props.onChange(state.doc.toJSON() as object, state, view)
    }
  }

  createDocument(content = this.props.content, parseOptions = {}) {
    if (content === null) {
      return TimelineEditorSchema.nodeFromJSON(this.props.emptyDocument as JSON)
    }

    if (typeof content === 'object') {
      try {
        return TimelineEditorSchema.nodeFromJSON(content)
      } catch (error) {
        console.warn('[warn]: Invalid content.', 'Passed value:', content, 'Error:', error)
        return TimelineEditorSchema.nodeFromJSON(this.props.emptyDocument as JSON)
      }
    }

    if (typeof content === 'string') {
      try {
        return TimelineEditorSchema.nodeFromJSON(JSON.parse(content))
      } catch (error) {
        console.log('error:', error)
        const element = document.createElement('div')
        element.innerHTML = content.trim()
        return DOMParser.fromSchema(TimelineEditorSchema).parse(element, parseOptions)
      }
    }

    return TimelineEditorSchema.nodeFromJSON(this.props.emptyDocument as JSON)
  }

  render() {
    return (
      <div style={this.props.containerStyles}>
        <div>
          {this.editorState && this.editorView && !this.props.readOnly && (
            <MenuBar editorView={this.editorView as EditorView} editorState={this.editorState as EditorState} />
          )}
        </div>
        <EditorContainer style={this.props.editorStyles} ref={(ref) => (this.element = ref as HTMLDivElement)} />
      </div>
    )
  }
}

const EditorContainer = styled.div`
  padding: 5px;

  .ProseMirror {
    position: relative;
    outline: none;
    word-wrap: break-word;
    white-space: pre-wrap;
    white-space: break-spaces;
  }
  p {
    margin: 2px;
  }
`
