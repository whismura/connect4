import * as React from 'react';

import { BrowserRouter as Router } from 'react-router-dom';
import { RouterOutlet } from './RouterOutlet';

import { Provider } from 'react-redux';
import { store } from './redux/store';

import './App.css';

// import logo from './logo.svg';

class App extends React.Component {
  public render() {
    return (
      <div className="App">
        <Provider store={store}>
          {/* <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">Connect 4</h1>
          </header> */}
          <Router basename={'/connect4'}>
            <RouterOutlet/>
          </Router>
          <footer className="App-footer">
          © Copyright 2019 <a href="https://github.com/whismura" target="_blank">Whismura</a>
          </footer>
        </Provider>
      </div>
    );
  }
}

export default App;