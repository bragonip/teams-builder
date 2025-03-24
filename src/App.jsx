import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
//import './App.css';
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
    const [team1, setTeam1] = useState([])
    const [team2, setTeam2] = useState([])
    const fileInputRef = useRef(null);
    const [playersForTeams, setPlayersForTeams] = useState([])

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };
    

    // Add this useEffect to show a warning before page unload
    useEffect(() => {
        const handleBeforeUnload = (e) => {
        // This message might not be shown in some browsers that have disabled custom messages
        const message = "¿Seguro que quieres abandonar la página? Los cambios podrían no guardarse.";
        e.returnValue = message;
        return message;
        };
    
        window.addEventListener('beforeunload', handleBeforeUnload);
    
        return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // Función para normalizar un string (trim + mayúsculas)
    const normalizeString = (str) => str.trim().toUpperCase();

    // Función para agregar un jugador a todas las skills
    const addPlayer = () => {
        const normalizedPlayer = {
            name: normalizeString(newPlayerName),
            category: normalizeString(newPlayerCategory),
        };

        setPlayersForTeams(players)
    
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
        
        setPlayersForTeams(players)

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


    // Importar datos desde JSON
    const importSkills = (jsonString) => {
        try {
            const importedSkills = JSON.parse(jsonString);
            
            // Convierte el array de vuelta a Map
            const skillsMap = new Map(importedSkills);
            
            // First set the skills
            setSkills(skillsMap);
            
            // Then explicitly update the players list
            const updatedPlayers = updatePlayersList(skillsMap);
            setPlayers(updatedPlayers);
            setPlayersForTeams(updatedPlayers);
            
            return true;
        } catch (error) {
            toast.warn("Error al importar JSON: " + error.message);
            return false;
        }
    };

    // Ejemplo de cómo leer el archivo desde un input
    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const jsonString = e.target.result;
            importSkills(jsonString);
        };
        reader.readAsText(file); // ¡Importante! Leer como texto
    };

    // Actualizar lista de jugadores basado en las habilidades
    const updatePlayersList = (skillsData = skills) => {
        // Set para evitar duplicados
        const uniquePlayers = new Set();
        
        // Recorre todas las habilidades - use Map.forEach instead of Object.values
        skillsData.forEach(playersInSkill => {
            playersInSkill.forEach(player => {
                // Usamos JSON.stringify para convertir el objeto en string y poder compararlo
                uniquePlayers.add(JSON.stringify(player));
            });
        });
        
        // Convierte de nuevo a objetos
        const updatedPlayers = Array.from(uniquePlayers).map(playerStr => JSON.parse(playerStr));
        return updatedPlayers;
    };
        

    // Función para calcular el valor de cada jugador
    const calculatePlayerValues = () => {
        const skillsArray = Array.from(skills.entries());
        const playerValueMap = new Map(); // Para acumular los valores de cada jugador

        // Primero, inicializamos el mapa con todos los jugadores
        players.forEach(player => {
            playerValueMap.set(JSON.stringify(player), {
                ...player,
                value: 0,
                details: [] // Para guardar los detalles del cálculo
            });
        });

        // Recorremos cada habilidad
        skillsArray.forEach(([skillName, playersList], skillIndex) => {
            const skillPosition = skillIndex + 1; // Posición de la habilidad (1-based)
            
            // Recorremos cada jugador en esta habilidad
            playersList.forEach((player, playerIndex) => {
                const playerPosition = playerIndex + 1; // Posición del jugador en esta habilidad (1-based)
                const playerValue = skillPosition * playerPosition; // Valor para esta habilidad
                
                const playerKey = JSON.stringify(player);
                const playerData = playerValueMap.get(playerKey);
                
                if (playerData) {
                    // Acumulamos el valor
                    playerData.value += playerValue;
                    
                    // Guardamos los detalles del cálculo para debugging
                    playerData.details.push({
                        skill: skillName,
                        skillPosition: skillPosition,
                        playerPosition: playerPosition,
                        contribution: playerValue
                    });
                    
                    playerValueMap.set(playerKey, playerData);
                }
            });
        });
        
        // Convertimos el mapa a un array de jugadores con sus valores
        return Array.from(playerValueMap.values());
    };

    // Función para manejar la selección de jugadores para equipos
    //const togglePlayerSelection = (player) => {
    //    // Calculamos los valores de todos los jugadores
    //    const playersWithValues = calculatePlayerValues();
    //    
    //    // Encontramos el jugador con sus valores calculados
    //    const playerWithValue = playersWithValues.find(
    //        p => p.name === player.name && p.category === player.category
    //    );
    //    
    //    if (!playerWithValue) return;
    //    
    //    setSelectedPlayers(prev => {
    //        const isSelected = prev.some(
    //            p => p.name === player.name && p.category === player.category
    //        );
    //        
    //        if (isSelected) {
    //            return prev.filter(
    //                p => p.name !== player.name || p.category !== player.category
    //            );
    //        } else {
    //            return [...prev, playerWithValue];
    //        }
    //    });
    //};

    // Función para generar los equipos
    //const generateTeams = () => {
    //    const newTeams = createTeams();
    //    setTeams(newTeams);
    //};
//
    //// Función para verificar si un jugador está seleccionado
    //const isPlayerSelected = (player) => {
    //    return selectedPlayers.some(
    //        p => p.name === player.name && p.category === player.category
    //    );
    //};

    const removePlayerFromTeam = (playerToRemove) => {
        // Eliminar de un equipo específico
        const newTeam1 = team1.filter(player => player.name !== playerToRemove.name)
        const newTeam2 = team2.filter(player => player.name !== playerToRemove.name)
        
        // Actualizar equipos
        setTeam1(newTeam1)
        setTeam2(newTeam2)
        
        // Añadir de vuelta a players y playersForTeams
        const updatedPlayers = [...players, playerToRemove];
        setPlayers(updatedPlayers);
        setPlayersForTeams(updatedPlayers);
    }

    const addPlayerToTeam = (playerToAdd, isTeam1) => {
        if (isTeam1) {
            setTeam1([...team1, playerToAdd])
        } else {
            setTeam2([...team2, playerToAdd])
        }
        
        // Usar players en lugar de playersForTeams
        const updatedPlayers = players.filter(player => player.name !== playerToAdd.name);
        
        // Actualizar tanto players como playersForTeams
        setPlayers(updatedPlayers);
        setPlayersForTeams(updatedPlayers);
    }

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
                        onChange={handleFileImport} 
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
                    <div className='team'>
                        {team1.map(player => (
                            <div key={player.name} className='team_player_item' onClick={() => removePlayerFromTeam(player)}>
                                <p>{player.name}</p>
                            </div>
                        ))}
                    </div>
                    <div className='teams_player'>
                        {players.map(player => (
                            <div key={player.name}>
                                <div onClick={() => addPlayerToTeam(player, true)}>
                                    <p>{'<'}</p>
                                </div>
                                <div className='team_player_item'>
                                    <p>{player.name}</p>
                                </div>
                                <div onClick={() => addPlayerToTeam(player, false)}>
                                    <p>{'>'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className='team'>
                        {team2.map(player => (
                            <div key={player.name} className='team_player_item' onClick={() => removePlayerFromTeam(player)}>
                                <p>{player.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <button onClick={() => setScreen("main")}>Volver</button>
            {/* Añadir ToastContainer para mostrar notificaciones */}
            <ToastContainer position="bottom-right" />
        </div>
    )
};

export default App;