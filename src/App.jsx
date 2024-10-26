import './App.css'
import Option from './components/Option'
import options from './data/options'
import { useState, useEffect } from 'react'

const App = () => {

    //const [currentView, setcurrentView] = useState(0)
    
    return (
        <>
            <div className='app'>
                <div className='notifacation'>
                    <p>mensaje</p>
                </div>
                <div className='options'>
                    <p>
                        importar jugadores
                    </p>
                    <p>
                        exportar jugadores
                    </p>
                </div>
                <div className='content'>
                    <p>
                        jugadores o equipos
                    </p>
                </div>
                <div>
                    <p>
                        crear equipos
                    </p>
                </div>
            </div>
        </>
    )
}

export default App
