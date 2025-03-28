import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './App.css';

const App = () => {
    // Estados para la navegación
    const [screen, setScreen] = useState('main');
    const [message, setMessage] = useState('');
    
    // Estados para los datos
    const [skills, setSkills] = useState({});
    const [players, setPlayers] = useState([]);
    
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
    
    // Actualizar lista de jugadores basado en las habilidades
    const updatePlayersList = (skillsData = skills) => {
        // Set para evitar duplicados
        const uniquePlayers = new Set();
        
        // Recorre todas las habilidades
        Object.values(skillsData).forEach(playersInSkill => {
            playersInSkill.forEach(player => {
                // Usamos JSON.stringify para convertir el objeto en string y poder compararlo
                uniquePlayers.add(JSON.stringify(player));
            });
        });
        
        // Convierte de nuevo a objetos
        const updatedPlayers = Array.from(uniquePlayers).map(playerStr => JSON.parse(playerStr));
        return updatedPlayers;
    };

    // Agregar un nuevo jugador
    const addPlayer = () => {
        // Limpiar y convertir a mayúsculas el nombre y la categoría
        const cleanedName = newPlayerName.trim().toUpperCase();
        const cleanedCategory = newPlayerCategory.trim().toUpperCase();
    
        if (!cleanedName || !cleanedCategory) {
            setMessage("Nombre y categoría son obligatorios");
            return;
        }
        
        const newPlayer = { name: cleanedName, category: cleanedCategory };
        
        // Verifica si el jugador ya existe
        const playerExists = players.some(
            player => player.name === cleanedName && player.category === cleanedCategory
        );
        
        if (playerExists) {
            setMessage("El jugador ya existe");
            return;
        }
        
        // Crear copia del estado actual
        const updatedSkills = { ...skills };
        
        // Agrega el jugador a cada habilidad (al final)
        Object.keys(updatedSkills).forEach(skill => {
            updatedSkills[skill].push(newPlayer);
        });
        
        // Actualiza estados
        setSkills(updatedSkills);
        setPlayers([...players, newPlayer]);
        setNewPlayerName("");
        setNewPlayerCategory("");
        setCreatingPlayer(false);
        setMessage("Jugador agregado correctamente");
        setHasUnsavedChanges(true);
    };

    // Eliminar un jugador
    const removePlayer = (player) => {
        if (!player) return;
        
        // Crear copia del estado actual
        const updatedSkills = { ...skills };
        
        // Elimina el jugador de cada habilidad
        Object.keys(updatedSkills).forEach(skill => {
            updatedSkills[skill] = updatedSkills[skill].filter(
                p => !(p.name === player.name && p.category === player.category)
            );
        });
        
        // Actualiza la lista de jugadores
        const updatedPlayers = players.filter(
            p => !(p.name === player.name && p.category === player.category)
        );
        
        // Actualiza estados
        setSkills(updatedSkills);
        setPlayers(updatedPlayers);
        setCurrentPlayer(null);
        setScreen('players');
        setMessage("Jugador eliminado correctamente");
        setHasUnsavedChanges(true);
    };

    // Agregar una nueva habilidad
    const addSkill = () => {
        // Limpiar y convertir a mayúsculas el nombre de la habilidad
        const cleanedSkillName = newSkillName.trim().toUpperCase();
    
        if (!cleanedSkillName) {
            setMessage("El nombre de la habilidad es obligatorio");
            return;
        }
        
        if (skills[cleanedSkillName]) {
            setMessage("La habilidad ya existe");
            return;
        }
        
        // Crear copia del estado actual
        const updatedSkills = { ...skills };
        
        // Agrega la habilidad con todos los jugadores
        updatedSkills[cleanedSkillName] = [...players];
        
        // Actualiza estados
        setSkills(updatedSkills);
        setNewSkillName("");
        setCreatingSkill(false);
        setMessage("Habilidad agregada correctamente");
        setHasUnsavedChanges(true);
    };

    // Eliminar una habilidad
    const removeSkill = (skillName) => {
        if (!skillName) return;
        
        if (!skills[skillName]) {
            setMessage("Habilidad no encontrada");
            return;
        }
        
        // Crear copia del estado actual
        const updatedSkills = { ...skills };
        
        // Elimina la habilidad
        delete updatedSkills[skillName];
        
        // Actualiza estados
        setSkills(updatedSkills);
        setCurrentSkill('');
        setScreen('skills');
        setMessage("Habilidad eliminada correctamente");
        setHasUnsavedChanges(true);
    };

    // Exportar a JSON
    const exportSkillsToJSON = () => {
        try {
            const jsonData = JSON.stringify(skills, null, 2);
            
            // Crear un objeto Blob con los datos JSON
            const blob = new Blob([jsonData], { type: 'application/json' });
            
            // Crear una URL para el Blob
            const url = URL.createObjectURL(blob);
            
            // Crear un enlace temporal
            const link = document.createElement('a');
            link.href = url;
            link.download = 'team-skills-data.json';
            
            // Simular un clic en el enlace para descargar el archivo
            document.body.appendChild(link);
            link.click();
            
            // Limpiar
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            setMessage("Datos exportados correctamente");
            setHasUnsavedChanges(false);
            return true;
        } catch (error) {
            setMessage("Error al exportar: " + error.message);
            return false;
        }
    };

    // Obtener posición del jugador en una habilidad (para mostrar su nivel)
    const getPlayerRankInSkill = (player, skillName) => {
        if (!skills[skillName]) return -1;
        
        return skills[skillName].findIndex(
            p => p.name === player.name && p.category === player.category
        ) + 1; // +1 para mostrar posición desde 1 en lugar de desde 0
    };

    // Obtener habilidades de un jugador con su ranking
    const getPlayerSkills = (player) => {
        if (!player) return {};
        
        const playerSkills = {};
        
        Object.keys(skills).forEach(skillName => {
            const rank = getPlayerRankInSkill(player, skillName);
            if (rank > 0) {
                playerSkills[skillName] = rank;
            }
        });
        
        return playerSkills;
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

    // Importar archivo JSON
    const handleFileImport = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Verificar si hay cambios sin guardar antes de importar
            if (hasUnsavedChanges) {
                const confirmImport = window.confirm("Tienes cambios sin guardar. Si importas un archivo, perderás esos cambios. ¿Deseas continuar?");
                if (!confirmImport) {
                    event.target.value = ''; // Resetear el input de archivo
                    return;
                }
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                importSkillsFromJSON(content);
            };
            reader.readAsText(file);
        }
    };

    // Función para manejar la finalización de un drag and drop
    const handleDragEnd = (result) => {
        // Si no hay destino o la caída no es válida, no hacemos nada
        if (!result.destination) return;

        // Si es la misma posición, no hacemos nada
        if (result.destination.index === result.source.index) return;

        // Obtener skill actual
        if (!currentSkill || !skills[currentSkill]) return;

        // Crear una copia de los jugadores en la habilidad actual
        const skillPlayers = [...skills[currentSkill]];

        // Reordenar la lista (mover jugador de una posición a otra)
        const [movedPlayer] = skillPlayers.splice(result.source.index, 1);
        skillPlayers.splice(result.destination.index, 0, movedPlayer);

        // Actualizar el estado con la nueva posición
        const updatedSkills = {
            ...skills,
            [currentSkill]: skillPlayers
        };

        setSkills(updatedSkills);
        setHasUnsavedChanges(true);
        toast.success("Orden actualizado");
    };

    return (
        <div className='app'>
            <ToastContainer position="top-right" autoClose={4500} />
            <div className='main_screen'>
                <div className='back-button' onClick={() => handleSetScreen('main')}>
                    <p>Volver</p>
                </div>
                {/* Pantalla Principal */}
                {screen === 'main' && (
                    <div>
                        <div className='option' onClick={() => handleSetScreen('skills')}>
                            <p>Habilidades</p>
                        </div>
                        <div className='option' onClick={() => handleSetScreen('players')}>
                            <p>Jugadores</p>
                        </div>
                        <div className='option'>
                            <p>Equipos</p>
                        </div>
                    </div>
                )}
                
                {/* Pantalla de Jugadores */}
                {screen === 'players' && (
                    <div>
                        <h2>Jugadores</h2>
                        <div className='import'>
                            <p>Importar datos</p>
                            <input 
                                type="file" 
                                accept=".json" 
                                onChange={handleFileImport} 
                            />
                        </div>
                        <div className='export' onClick={exportSkillsToJSON}>
                            <p>Exportar datos</p>
                        </div>
                        
                        {!creatingPlayer ? (
                            <div className='create-button' onClick={() => setCreatingPlayer(true)}>
                                <p>Crear jugador</p>
                            </div>
                        ) : (
                            <div className='create-form'>
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
                                <div className='button-row'>
                                    <button onClick={addPlayer}>Guardar</button>
                                    <button onClick={() => {
                                        setCreatingPlayer(false);
                                        setNewPlayerName("");
                                        setNewPlayerCategory("");
                                    }}>Cancelar</button>
                                </div>
                            </div>
                        )}
                        
                        <p>{players.length} jugadores</p>
                        <div className="players-list">
                            {players.map((player, index) => (
                                <div 
                                    key={index} 
                                    onClick={() => handleSetScreen('player', player)}
                                    className="players-list-item"
                                >
                                    <p>{player.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Pantalla de Jugador Individual */}
                {screen === 'player' && currentPlayer && (
                    <div>
                        <h2>Jugador: {currentPlayer.name}</h2>
                        <p>Categoría: {currentPlayer.category}</p>

                        <div className='delete-button' onClick={() => removePlayer(currentPlayer)}>
                            <p>Eliminar jugador</p>
                        </div>
                        
                        <h3>Habilidades</h3>
                        <div className="skills-list">
                            {Object.entries(getPlayerSkills(currentPlayer)).map(([skill, rank], index) => (
                                <div 
                                    key={index} 
                                    onClick={() => handleSetScreen('skill', skill)}
                                    className="skill-item"
                                >
                                    <p>{skill}: Posición {rank}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Pantalla de Habilidades */}
                {screen === 'skills' && (
                    <div>
                        <h2>Habilidades</h2>
                        
                        {!creatingSkill ? (
                            <div className='create-button' onClick={() => setCreatingSkill(true)}>
                                <p>Crear habilidad</p>
                            </div>
                        ) : (
                            <div className='create-form'>
                                <input
                                    type="text"
                                    placeholder="name de la habilidad"
                                    value={newSkillName}
                                    onChange={(e) => setNewSkillName(e.target.value)}
                                />
                                <div className='button-row'>
                                    <button onClick={addSkill}>Guardar</button>
                                    <button onClick={() => {
                                        setCreatingSkill(false);
                                        setNewSkillName("");
                                    }}>Cancelar</button>
                                </div>
                            </div>
                        )}
                        
                        <p>{Object.keys(skills).length} habilidades</p>
                        <div className="skills-list">
                            {Object.keys(skills).map((skill, index) => (
                                <div 
                                    key={index} 
                                    onClick={() => handleSetScreen('skill', skill)}
                                    className="skill-item"
                                >
                                    <p>{skill}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Pantalla de Habilidad Individual */}
                {screen === 'skill' && currentSkill && skills[currentSkill] && (
                    <div>
                        <h2>Habilidad: {currentSkill}</h2>                        
                        <div className='delete-button' onClick={() => removeSkill(currentSkill)}>
                            <p>Eliminar habilidad</p>
                        </div>
                        
                        <h3>Ranking de jugadores</h3>
                        <p className="drag-instructions">Arrastra los jugadores para cambiar su posición</p>
                        
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId={`skill-${currentSkill}`}>
                                {(provided) => (
                                    <div 
                                        className="players-list ranked"
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        {skills[currentSkill].map((player, index) => (
                                            <Draggable 
                                                key={`${player.name}-${player.category}`}
                                                draggableId={`${player.name}-${player.category}`}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <div 
                                                        className={`player-item ${snapshot.isDragging ? 'dragging' : ''}`}
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        onClick={(e) => {
                                                            // Solo navegamos al jugador si no estamos arrastrando
                                                            if (!snapshot.isDragging) {
                                                                e.stopPropagation();
                                                                handleSetScreen('player', player);
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
                )}
            </div>
        </div>
    );
};

export default App;