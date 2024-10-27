import './App.css';
import Option from './components/Option';
import options from './data/options';
import { useEffect, useRef, useState } from 'react';
import Papa from 'papaparse';

const App = () => {
    const fileInputRef = useRef(null); // Referencia para el input de archivo
    const [players, setPlayers] = useState([]); // Lista temporal de jugadores

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
                const importedPlayers = results.data;
                setPlayers(importedPlayers); // Actualiza la lista de jugadores en el estado
                console.log("Jugadores importados:", importedPlayers); // Muestra los jugadores en la consola
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
                    {players.length === 0 ? (
                        <p>No hay jugadores cargados</p>
                    ) : (
                        <p>{players.length} jugadores cargados</p>
                    )}
                </div>
                <div className='content'>
                    <p>jugadores o equipos</p>
                    <ul>
                        {players.map((player, index) => (
                            <li key={index}>{player.nombre} - {player.posición}</li>
                        ))}
                    </ul>
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
