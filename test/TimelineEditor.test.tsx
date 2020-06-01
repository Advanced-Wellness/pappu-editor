import React from 'react';
import * as ReactDOM from 'react-dom';
import { Default as TimelineEditor } from '../stories/TimelineEditor.stories';

describe('TimelineEditor', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<TimelineEditor />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
