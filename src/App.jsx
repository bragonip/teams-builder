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
        const calculatePlayerScore = (player) => {
            return skillColumns.reduce((score, col) => {
                const skillImportanceValue = skillImportance[col];
                const skillValue = parseFloat(player[col] || 0);
                return score + (skillValue * skillImportanceValue);
            }, 0);
        };
    
        const sortedPlayers = [...selectedPlayers].sort((a, b) => 
            calculatePlayerScore(b) - calculatePlayerScore(a)
        );
    
        // Randomize starting point
        const randomStartIndex = Math.floor(Math.random() * sortedPlayers.length);
        const reorderedPlayers = [
            ...sortedPlayers.slice(randomStartIndex),
            ...sortedPlayers.slice(0, randomStartIndex)
        ];
    
        const team1 = [];
        const team2 = [];
        let team1Score = 0;
        let team2Score = 0;
    
        for (const player of reorderedPlayers) {
            const playerScore = calculatePlayerScore(player);
            
            if (team1Score <= team2Score) {
                team1.push(player);
                team1Score += playerScore;
            } else {
                team2.push(player);
                team2Score += playerScore;
            }
        }
    
        setTeams({ team1, team2 });
    };

    const copyAllTeamsToClipboard = () => {
        const team1Players = teams.team1.map(player => `Equipo 1: ${player.Jugador}`);
        const team2Players = teams.team2.map(player => `Equipo 2: ${player.Jugador}`);
        const allTeamPlayers = [...team1Players, ...team2Players].join('\n');

        navigator.clipboard.writeText(allTeamPlayers)
            .then(() => alert(`Todos los jugadores copiados al portapapeles`))
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                        <div style={{ width: '48%' }}>
                            <h3>Equipo 1</h3>
                            {teams.team1.map((player, index) => (
                                <p key={index}>{player.Jugador}</p>
                            ))}
                        </div>
                        
                        <div style={{ width: '48%' }}>
                            <h3>Equipo 2</h3>
                            {teams.team2.map((player, index) => (
                                <p key={index}>{player.Jugador}</p>
                            ))}
                        </div>
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

            {teams.team1.length > 0 && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <button 
                        onClick={copyAllTeamsToClipboard}
                        style={{ 
                            padding: '10px', 
                            backgroundColor: '#007bff', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '5px', 
                            cursor: 'pointer' 
                        }}
                    >
                        Copiar Todos los Jugadores
                    </button>
                </div>
            )}
        </div>
    );
};

export default App;