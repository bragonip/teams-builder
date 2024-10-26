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
                    <p>mensaje: aca van a ir todas las notificaciones que hagan falta</p>
                </div>
                <div className='content'>
                    <p>
                        jugadores o equipos
                    </p>
                </div>
                <div className='options'>
                    <p>
                        importar jugadores
                    </p>
                    <p>
                        exportar jugadores
                    </p>
                    <p>
                        armar equipos
                    </p>
                </div>
            </div>
        </>
    )
}

export default App
