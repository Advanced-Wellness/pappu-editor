import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { TimelineEditor } from '../src/index';

const App = () => {
  return (
    <div>
      <TimelineEditor />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
