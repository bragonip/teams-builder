import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './App.css';

import { useRef } from 'react';


const App = () =>{

    const [screen, setScreen] = useState('main');
    const [players, setPlayers] = useState([]);
    const [skills, setSkills] = useState(new Map());
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [currentSkill, setCurrentSkill] = useState('');
    const [newPlayerName, setNewPlayerName] = useState("");
    const [newPlayerCategory, setNewPlayerCategory] = useState("");
    const [newSkillName, setNewSkillName] = useState("");
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [teams, setTeams] = useState({ teamA: [], teamB: [], totalA: 0, totalB: 0 });


    const fileInputRef = useRef(null);

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };
    
    // Función para normalizar un string (trim + mayúsculas)
    const normalizeString = (str) => str.trim().toUpperCase();

    // Función para agregar un jugador a todas las skills
    const addPlayer = () => {
        const normalizedPlayer = {
            name: normalizeString(newPlayerName),
            category: normalizeString(newPlayerCategory),
        };
    
        // Actualizar el estado de players
        setPlayers((prevPlayers) => [...prevPlayers, normalizedPlayer]);
    
        // Actualizar el estado de skills
        const updatedSkills = new Map(skills);
        updatedSkills.forEach((playersList, skillName) => {
            updatedSkills.set(skillName, [...playersList, normalizedPlayer]);
        });
    
        setSkills(updatedSkills);
        setNewPlayerName(""); // Limpiar campos después de agregar
        setNewPlayerCategory("");
    };

    // Función para eliminar un jugador de todas las skills
    const deletePlayer = (playerToDelete) => {
        // Actualizar el estado de players
        setPlayers((prevPlayers) =>
            prevPlayers.filter(
                (player) => player.name !== playerToDelete.name
            )
        );
    
        // Actualizar el estado de skills
        const updatedSkills = new Map(skills);
        updatedSkills.forEach((playersList, skillName) => {
            const updatedPlayers = playersList.filter(
                (player) => player.name !== playerToDelete.name
            );
            updatedSkills.set(skillName, updatedPlayers);
        });
    
        setSkills(updatedSkills);
    };


    // Función para agregar una skill con su lista de players
    const addSkill = () => {
        const normalizedSkillName = normalizeString(newSkillName);
        const updatedSkills = new Map(skills);
      
        if (updatedSkills.has(normalizedSkillName)) {
            toast.error("La skill ya existe");
            return;
        }
      
        // Tomar jugadores de la primera skill o array vacío
        const allPlayers = Array.from(updatedSkills.values())[0] || [];
        
        updatedSkills.set(normalizedSkillName, [...allPlayers]);
        setSkills(updatedSkills);
        setNewSkillName("");
    };
    
    // Corregido: Uso de Map en lugar de objeto
    const getPlayerRankInSkill = (player, skillName) => {
        const playersInSkill = skills.get(skillName);
        if (!playersInSkill) return -1;
        
        return playersInSkill.findIndex(
            p => p.name === player.name && p.category === player.category
        ) + 1; // +1 para mostrar posición desde 1 en lugar de desde 0
    };

    // Corregido: Uso de Map en lugar de objeto
    const getPlayerSkills = (player) => {
        if (!player) return {};
        
        const playerSkills = {};
        
        skills.forEach((playersInSkill, skillName) => {
            const rank = getPlayerRankInSkill(player, skillName);
            if (rank > 0) {
                playerSkills[skillName] = rank;
            }
        });
        
        return playerSkills;
    };

    // Función para manejar el cambio de orden al arrastrar y soltar
    const handleSkillDragEnd = (result) => {
        const { destination, source } = result;

        // Si no hay un destino válido, no hacemos nada
        if (!destination) return;

        // Si la habilidad se soltó en el mismo lugar, no hacemos nada
        if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
        ) {
        return;
        }

        // Convertimos el Map de habilidades a un array
        const skillsArray = Array.from(skills.entries());

        // Movemos la habilidad de la posición inicial a la final
        const [movedSkill] = skillsArray.splice(source.index, 1);
        skillsArray.splice(destination.index, 0, movedSkill);

        // Convertimos el array de nuevo a un Map
        const updatedSkills = new Map(skillsArray);
        setSkills(updatedSkills);
    };

    const handleDragEnd = (result) => {
        const { destination, source } = result;
    
        // Si no hay un destino válido, no hacemos nada
        if (!destination) return;
    
        // Si el jugador se soltó en el mismo lugar, no hacemos nada
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }
    
        // Obtenemos la lista de jugadores de la habilidad actual
        const updatedPlayers = Array.from(skills.get(currentSkill));
    
        // Movemos el jugador de la posición inicial a la final
        const [movedPlayer] = updatedPlayers.splice(source.index, 1);
        updatedPlayers.splice(destination.index, 0, movedPlayer);
    
        // Actualizamos el estado de las habilidades
        const updatedSkills = new Map(skills);
        updatedSkills.set(currentSkill, updatedPlayers);
        setSkills(updatedSkills);
    };

    const exportSkills = () => {
        // Convertir el Map a un array de pares [key, value]
        const skillsArray = Array.from(skills.entries());
    
        // Convertir el array a JSON
        const jsonString = JSON.stringify(skillsArray, null, 2);
    
        // Crear un archivo Blob con el JSON
        const blob = new Blob([jsonString], { type: "application/json" });
    
        // Crear un enlace de descarga
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "skills.json"; // Nombre del archivo
        link.click();
    
        // Liberar el objeto URL
        URL.revokeObjectURL(url);
    };

    const importSkills = (event) => {
        const file = event.target.files[0];
    
        if (!file) {
            toast.error("No se seleccionó ningún archivo");
            return;
        }
    
        const reader = new FileReader();
    
        reader.onload = (e) => {
            try {
                const jsonString = e.target.result;
                const skillsArray = JSON.parse(jsonString);
                const importedSkills = new Map(skillsArray);
                
                // Tomar los jugadores de la primera habilidad en la lista
                if (importedSkills.size > 0) {
                    const firstSkillName = Array.from(importedSkills.keys())[0];
                    const playersFromSkill = importedSkills.get(firstSkillName);
                    setPlayers(playersFromSkill);
                }
                
                setSkills(importedSkills);
                toast.success("Datos importados correctamente");
            } catch (error) {
                toast.error("Error al importar el archivo: Formato inválido");
                console.error(error);
            }
        };
    
        reader.readAsText(file);
        event.target.value = '';
    };

    // Función para calcular el valor de cada jugador
    const calculatePlayerValues = () => {
        const skillsArray = Array.from(skills.entries());
        const playersWithValues = [];

        skillsArray.forEach(([skillName, playersList], skillIndex) => {
            const skillPosition = skillIndex + 1;
            playersList.forEach((player, playerIndex) => {
                const playerPosition = playerIndex + 1;
                const value = skillPosition * playerPosition;
                playersWithValues.push({
                    ...player,
                    skill: skillName,
                    positionInSkill: playerPosition,
                    value: value,
                });
            });
        });

        return playersWithValues;
    };

    // Función para crear equipos balanceados
    const createTeams = () => {
        if (selectedPlayers.length < 2) {
            toast.warn("Se necesitan al menos 2 jugadores para formar equipos");
            return { teamA: [], teamB: [], totalA: 0, totalB: 0 };
        }

        let players = [...selectedPlayers];
        const teamA = [];
        const teamB = [];

        // Paso 1: Selección inicial aleatoria
        const firstPlayerIndex = Math.floor(Math.random() * players.length);
        teamA.push(players.splice(firstPlayerIndex, 1)[0]);

        const secondPlayerIndex = Math.floor(Math.random() * players.length);
        teamB.push(players.splice(secondPlayerIndex, 1)[0]);

        // Paso 2: Agrupar por categoría y distribuir
        const playersByCategory = players.reduce((acc, player) => {
            acc[player.category] = acc[player.category] || [];
            acc[player.category].push(player);
            return acc;
        }, {});

        Object.entries(playersByCategory).forEach(([category, categoryPlayers]) => {
            const sorted = categoryPlayers.sort((a, b) => b.value - a.value);
            
            sorted.forEach((player, index) => {
                // Para categorías con número impar: balanceamos usando el valor total
                const currentAValue = teamA.reduce((sum, p) => sum + p.value, 0);
                const currentBValue = teamB.reduce((sum, p) => sum + p.value, 0);
                
                if (index % 2 === 0 || currentAValue <= currentBValue) {
                    teamA.push(player);
                } else {
                    teamB.push(player);
                }
            });
        });

        // Paso 3: Balance final para jugadores restantes
        let totalA = teamA.reduce((sum, p) => sum + p.value, 0);
        let totalB = teamB.reduce((sum, p) => sum + p.value, 0);

        while (players.length > 0) {
            const player = players.pop();
            if (totalA <= totalB) {
                teamA.push(player);
                totalA += player.value;
            } else {
                teamB.push(player);
                totalB += player.value;
            }
        }

        return { teamA, teamB, totalA, totalB };
    };

    // Función para manejar la selección de jugadores para equipos
    const togglePlayerSelection = (player) => {
        const playerWithValues = calculatePlayerValues().find(
            p => p.name === player.name && p.category === player.category
        );
        
        if (!playerWithValues) return;
        
        setSelectedPlayers(prev => {
            const isSelected = prev.some(
                p => p.name === player.name && p.category === player.category
            );
            
            if (isSelected) {
                return prev.filter(
                    p => p.name !== player.name || p.category !== player.category
                );
            } else {
                return [...prev, playerWithValues];
            }
        });
    };

    // Función para generar los equipos
    const generateTeams = () => {
        const newTeams = createTeams();
        setTeams(newTeams);
    };

    // Función para verificar si un jugador está seleccionado
    const isPlayerSelected = (player) => {
        return selectedPlayers.some(
            p => p.name === player.name && p.category === player.category
        );
    };

    return(
        <div className='app'>
            {/*-----------------------main screen-----------------------*/}
            {(screen === 'main') &&
            (<div className='main_screen'>
                <div className='main_option' onClick={()=>setScreen('players')}>
                    <p>JUGADORES</p>
                </div>
                <div className='main_option' onClick={()=>setScreen('skills')}>
                    <p>HABILIDADES</p>
                </div>
                <div className='main_option' onClick={()=>setScreen('teams')}>
                    <p>EQUIPOS</p>
                </div>
            </div>)}
            {/*-----------------------players screen--------------------*/}
            {(screen === 'players') &&
            (<div className='players_screen'>
                <div className='players_io_data'>
                <div>
                    {/* Botón para exportar */}
                    <button onClick={exportSkills}>Exportar Skills</button>

                    {/* Input de archivo oculto */}
                    <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        onChange={importSkills} 
                        style={{ display: "none" }}
                    />
                    {/* Botón para importar */}
                    <button onClick={triggerFileInput}>Importar Skills</button>
                </div>
                </div>
                <div className='players_create'>
                    <div className='players_create_input'>
                        <input
                            type="text"
                            placeholder="Nombre"
                            value={newPlayerName}
                            onChange={(e) => setNewPlayerName(e.target.value)}
                            />
                        <input
                            type="text"
                            placeholder="Categoría"
                            value={newPlayerCategory}
                            onChange={(e) => setNewPlayerCategory(e.target.value)}
                            />
                    </div>
                    <div className='players_save_player'>
                        <button onClick={()=>addPlayer()}>Guardar</button>
                    </div>
                </div>
                <div className='players_list'>
                    <p>{players.length} JUGADORES CARGADOS</p>
                    {players.map((player, index) => (
                        <div 
                            key={index} 
                            className="players_list_item"
                            onClick={() => {setScreen('player');setCurrentPlayer(player)}}
                        >
                            <p>{player.name}</p>
                        </div>
                    ))}
                </div>
            </div>)}
            {/*-----------------------player screen---------------------*/}
            {(screen === 'player') && (
            <div className='player'>
                <div className='player_header'>
                    <p>{currentPlayer.name}
                        - {currentPlayer.category}</p>
                    <div className='player_delete' onClick={() => {
                        deletePlayer(currentPlayer);
                        setScreen('players');
                    }}>
                        <p>Eliminar jugador</p>
                    </div>
                </div>
                <div className="player_skills_list">
                    <p>Habilidades</p>
                    {Object.entries(getPlayerSkills(currentPlayer))
                        .sort((a, b) => a[1] - b[1])
                        .map(([skill, rank], index) => (
                            <div 
                                key={index} 
                                onClick={() => {
                                    setScreen('skill');
                                    setCurrentSkill(skill);
                                }}
                                className="player_skill_list_item"
                            >
                                <p>{skill}: Posición {rank}</p>
                            </div>
                        ))}
                </div>
            </div>)}
            {/*-----------------------skills screen---------------------*/}
            {(screen === 'skills') && (
            <div className='skills'>
                <div className='skills_header'>
                    <p>HABILIDADES</p>
                </div>
                <div className='skills_create'>
                    <div className='skills_create_input'>
                        <input
                            type="text"
                            placeholder="Nombre"
                            value={newSkillName}
                            onChange={(e) => setNewSkillName(e.target.value)}
                            />
                    </div>
                    <div className='players_save_skill'>
                        <button onClick={()=>addSkill()}>Guardar</button>
                    </div>
                </div>
                <div className="skills_list">
                    <p>Habilidades</p>
                    <DragDropContext onDragEnd={handleSkillDragEnd}>
                    <Droppable droppableId="skills-list">
                        {(provided) => (
                        <div
                            className="skills-list"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {Array.from(skills.entries()).map(([skillName, players], index) => (
                            <Draggable
                                key={skillName}
                                draggableId={skillName}
                                index={index}
                            >
                                {(provided, snapshot) => (
                                <div
                                    className={`skill-item ${
                                    snapshot.isDragging ? "dragging" : ""
                                    }`}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => {
                                    setCurrentSkill(skillName);
                                    setScreen("skill");
                                    }}
                                >
                                    <p>{skillName}</p>
                                    <div className="drag-handle">⋮⋮</div>
                                </div>
                                )}
                            </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                        )}
                    </Droppable>
                    </DragDropContext>
                </div>
            </div>)}
            {/*-----------------------skill screen----------------------*/}
            {screen === "skill" && (
            <div className='skill'>
                <p>{currentSkill}</p>
                <div className='skill_players_list'>
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId={`skill-${currentSkill}`}>
                            {(provided) => (
                                <div
                                className="players-list ranked"
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                >
                                    {skills.get(currentSkill).map((player, index) => (
                                        <Draggable
                                            key={`${player.name}-${player.category}`}
                                            draggableId={`${player.name}-${player.category}`}
                                            index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <div
                                                    className={`player-item ${
                                                        snapshot.isDragging ? "dragging" : ""
                                                    }`}
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    onClick={(e) => {
                                                        // Solo navegamos al jugador si no estamos arrastrando
                                                        if (!snapshot.isDragging) {
                                                            e.stopPropagation();
                                                            setCurrentPlayer(player);
                                                            setScreen("player");
                                                        }
                                                    }}
                                                    >
                                                    <p>{player.name}</p>
                                                    <div className="drag-handle">⋮⋮</div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            </div>)}
            {/*-----------------------teams screen----------------------*/}
            {screen === "teams" && (
            <div className='teams'>
                <div className='teams_header'>
                    <p>FORMAR EQUIPOS</p>
                </div>
                <div className='teams_selection'>
                    <div className='teams_players_selection'>
                        <h3>Seleccionar Jugadores</h3>
                        {players.map((player, index) => (
                            <div 
                                key={index} 
                                className={`teams_player_item ${isPlayerSelected(player) ? 'selected' : ''}`}
                                onClick={() => togglePlayerSelection(player)}
                            >
                                <p>{player.name} - {player.category}</p>
                            </div>
                        ))}
                    </div>
                    <div className='teams_actions'>
                        <button onClick={generateTeams}>Generar Equipos</button>
                        <button onClick={() => setSelectedPlayers([])}>Limpiar Selección</button>
                    </div>
                </div>
                <div className='teams_result'>
                    <div className='team_a'>
                        <h3>Equipo A ({teams.totalA} puntos)</h3>
                        {teams.teamA.map((player, index) => (
                            <div key={index} className='team_player'>
                                <p>{player.name} ({player.value} pts)</p>
                            </div>
                        ))}
                    </div>
                    <div className='team_b'>
                        <h3>Equipo B ({teams.totalB} puntos)</h3>
                        {teams.teamB.map((player, index) => (
                            <div key={index} className='team_player'>
                                <p>{player.name} ({player.value} pts)</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>)}
            <button onClick={() => setScreen("main")}>Volver</button>
            {/* Añadir ToastContainer para mostrar notificaciones */}
            <ToastContainer position="bottom-right" />
        </div>
    )
};

export default App;