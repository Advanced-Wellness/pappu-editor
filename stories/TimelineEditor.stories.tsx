import React, { useState } from 'react';
import { TimelineEditor } from '../src';

export default {
  title: 'TimelineEditor',
};

// By passing optional props to this story, you can control the props of the component when
// you consume the story in a test.
export const Default = () =>
  <TimelineEditor
    readOnly={false}
    content={localStorage.getItem('editor-value')}
    onChange={(content) => {
      localStorage.setItem('editor-value', JSON.stringify(content))
    }}
  />
;

export const WithContentReadonly = () => {
  return(
    <TimelineEditor
      content={localStorage.getItem('editor-value')}
      readOnly={true}
    />
  )
}

export const TestHTML = () => {
  const [content, setContent] = useState<string>('')

  return (
    <div>
      <input style={{ width: '100%', height: '200px'}} placeholder="Enter your HTML here" type="text" name="" onChange={(e) => { setContent(e.target.value)}} id=""/>
      <TimelineEditor
        content={content}
        readOnly={true}
      />
    </div>
  )
}
