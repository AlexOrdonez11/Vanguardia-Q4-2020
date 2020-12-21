import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css'
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import fixt from './components/Main'

console.log(fixt);
var request = require("request");
var options = {
  method: 'GET',
  url: 'https://v2.api-football.com/fixtures/league/2771/last/16',
  headers: {
    'x-rapidapi-host': 'v2.api-football.com',
    'x-rapidapi-key': '87695023de3d9d0e098e04ffd4a32e3e'
  }
};

request(options, (error, response, body) => {
  if (error) throw new Error(error);
  ReactDOM.render(<App body={body} />, document.getElementById('root'));
});
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
