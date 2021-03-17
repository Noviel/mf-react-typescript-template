import React from 'react';
import { render } from 'react-dom';

import App from './App';

export function main(): void {
  render(<App />, document.getElementById('root'));
}
