import React from 'react';
import {Button} from 'antd'
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          MY REACT APP
        </p>
        <Button>test</Button>
      </header>
    </div>
  );
}

export default App;
