import fetch from 'node-fetch';

fetch('http://localhost:3000/api/properties')
  .then(res => res.text())
  .then(text => console.log(text))
  .catch(err => console.error(err));
