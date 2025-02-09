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
    
        const skillColumns = Object.keys(skillImportance).filter(col => col !== 'Categoria');
        
        // Calculate player scores
        const calculatePlayerScore = (player) => {
            return skillColumns.reduce((score, col) => {
                const skillImportanceValue = skillImportance[col];
                const skillValue = parseFloat(player[col] || 0);
                return score + (skillValue * skillImportanceValue);
            }, 0);
        };

        // Group players by category
        const playersByCategory = selectedPlayers.reduce((acc, player) => {
            const category = player.Categoria || 'Sin categoria';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push({
                ...player,
                score: calculatePlayerScore(player)
            });
            return acc;
        }, {});

        // Sort players within each category by score
        Object.values(playersByCategory).forEach(categoryPlayers => {
            categoryPlayers.sort((a, b) => b.score - a.score);
        });

        const team1 = [];
        const team2 = [];
        let team1Score = 0;
        let team2Score = 0;

        // Distribute players by category
        Object.entries(playersByCategory).forEach(([category, players]) => {
            players.forEach((player, index) => {
                // For each category, alternate between teams, but consider total team score
                if (team1Score <= team2Score) {
                    team1.push(player);
                    team1Score += player.score;
                } else {
                    team2.push(player);
                    team2Score += player.score;
                }
            });
        });

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
                {error && <p className="error-message">{error}</p>}
                {allPlayers.length > 0 && (
                    <p>Jugadores en lista: {allPlayers.length}</p>
                )}
                {selectedPlayers.length > 0 && (
                    <p>Jugadores seleccionados: {selectedPlayers.length}</p>
                )}
            </div>
            
            <div className='content'>
                {allPlayers.length > 0 && (
                    <div className="player-selection">
                        <h3>Seleccionar Jugadores</h3>
                        {allPlayers.map((player, index) => (
                            <div 
                                key={index} 
                                onClick={() => togglePlayerSelection(player)}
                                className={`player-item ${selectedPlayers.includes(player) ? 'selected' : ''}`}
                            >
                                {selectedPlayers.includes(player) && <Check size={20} />}
                                {player.Jugador}
                            </div>
                        ))}
                    </div>
                )}

                {teams.team1.length > 0 && (
                    <div className="teams-container">
                        <div className="team">
                            <h3>Equipo 1</h3>
                            {teams.team1.map((player, index) => (
                                <p key={index}>{player.Jugador}</p>
                            ))}
                        </div>
                        
                        <div className="team">
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
                        id="fileInput"
                        className="file-input"
                    />
                    <label htmlFor="fileInput" className="file-label">
                        <Upload className="mr-2" /> Importar jugadores
                    </label>
                </div>
                <div 
                    onClick={createTeams} 
                    className="create-teams-btn"
                >
                    <Users className="mr-2" />
                    <p>Armar equipos</p>
                </div>
            </div>

            {teams.team1.length > 0 && (
                <div className="copy-teams-container">
                    <button 
                        onClick={copyAllTeamsToClipboard}
                        className="copy-teams-btn"
                    >
                        Copiar Todos los Jugadores
                    </button>
                </div>
            )}
        </div>
    );
};

export default App;