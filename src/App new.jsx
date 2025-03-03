import React, { useEffect, useState } from 'react';
import { Upload, Users, Check } from 'lucide-react';
import Papa from 'papaparse';
import './App.css';

const App = () => {
    const [players, setPlayers] = useState([]);
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [skillImportance, setSkillImportance] = useState({});
    const [teams, setTeams] = useState({ team1: [], team2: [] });

    const [screen, setScreen] = useState('main')
    const [message, setMessage] = useState('No hay suficientes jugadores.')
    const [currentPlayer, setCurrentPlayer] = useState([])
    const [currentSkill, setCurrentSkill] = useState('')
    const [skills, setSkills] = useState({})
    const [creatingPlayer, setCreatingPlayer] = useState(false)
    const [newPlayerName, setNewPlayerName] = useState("");
    const [newPlayerCategory, setNewPlayerCategory] = useState("");
    

    const setAppHeight = () => {
        const app = document.querySelector('.app');
        if (app) app.style.height = `${window.innerHeight}px`;
    };

    const addSkill = (skillName) => {
        skills.set(skillName,players)
    }
    const deleteSkill = (skillName) => {
        skills.delete(skillName)
    }
    
    const addPlayer = (player) => {
        Object.keys(skills).forEach((skill) => {
            skills[skill] = [player, ...skills[skill]];
        });
    };

    const removePlayer = (player) => {
        Object.keys(skills).forEach((skill) => {
            skills[skill] = skills[skill].filter((player) => player !== player);
        });
    };

    const skillsFrom = (player) => {
        const result = {};
        Object.entries(skills).forEach(([skill, players]) => {
            const index = players.indexOf(player);
            if (index !== -1) {
                result[skill] = index;
            }
        });
        return result;
    };

    const skillsHaveSamePlayers = () => {
        return Object.values(skills).every(skillPlayers => {
            return new Set(skillPlayers).size === players.length
                && players.every(p => skillPlayers.includes(p))
        });
    };
        
    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                
                if (typeof jsonData !== "object" || Array.isArray(jsonData)) {
                throw new Error();
                }
        
                for (const key in jsonData) {
                if (!Array.isArray(jsonData[key])) {
                    throw new Error();
                }
                jsonData[key].forEach(player => {
                    if (typeof player !== "object" || !player.nombre || !player.categoria) {
                    throw new Error();
                    }
                });
                }
        
                setSkills(jsonData);
                setMessage(""); // Clear error if valid
            } catch {
                setMessage("Invalid JSON format");
            }
        };
        reader.readAsText(file);
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
            setMessage("Selecciona al menos 2 jugadores");
            return;
        }
    
        const skillColumns = Object.keys(skillImportance);
        
        // Calculate player scores
        const calculatePlayerScore = (player) => {
            return skillColumns.reduce((score, col) => {
                const skillImportanceValue = skillImportance[col];
                const skillValue = parseFloat(player[col] || 0);
                return score + (skillValue * skillImportanceValue);
            }, 0);
        };
    
        // Add scores to all players
        const playersWithScores = selectedPlayers.map(player => ({
            ...player,
            score: calculatePlayerScore(player)
        }));
    
        // Randomly select first players for each team
        const team1 = [];
        const team2 = [];
        let team1Score = 0;
        let team2Score = 0;
    
        // Random selection for first player in team 1
        const randomIndex1 = Math.floor(Math.random() * playersWithScores.length);
        const firstTeam1Player = playersWithScores[randomIndex1];
        team1.push(firstTeam1Player);
        team1Score += firstTeam1Player.score;
    
        // Remove first player from the pool
        const remainingPlayers = playersWithScores.filter((_, index) => index !== randomIndex1);
    
        // Random selection for first player in team 2
        const randomIndex2 = Math.floor(Math.random() * remainingPlayers.length);
        const firstTeam2Player = remainingPlayers[randomIndex2];
        team2.push(firstTeam2Player);
        team2Score += firstTeam2Player.score;
    
        // Remove second player from the pool
        const finalRemainingPlayers = remainingPlayers.filter((_, index) => index !== randomIndex2);
    
        // Group remaining players by category
        const playersByCategory = {};
        finalRemainingPlayers.forEach(player => {
            const category = player.categoria || 'Sin categoria';
            if (!playersByCategory[category]) {
                playersByCategory[category] = [];
            }
            playersByCategory[category].push(player);
        });
    
        // Helper function to get the count of a category in a team
        const getCategoryCount = (team, category) => {
            return team.filter(player => 
                (player.categoria || 'Sin categoria') === category
            ).length;
        };
    
        // Distribute remaining players category by category
        Object.values(playersByCategory).forEach(categoryPlayers => {
            categoryPlayers.forEach(player => {
                const category = player.categoria || 'Sin categoria';
                const team1CategoryCount = getCategoryCount(team1, category);
                const team2CategoryCount = getCategoryCount(team2, category);
    
                if (team1CategoryCount <= team2CategoryCount && team1Score <= team2Score) {
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

    useEffect(() => {
        setAppHeight();
        window.addEventListener('resize', setAppHeight);
        return () => window.removeEventListener('resize', setAppHeight);
    }, []);

    return (
        <div className='app'>
            <div className='notification_bar'>
                <p className='message'>{message}</p>
            </div>
            <div className='main_screen'>
                {
                    (screen == 'main') &&
                    <div>
                        <div className='option' onClick={()=>setScreen('players')}>
                            <p>Jugadores</p>
                        </div>
                        <div className='option' onClick={()=>setScreen('skills')}>
                            <p>Habilidades</p>
                        </div>
                        <div className='option' onClick={()=>setScreen('teamBuilder')}>
                            <p>Armar equipos</p>
                        </div>
                    </div>
                }
                {
                    (screen == 'players') &&
                    <div>
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
                        <div onClick={() => setCreatingPlayer(true)}>
                            <p>Crear jugador</p>
                        </div>
                        {
                            (creatingPlayer) &&
                            <div>
                                <div>
                                    <label>Nombre:</label>
                                    <input
                                        type="text"
                                        value={newPlayerName}
                                        onChange={(e) => setNewPlayerName(e.target.value)}
                                        className="w-full p-2 border rounded mb-4"
                                    />    
                                    <label className="block mb-2">Categoría:</label>
                                    <input
                                        type="text"
                                        value={newPlayerCategory}
                                        onChange={(e) => setNewPlayerCategory(e.target.value)}
                                        className="w-full p-2 border rounded"
                                    />
                                    <div className='button-panel'>
                                        <div className='button'>
                                            <p>Cancelar</p>
                                        </div>
                                        <div className='button'>
                                            <p>Guardar</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                        <p>{players.length} jugadores</p>
                        <div className="players">
                            {players.map((player, index) => (
                                <div 
                                    key={index} 
                                    onClick={(() => setCurrentPlayer(player),() => setScreen(`player`))}
                                    className={`player_item`}
                                >
                                    <p>{player.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                }
                {
                    (screen == 'player') &&
                    <div>
                        <div className='option'>
                            <p>{currentPlayer[0]}</p>
                        </div>
                        {Object.entries(skillsFrom(currentPlayer)).map((skill, value) => (
                                <div 
                                    key={value} 
                                    onClick={(setScreen(`skill`))}
                                    className={`skill_item`}
                                >
                                    <p>{skill}</p>
                                </div>
                            ))}
                    </div>
                }
                {
                    (screen == 'skills') &&
                    <div>
                        <div className="skills">
                            {Object.keys(skills).map((skill, index) => (
                                <div 
                                    key={index} 
                                    onClick={(() => setCurrentSkill(skill),setScreen(`skill`))}
                                    className={`skill-item`}
                                >
                                    <p>{skill}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                }
                {
                    (screen == 'skill') &&
                    <div>
                        <div className='option'>
                            <p>{currentSkill}</p>
                        </div>
                        <div className="skills">
                            {Object.values(currentSkill).map((player, index) => (
                                <div 
                                    key={index} 
                                    onClick={(() => setCurrentPlayer(player),setScreen(`player`))}
                                    className={`player-item`}
                                >
                                    <p>{player}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                }
                {
                    (screen == 'teamBuilder') &&
                    <div>
                        <div className='option'>
                            <p>Seleccionar jugadores</p>
                            <div className="player-selection">
                                {players.map((player, index) => (
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
                            <div className='content'>
                                {teams.team1.length > 0 && (
                                    <div className="teams-container">
                                        <div className="team">
                                            <h3>Equipo 1</h3>
                                            {teams.team1.map((player, index) => (
                                                <p key={index}>
                                                    {player.Jugador}
                                                </p>
                                            ))}
                                        </div>
                                        
                                        <div className="team">
                                            <h3>Equipo 2</h3>
                                            {teams.team2.map((player, index) => (
                                                <p key={index}>
                                                    {player.Jugador}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className='option' onClick={createTeams}>
                            <p>Armar equipos</p>
                        </div>
                    </div>
                }
            </div>
            <div className='tools'>
                <div className='option'>
                    <p>Exportar</p>
                </div>
                <div className='option'>
                    <p>Guardar</p>
                </div>
            </div>
        </div>
    );
};

export default App;