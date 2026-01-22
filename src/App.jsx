import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Map from "./components/Map";


/*function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App*/

function App() {
  return (
    <div className="app">
      <header className="header">
        <div className="logo">Finnamie</div>
        <nav className="nav">
          <a href="#">Discover activities</a>
          <a href="#">Login</a>
        </nav>
      </header>

      <section className="booking-section">
        <h1>Discover Finland with a local</h1>
        <p>
          Find trusted local hosts for authentic experiences.
        </p>

        <div className="search-box">
          <input type="text" placeholder="Location" />
          <input type="date" />
          <select>
            <option>Activity type</option>
          </select>
          <button>Search</button>
        </div>
      </section>

      <section className="map-section">
        <Map />
      </section>

      <section className="info-section">
        <h2>How it works</h2>
        <div className="steps">
          <div className="step">
            <h3>1. Search</h3>
            <p>Find a local host, place or activity that fits you.</p>
          </div>
          <div className="step">
            <h3>2. Book</h3>
            <p>Choose a time and book securely online.</p>
          </div>
          <div className="step">
            <h3>3. Experience</h3>
            <p>Enjoy Finland like a local.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>Finnamie</p>
        <div className="footer-links">
          <a href="#">About</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
