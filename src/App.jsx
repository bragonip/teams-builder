import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './App.css';

const App = () =>{

    const [screen, setScreen] = useState('main');
    const [players, setPlayers] = useState([]);
    const [skills, setSkills] = useState(new Map());
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [currentSkill, setCurrentSkill] = useState('');
    const [newPlayerName, setNewPlayerName] = useState("");
    const [newPlayerCategory, setNewPlayerCategory] = useState("");
    const [newSkillName, setNewSkillName] = useState("");


    // Función para normalizar un string (trim + mayúsculas)
    const normalizeString = (str) => str.trim().toUpperCase();

    // Función para agregar un jugador a todas las skills
    const addPlayer = () => {
        const updatedSkills = new Map(skills);

        if (updatedSkills.size === 0) {
            console.warn("No hay skills disponibles para agregar un jugador.");
            return;
        }

        const normalizedPlayer = {
            name: normalizeString(newPlayerName.name),
            category: normalizeString(newPlayerCategory.category),
        };

        updatedSkills.forEach((playersList, skillName) => {
            updatedSkills.set(skillName, [...playersList, normalizedPlayer]);
        });

        setSkills(updatedSkills);
    };

    // Función para eliminar un jugador de todas las skills
    const deletePlayer = (playerToDelete) => {
        const updatedSkills = new Map(skills);

        updatedSkills.forEach((skillName, playersList) => {
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
            console.warn(`La skill "${normalizedSkillName}" ya existe.`);
            return;
        }
    
        const allPlayers = updatedSkills.size > 0
            ? updatedSkills.values().next().value
            : [];
    
        updatedSkills.set(normalizedSkillName, [...allPlayers]);
        setSkills(updatedSkills);
        };
    

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
                        <div className='players_io_button'>
                            <p>IMPORTAR</p>
                        </div>
                        <div className='players_io_button'>
                            <p>EXPORTAR</p>
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
                    <div className='player_delete' onClick={() => {deletePlayer(currentPlayer)}}>
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
                    <p>{currentSkill}</p>
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
        </div>
    )
};

export default App;