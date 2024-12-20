import './App.css';
import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { RiTeamFill, RiFileUploadLine, RiFileCopyLine } from "react-icons/ri";

const App = () => {
    const [players, setPlayers] = useState([]); // Lista temporal de jugadores
    const [selectedPlayers, setselectedPlayers] = useState([]); // Lista temporal de jugadores

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

    // Función para copiar los jugadores al portapapeles
    const copyPlayersToClipboard = () => {
        // Convertimos los jugadores a JSON para copiar al portapapeles
        const playerText = players.map(player => player.Jugador).join('\n');

        navigator.clipboard.writeText(playerText)
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
                        <p>{players.length} jugadores cargados - {selectedPlayers.length} seleccionados</p>
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
                        <RiFileUploadLine />
                    </div>
                    <div>
                        <RiTeamFill />
                        <p>Armar equipos</p>
                    </div>
                    <div onClick={copyPlayersToClipboard} style={{ cursor: 'pointer', color: 'whitesmoke' }}>
                        <RiFileCopyLine />
                        <p>Copiar jugadores</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default App;
