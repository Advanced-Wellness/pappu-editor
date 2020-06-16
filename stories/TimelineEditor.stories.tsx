import React, { useRef } from 'react'
import TimelineEditor, { EditorAPI, EditorProps } from '../src/TimelineEditor'
import TimelineEditorPreview from '../src/TimelineEditor/Preview'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import '../src/style.scss'

const EditorContainer: React.FC<Partial<EditorProps>> = (props) => {
  const ref = useRef<EditorAPI>(null)

  return (
    <>
      <button
        onClick={() => {
          action('html')(ref.current && ref.current.html())
        }}
      >
        Show current HTML
      </button>
      <button
        onClick={() => {
          action('text')(ref.current && ref.current.text())
        }}
      >
        Show current TEXT
      </button>

      <button
        onClick={() => {
          action('set content')(
            ref.current &&
              ref.current.setContent('<p><b>I am</b> <em>set</em></p>'),
          )
        }}
      >
        set content
      </button>

      <button
        onClick={() => {
          action('append content')(
            ref.current &&
              ref.current.appendContent('<p><b>I am</b> <em>appended</em></p>'),
          )
        }}
      >
        append content
      </button>

      <button
        onClick={() => {
          action('clear state')(ref.current && ref.current.clearState())
        }}
      >
        clear state
      </button>
      <div style={{ marginTop: 20 }}>
        <TimelineEditor
          onChange={(view) => {
            localStorage.setItem(
              'editor-content',
              JSON.stringify(ref.current.getJSONContent()),
            )
          }}
          {...props}
          placeholder="Type your message here"
          ref={ref}
          onBlur={() => console.log('onBlur')}
          onFocus={() => console.log('onFocus')}
        />
      </div>
    </>
  )
}

const TimelineEditorPreviewComponent = () => {
  return (
    <TimelineEditorPreview
      initialValue={localStorage.getItem('editor-content')}
    />
  )
}

storiesOf('TimelineEditor', module).add('basic', () => <EditorContainer />)
storiesOf('TimelineEditor', module).add('preview', () => (
  <TimelineEditorPreviewComponent />
))
