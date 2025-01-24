import React, { useEffect, useState } from 'react';
import { Upload, Users, Copy } from 'lucide-react';
import Papa from 'papaparse';
import './App.css';

const App = () => {
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState({ team1: [], team2: [] });
    const [error, setError] = useState(null);

    const setAppHeight = () => {
        const app = document.querySelector('.app');
        if (app) app.style.height = `${window.innerHeight}px`;
    };

    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.data.length === 0) {
                    setError("El archivo CSV está vacío");
                    return;
                }
                
                // Validate required columns
                const requiredColumns = ['Jugador', 'Habilidad'];
                const columns = Object.keys(results.data[0]);
                const missingColumns = requiredColumns.filter(col => !columns.includes(col));
                
                if (missingColumns.length > 0) {
                    setError(`Columnas faltantes: ${missingColumns.join(', ')}`);
                    return;
                }

                // Ensure Habilidad is numeric
                const validatedPlayers = results.data.map(player => ({
                    ...player,
                    Habilidad: parseFloat(player.Habilidad) || 0
                }));

                setPlayers(validatedPlayers);
                setError(null);
            },
            error: (error) => {
                setError("Error al parsear el archivo CSV");
                console.error("Error al parsear el archivo CSV:", error);
            }
        });
    };

    const createTeams = () => {
        if (players.length === 0) {
            setError("No hay jugadores para distribuir");
            return;
        }

        // Sort players by skill in descending order
        const sortedPlayers = [...players].sort((a, b) => b.Habilidad - a.Habilidad);

        // Snake draft algorithm
        const team1 = [];
        const team2 = [];
        
        sortedPlayers.forEach((player, index) => {
            if (index % 2 === 0) {
                team1.push(player);
            } else {
                team2.push(player);
            }
        });

        setTeams({ team1, team2 });
    };

    const copyPlayersToClipboard = (teamKey) => {
        const teamPlayers = teams[teamKey].map(player => 
            `${player.Jugador} (Habilidad: ${player.Habilidad})`
        ).join('\n');

        navigator.clipboard.writeText(teamPlayers)
            .then(() => alert(`Equipo ${teamKey === 'team1' ? '1' : '2'} copiado al portapapeles`))
            .catch(err => console.error('Error al copiar:', err));
    };

    useEffect(() => {
        setAppHeight();
        window.addEventListener('resize', setAppHeight);
        return () => window.removeEventListener('resize', setAppHeight);
    }, []);

    return (
        <div className='app'>
            <div className='notification'>
                {error && <p style={{color: 'red'}}>{error}</p>}
                {players.length > 0 && !error && (
                    <p>{players.length} jugadores cargados</p>
                )}
            </div>
            
            <div className='content'>
                {players.length > 0 && (
                    <div>
                        <h3>Jugadores originales:</h3>
                        {players.map((player, index) => (
                            <p key={index}>{player.Jugador} - Habilidad: {player.Habilidad}</p>
                        ))}
                    </div>
                )}
                
                {teams.team1.length > 0 && (
                    <div>
                        <h3>Equipo 1:</h3>
                        {teams.team1.map((player, index) => (
                            <p key={index}>{player.Jugador} - Habilidad: {player.Habilidad}</p>
                        ))}
                        <button onClick={() => copyPlayersToClipboard('team1')}>
                            Copiar Equipo 1
                        </button>
                    </div>
                )}
                
                {teams.team2.length > 0 && (
                    <div>
                        <h3>Equipo 2:</h3>
                        {teams.team2.map((player, index) => (
                            <p key={index}>{player.Jugador} - Habilidad: {player.Habilidad}</p>
                        ))}
                        <button onClick={() => copyPlayersToClipboard('team2')}>
                            Copiar Equipo 2
                        </button>
                    </div>
                )}
            </div>
            
            <div className='options'>
                <div className='csv_handler'>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileImport}
                        style={{ display: 'none' }}
                        id="fileInput"
                    />
                    <label htmlFor="fileInput" style={{ cursor: 'pointer', color: 'whitesmoke', display: 'flex', alignItems: 'center' }}>
                        <Upload className="mr-2" /> Importar jugadores
                    </label>
                </div>
                <div 
                    onClick={createTeams} 
                    style={{ cursor: 'pointer', color: 'whitesmoke', display: 'flex', alignItems: 'center' }}
                >
                    <Users className="mr-2" />
                    <p>Armar equipos</p>
                </div>
            </div>
        </div>
    );
};

export default App;