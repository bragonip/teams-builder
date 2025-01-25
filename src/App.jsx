import React, { useEffect, useState } from 'react';
import { Upload, Users, Check } from 'lucide-react';
import Papa from 'papaparse';
import './App.css';

const App = () => {
    const [allPlayers, setAllPlayers] = useState([]);
    const [selectedPlayers, setSelectedPlayers] = useState([]);
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
                if (results.data.length <= 1) {
                    setError("El archivo CSV está vacío o no tiene jugadores");
                    return;
                }
                
                const columns = Object.keys(results.data[0]);
                const playerColumns = columns.filter(col => col !== 'Jugador');
                
                const importanceValues = results.data[0];
                const importance = {};
                playerColumns.forEach(col => {
                    importance[col] = parseFloat(importanceValues[col]) || 1;
                });
                setSkillImportance(importance);

                const actualPlayers = results.data.slice(1);
                setAllPlayers(actualPlayers);
                setError(null);
            },
            error: (error) => {
                setError("Error al parsear el archivo CSV");
                console.error("Error al parsear el archivo CSV:", error);
            }
        });
    };

    const togglePlayerSelection = (player) => {
        setSelectedPlayers(prev => 
            prev.includes(player)
                ? prev.filter(p => p !== player)
                : [...prev, player]
        );
    };

    const createTeams = () => {
        if (selectedPlayers.length < 2) {
            setError("Selecciona al menos 2 jugadores");
            return;
        }

        const skillColumns = Object.keys(skillImportance);
        const sortedPlayers = [...selectedPlayers].sort((a, b) => {
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
                {allPlayers.length > 0 && (
                    <p>{allPlayers.length} jugadores en lista</p>
                )}
                {selectedPlayers.length > 0 && (
                    <p>{selectedPlayers.length} jugadores seleccionados para el partido</p>
                )}
            </div>
            
            <div className='content'>
                {allPlayers.length > 0 && (
                    <div>
                        <h3>Seleccionar Jugadores</h3>
                        {allPlayers.map((player, index) => (
                            <div 
                                key={index} 
                                onClick={() => togglePlayerSelection(player)}
                                style={{
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    cursor: 'pointer',
                                    backgroundColor: selectedPlayers.includes(player) ? '#4CAF50' : 'transparent',
                                    color: selectedPlayers.includes(player) ? 'white' : 'black',
                                    padding: '5px',
                                    margin: '2px 0'
                                }}
                            >
                                {selectedPlayers.includes(player) && <Check size={20} />}
                                {player.Jugador}
                            </div>
                        ))}
                    </div>
                )}

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