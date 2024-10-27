import './App.css';
import Option from './components/Option';
import options from './data/options';
import { useEffect, useRef } from 'react';
import Papa from 'papaparse';

const App = () => {
    const fileInputRef = useRef(null); // Referencia para el input de archivo

    const setAppHeight = () => {
        const app = document.querySelector('.app');
        app.style.height = `${window.innerHeight}px`;
    };

    const handleFileSelection = (event) => {
        const file = event.target.files[0];
        if (file) {
            fileInputRef.current = file; // Guarda la referencia del archivo cargado
        }
    };

    const importPlayers = () => {
        const file = fileInputRef.current;
        if (!file) return;
    
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const players = results.data;
                console.log(players); // Aquí ves la lista de jugadores importados
                // Puedes manejar la lista de jugadores aquí, como actualizar el estado
            },
            error: (error) => {
                console.error("Error al parsear el archivo CSV:", error);
            }
        });
    };

    useEffect(() => {
        setAppHeight();
        window.addEventListener('resize', setAppHeight);
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
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileSelection}
                            style={{ display: 'none' }}
                            id="fileInput"
                        />
                        <button onClick={() => document.getElementById('fileInput').click()}>
                            Seleccionar archivo CSV
                        </button>
                        <button onClick={importPlayers}>
                            Importar jugadores
                        </button>
                    </div>
                    <p>armar equipos</p>
                </div>
            </div>
        </>
    );
};

export default App;
