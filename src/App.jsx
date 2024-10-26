import './App.css';
import Option from './components/Option';
import options from './data/options';
import { useEffect } from 'react';

const App = () => {
    // Función para ajustar la altura
    const setAppHeight = () => {
        const app = document.querySelector('.app');
        app.style.height = `${window.innerHeight}px`;
    }

    useEffect(() => {
        // Ajusta la altura inicial
        setAppHeight();
        
        // Añade los listeners para ajustar la altura al redimensionar
        window.addEventListener('resize', setAppHeight);
        
        // Limpia los listeners al desmontar el componente
        return () => window.removeEventListener('resize', setAppHeight);
    }, []);

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
    );
};

export default App;
