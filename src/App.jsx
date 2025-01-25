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
                
                const requiredColumns = [
                    'Jugador', 
                    'Al Arco', 
                    'Defensa', 
                    'Estado Fisico', 
                    'Pase', 
                    'Idea de Juego', 
                    'Gol'
                ];
                
                const columns = Object.keys(results.data[0]);
                const missingColumns = requiredColumns.filter(col => !columns.includes(col));
                
                if (missingColumns.length > 0) {
                    setError(`Columnas faltantes: ${missingColumns.join(', ')}`);
                    return;
                }

                const validatedPlayers = results.data.map(player => {
                    const skillColumns = requiredColumns.slice(1);
                    const averageSkill = skillColumns.reduce((sum, col) => 
                        sum + (parseFloat(player[col]) || 0), 0) / skillColumns.length;

                    return {
                        ...player,
                        AverageSkill: averageSkill
                    };
                });

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

        const sortedPlayers = [...players].sort((a, b) => b.AverageSkill - a.AverageSkill);

        const team1 = [];
        const team2 = [];
        
        sortedPlayers.forEach((player, index) => {
            if (index % 2 === 0) {
                team1.push(player);
            } else {
                team2.push(player);
            }
        });

        // Recalculate team average skills
        const calculateTeamSkills = (team) => {
            const skillColumns = [
                'Al Arco', 
                'Defensa', 
                'Estado Fisico', 
                'Pase', 
                'Idea de Juego', 
                'Gol'
            ];

            const teamSkills = skillColumns.reduce((acc, skill) => {
                acc[skill] = team.reduce((sum, player) => sum + parseFloat(player[skill]), 0) / team.length;
                return acc;
            }, {});

            return teamSkills;
        };

        const team1Skills = calculateTeamSkills(team1);
        const team2Skills = calculateTeamSkills(team2);

        setTeams({ 
            team1, 
            team2, 
            team1Skills, 
            team2Skills 
        });
    };

    const copyPlayersToClipboard = (teamKey) => {
        const team = teams[teamKey];
        const teamSkills = teams[`${teamKey}Skills`];
        
        const teamDetails = team.map(player => 
            `${player.Jugador} - Promedio: ${player.AverageSkill.toFixed(2)}`
        ).join('\n');

        const skillsDetails = Object.entries(teamSkills)
            .map(([skill, value]) => `${skill}: ${value.toFixed(2)}`)
            .join('\n');

        navigator.clipboard.writeText(`Equipo:\n${teamDetails}\n\nPromedios por Habilidad:\n${skillsDetails}`)
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
                        <h3>Equipo 1 (Promedio: {teams.team1Skills ? Object.values(teams.team1Skills).reduce((a,b) => a+b, 0).toFixed(2) : '0'})</h3>
                        {teams.team1.map((player, index) => (
                            <p key={index}>
                                {player.Jugador} (Promedio: {player.AverageSkill.toFixed(2)})
                            </p>
                        ))}
                        <div>
                            <h4>Promedios por Habilidad:</h4>
                            {teams.team1Skills && Object.entries(teams.team1Skills).map(([skill, value]) => (
                                <p key={skill}>{skill}: {value.toFixed(2)}</p>
                            ))}
                        </div>
                        <button onClick={() => copyPlayersToClipboard('team1')}>
                            Copiar Equipo 1
                        </button>
                    </div>
                )}
                
                {teams.team2.length > 0 && (
                    <div>
                        <h3>Equipo 2 (Promedio: {teams.team2Skills ? Object.values(teams.team2Skills).reduce((a,b) => a+b, 0).toFixed(2) : '0'})</h3>
                        {teams.team2.map((player, index) => (
                            <p key={index}>
                                {player.Jugador} (Promedio: {player.AverageSkill.toFixed(2)})
                            </p>
                        ))}
                        <div>
                            <h4>Promedios por Habilidad:</h4>
                            {teams.team2Skills && Object.entries(teams.team2Skills).map(([skill, value]) => (
                                <p key={skill}>{skill}: {value.toFixed(2)}</p>
                            ))}
                        </div>
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