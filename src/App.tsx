import { useState, useEffect } from 'react'
import logo from './logo.svg'
import './pico.min.css'
import './App.css'
import client from './client'
import Practitioners from './Practitioners'
// import Setup from './setup'

// Init data. This is just to make sure the data exists.
// Setup()

const orgID = '7190795'

function App() {
  const [name, setName] = useState('Organisation')
  useEffect(() => {
    document.title = `Organization, ${name}`;
  })
  client.search({
    resourceType: 'Organization',
    searchParams: { _id: orgID },
  })
  .then((data) => {
    setName(data.entry[0].resource.name)
  })
  .catch((err) => {
    console.log(err)
  })
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>{name}</h1>
      </header>
      <main>
        <Practitioners orgID={orgID} />
      </main>
    </div>
  );
}

export default App;
