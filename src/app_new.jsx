import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './App.css';
import React from 'react';

const App = () => {
    // Estados para los datos
    const [skills, setSkills] = useState(new Map());
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    // Estados para la navegación
    const [screen, setScreen] = useState('main');
    const [message, setMessage] = useState('');
        
    // Estados para selección actual
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [currentSkill, setCurrentSkill] = useState('');
    
    // Estados para creación de nuevos elementos
    const [creatingPlayer, setCreatingPlayer] = useState(false);
    const [creatingSkill, setCreatingSkill] = useState(false);
    const [newPlayerName, setNewPlayerName] = useState("");
    const [newPlayerCategory, setNewPlayerCategory] = useState("");
    const [newSkillName, setNewSkillName] = useState("");
    
    // Estado para rastrear cambios sin guardar
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    
    // Efecto para manejar la advertencia antes de salir de la página
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                const message = "Tienes cambios sin guardar. Si sales de la página, perderás todos tus datos.";
                e.returnValue = message;
                return message;
            }
        };
        
        const handlePopState = (e) => {
            if (hasUnsavedChanges) {
                const confirmLeave = window.confirm("Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?");
                if (!confirmLeave) {
                    e.preventDefault();
                    // Esto mantiene al usuario en la página actual
                    window.history.pushState(null, "", window.location.pathname);
                }
            }
        };

        // Agregar event listeners
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);
        
        // Asegurarse de que hay un estado en el historial para detectar el botón atrás
        window.history.pushState(null, "", window.location.pathname);
        
        // Limpiar event listeners al desmontar
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [hasUnsavedChanges]);
    
    // Importar datos desde JSON
    const importSkillsFromJSON = (jsonString) => {
        try {
            const importedSkills = JSON.parse(jsonString);
            setSkills(importedSkills);
            setPlayers(updatePlayersList(importedSkills));
            setHasUnsavedChanges(false);
            
            toast.success("Datos importados correctamente");
            return true;
        } catch (error) {
            toast.error("Error al importar JSON: " + error.message);
            return false;
        }
    };

    // Función para normalizar un string (trim + mayúsculas)
    const normalizeString = (str) => str.trim().toUpperCase();

    // Función para agregar una skill con su lista de players
    const addSkill = (skillName) => {
        const normalizedSkillName = normalizeString(skillName);
        const updatedSkills = new Map(skills);

        if (updatedSkills.has(normalizedSkillName)) {
            console.warn(`La skill "${normalizedSkillName}" ya existe.`);
            return;
        }

        const allPlayers = updatedSkills.size > 0
            ? updatedSkills.values().next().value
            : [];

        updatedSkills.set(normalizedSkillName, [...allPlayers]);
        setSkills(updatedSkills);
    };

    // Función para eliminar una skill
    const deleteSkill = (skillName) => {
        const normalizedSkillName = normalizeString(skillName);
        const updatedSkills = new Map(skills);

        if (!updatedSkills.has(normalizedSkillName)) {
            console.warn(`La skill "${normalizedSkillName}" no existe.`);
            return;
        }

        updatedSkills.delete(normalizedSkillName);
        setSkills(updatedSkills);
    };

    // Función para agregar un jugador a todas las skills
    const addPlayer = (player) => {
        const updatedSkills = new Map(skills);

        if (updatedSkills.size === 0) {
            console.warn("No hay skills disponibles para agregar un jugador.");
            return;
        }

        const normalizedPlayer = {
            ...player,
            name: normalizeString(player.name),
            category: normalizeString(player.category),
        };

        updatedSkills.forEach((playersList, skillName) => {
            updatedSkills.set(skillName, [...playersList, normalizedPlayer]);
        });

        setSkills(updatedSkills);
    };

    // Función para eliminar un jugador de todas las skills
    const deletePlayer = (playerName) => {
        const normalizedPlayerName = normalizeString(playerName);
        const updatedSkills = new Map(skills);

        updatedSkills.forEach((playersList, skillName) => {
            const updatedPlayers = playersList.filter(
                (player) => player.name !== normalizedPlayerName
            );
            updatedSkills.set(skillName, updatedPlayers);
        });

        setSkills(updatedSkills);
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
            console.warn("Se necesitan al menos 2 jugadores para formar equipos");
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

    // Manejar el cambio de pantalla
    const handleSetScreen = (newScreen, data = null) => {
        if (newScreen === 'player' && data) {
            setCurrentPlayer(data);
        } else if (newScreen === 'skill' && data) {
            setCurrentSkill(data);
        }
        setScreen(newScreen);
    };

    return (
        <div className="app">
          <div className="main_screen">
            {/* Pantalla Principal */}
            {screen === "main" && (
              <div>
                <div className="option" onClick={() => handleSetScreen("skills")}>
                  <p>Habilidades</p>
                </div>
                <div className="option" onClick={() => handleSetScreen("players")}>
                  <p>Jugadores</p>
                </div>
                <div className="option" onClick={() => handleSetScreen("teams")}>
                  <p>Equipos</p>
                </div>
              </div>
            )}
      
            {/* Pantalla de Jugadores */}
            {screen === "players" && (
              <div>
                <h2>Lista de Jugadores</h2>
                {Array.from(skills.values()).flat().map((player, index) => (
                  <div
                    key={index}
                    className="player"
                    onClick={() => {
                      setCurrentPlayer(player);
                      handleSetScreen("player");
                    }}
                  >
                    <p>{player.name}</p>
                    <p>{player.category}</p>
                  </div>
                ))}
                <button onClick={() => handleSetScreen("main")}>Volver</button>
              </div>
            )}
      
            {/* Pantalla de Jugador Individual */}
            {screen === "player" && currentPlayer && (
              <div>
                <h2>Detalle del Jugador</h2>
                <p>Nombre: {currentPlayer.name}</p>
                <p>Categoría: {currentPlayer.category}</p>
                <button onClick={() => deletePlayer(currentPlayer.name)}>
                  Eliminar Jugador
                </button>
                <button onClick={() => handleSetScreen("players")}>Volver</button>
              </div>
            )}
      
            {/* Pantalla de Habilidades */}
            {screen === "skills" && (
              <div>
                <h2>Lista de Habilidades</h2>
                {Array.from(skills.keys()).map((skill, index) => (
                  <div
                    key={index}
                    className="skill"
                    onClick={() => {
                      setCurrentSkill(skill);
                      handleSetScreen("skill");
                    }}
                  >
                    <p>{skill}</p>
                  </div>
                ))}
                <button onClick={() => handleSetScreen("main")}>Volver</button>
              </div>
            )}
            {/* Pantalla de Habilidad Individual */}
            {screen === "skill" && currentSkill && skills.has(currentSkill) && (
                <div>
                    <h2>{currentSkill}</h2>

                    {/* Lista de jugadores arrastrables */}
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
                                                            handleSetScreen("player");
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

                    <button onClick={() => deleteSkill(currentSkill)}>
                        Eliminar Habilidad
                    </button>
                    <button onClick={() => handleSetScreen("skills")}>Volver</button>
                </div>
            )}
            {/* Pantalla de armado de equipos */}
            {screen === "teams" && selectedPlayers.length > 2 && (
              <div>
                <h2>Armar Equipos</h2>
                <button onClick={() => setSelectedPlayers(calculatePlayerValues())}>
                  Seleccionar Jugadores
                </button>
                <button onClick={() => {
                  const teams = createTeams();
                  console.log("Equipo A:", teams.teamA);
                  console.log("Equipo B:", teams.teamB);
                }}>
                  Crear Equipos
                </button>
                <button onClick={() => handleSetScreen("main")}>Volver</button>
              </div>
            )}
          </div>
        </div>
      );
};

export default App;