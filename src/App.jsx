import { useState } from 'react'
import './App.css'
import Option from './components/Option'

function App() {
  const [count, setCount] = useState(0)
  const options = ["Importar Jugadores","Exportar Jugadores"]

  return (
    <>
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
      <div>
        {options.map((option, index) => (
          <Option key={index} optionName={option}/>
        ))}
      </div>
    </>
  )
}

export default App
