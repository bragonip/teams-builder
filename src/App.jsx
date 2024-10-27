import './App.css';
import { useEffect, useState } from 'react';
import Papa from 'papaparse';

const App = () => {
    const [players, setPlayers] = useState([]); // Lista temporal de jugadores

    const setAppHeight = () => {
        const app = document.querySelector('.app');
        app.style.height = `${window.innerHeight}px`;
    };

    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const importedPlayers = results.data;
                setPlayers(importedPlayers); // Actualiza la lista de jugadores en el estado
                console.log("Jugadores importados:", importedPlayers);
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
                    {players.map((player, index) => (
                        <p key={index}>{player.Jugador}</p>
                    ))}
                </div>
                <div className='options'>
                    <div className='csv_handler'>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileImport} // Ejecuta la importación al seleccionar el archivo
                            style={{ display: 'none' }}
                            id="fileInput"
                        />
                        <label htmlFor="fileInput" style={{ cursor: 'pointer', color: 'whitesmoke' }}>
                            Importar jugadores
                        </label>
                    </div>
                    <p>Armar equipos</p>
                </div>
            </div>
        </>
    );
};

export default App;
