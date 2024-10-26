import './App.css'
import Option from './components/Option'
import options from './data/options'
import { useState, useEffect } from 'react'

const App = () => {

    //const [currentView, setcurrentView] = useState(0)
    // Función para ajustar la altura
    function setAppHeight() {
        const app = document.querySelector('.app');
        app.style.height = `${window.innerHeight}px`;
    }
    
    // Llamamos a la función al cargar la página y cuando la ventana cambia de tamaño
    window.addEventListener('load', setAppHeight);
    window.addEventListener('resize', setAppHeight);
    
    
    return (
        <>
            <div className='app'>
                <div className='notification'>
                    <p>
                        No hay jugadores cargados
                    </p>
                </div>
                <div className='content'>
                    <p>
                        jugadores o equipos
                    </p>
                </div>
                <div className='options'>
                    <div className='csv_handler'>
                        <p>
                            importar jugadores
                        </p>
                        <p>
                            exportar jugadores
                        </p>
                    </div>
                    <p>
                        armar equipos
                    </p>
                </div>
            </div>
        </>
    )
}

export default App
