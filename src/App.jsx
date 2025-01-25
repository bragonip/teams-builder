import React, { useEffect, useState } from 'react';
import { Upload, Users } from 'lucide-react';
import Papa from 'papaparse';
import './App.css';

const App = () => {
    const [players, setPlayers] = useState([]);
    const [skillImportance, setSkillImportance] = useState({});
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
                
                const columns = Object.keys(results.data[0]);
                const playerColumns = columns.filter(col => col !== 'Jugador');
                
                // First row contains importance values
                const importanceValues = results.data[0];
                const importance = {};
                playerColumns.forEach(col => {
                    importance[col] = parseFloat(importanceValues[col]) || 1;
                });
                setSkillImportance(importance);

                // Remove first row (importance) and set players
                const actualPlayers = results.data.slice(1);
                setPlayers(actualPlayers);
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

        const skillColumns = Object.keys(skillImportance);
        const sortedPlayers = [...players].sort((a, b) => {
            const calculatePlayerScore = (player) => {
                return skillColumns.reduce((score, col) => {
                    const skillImportanceValue = skillImportance[col];
                    const skillValue = parseFloat(player[col] || 0);
                    return score + (skillValue * skillImportanceValue);
                }, 0);
            };

            return calculatePlayerScore(b) - calculatePlayerScore(a);
        });

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
        const team = teams[teamKey];
        const teamPlayers = team.map(player => player.Jugador).join('\n');

        navigator.clipboard.writeText(teamPlayers)
            .then(() => alert(`Equipo copiado al portapapeles`))
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
                {teams.team1.length > 0 && (
                    <div>
                        <h3>Equipo 1</h3>
                        {teams.team1.map((player, index) => (
                            <p key={index}>{player.Jugador}</p>
                        ))}
                        <button onClick={() => copyPlayersToClipboard('team1')}>
                            Copiar Equipo 1
                        </button>
                    </div>
                )}
                
                {teams.team2.length > 0 && (
                    <div>
                        <h3>Equipo 2</h3>
                        {teams.team2.map((player, index) => (
                            <p key={index}>{player.Jugador}</p>
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