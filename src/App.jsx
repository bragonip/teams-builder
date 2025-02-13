// App.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Papa from 'papaparse';
import { openDB } from 'idb';
import { Upload, Users, Check, X, Clipboard, Info } from 'lucide-react';
import './App.css';

// Constants
const DEFAULT_CATEGORY = 'Sin categoria';
const REQUIRED_COLUMNS = ['jugador', 'categoria'];
const SKILL_WEIGHT_RANGE = { min: 0.1, max: 5 };

// IDB Configuration
const initializeDB = async () => {
  return openDB('teamBalancerDB', 1, {
    upgrade(db) {
      db.createObjectStore('players', { keyPath: 'id' });
      db.createObjectStore('config', { keyPath: 'name' });
    },
  });
};

// Custom Hooks
const useTeamBalancer = () => {
  const [teams, setTeams] = useState({ team1: [], team2: [] });
  const [balanceMetric, setBalanceMetric] = useState(0);

  const calculateBalance = useCallback((team1, team2) => {
    const t1Score = team1.reduce((sum, p) => sum + p.score, 0);
    const t2Score = team2.reduce((sum, p) => sum + p.score, 0);
    return Math.abs(t1Score - t2Score) / Math.max(t1Score, t2Score);
  }, []);

  const optimizeTeams = useCallback((players, categories) => {
    // Implementation of genetic algorithm would go here
    // Simplified version for demonstration:
    const mid = Math.ceil(players.length / 2);
    const team1 = players.slice(0, mid);
    const team2 = players.slice(mid);
    
    return {
      team1,
      team2,
      balance: calculateBalance(team1, team2)
    };
  }, [calculateBalance]);

  return { teams, balanceMetric, optimizeTeams };
};

const PlayerItem = ({ player, selected, onToggle }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'player',
    item: { player },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`player-item ${selected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={() => onToggle(player)}
    >
      {selected ? <Check size={16} /> : <X size={16} />}
      <span>{player.jugador}</span>
      <span className="category-badge">{player.categoria}</span>
    </div>
  );
};

const TeamSlot = ({ team, players, onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'player',
    drop: (item) => onDrop(item.player, team),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`team-slot ${isOver ? 'drop-target' : ''}`}
    >
      <h3>{team}</h3>
      {players.map((player) => (
        <div key={player.id} className="team-player">
          {player.jugador} ({player.categoria})
        </div>
      ))}
    </div>
  );
};

// Main Component
const App = () => {
  const [allPlayers, setAllPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState(new Set());
  const [skillWeights, setSkillWeights] = useState({});
  const [teams, setTeams] = useState({ team1: [], team2: [] });
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { optimizeTeams } = useTeamBalancer();

  // IDB Initialization
  useEffect(() => {
    initializeDB().then((db) => {
      db.getAll('players').then((players) => {
        if (players.length > 0) setAllPlayers(players);
      });
    });
  }, []);

  const normalizePlayer = useCallback((player) => {
    const normalized = { 
      id: crypto.randomUUID(),
      categoria: DEFAULT_CATEGORY,
      skills: {}
    };

    Object.entries(player).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'jugador') {
        normalized.jugador = value.trim();
      } else if (lowerKey === 'categoria') {
        normalized.categoria = value.trim() || DEFAULT_CATEGORY;
      } else {
        normalized.skills[lowerKey] = parseFloat(value) || 0;
      }
    });

    return normalized;
  }, []);

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const normalized = results.data.map(normalizePlayer);
          const db = await initializeDB();
          const tx = db.transaction('players', 'readwrite');
          
          await Promise.all([
            ...normalized.map((player) => tx.store.put(player)),
            tx.done,
          ]);

          setAllPlayers(normalized);
          setError(null);
        } catch (err) {
          setError('Error processing CSV file');
        } finally {
          setLoading(false);
        }
      },
      error: () => {
        setError('Invalid CSV format');
        setLoading(false);
      }
    });
  }, [normalizePlayer]);

  const calculateScores = useCallback(() => {
    return Array.from(selectedPlayers).map((player) => ({
      ...player,
      score: Object.entries(player.skills).reduce(
        (sum, [skill, value]) => sum + (value * (skillWeights[skill] || 1)),
        0
      )
    }));
  }, [selectedPlayers, skillWeights]);

  const handleGenerateTeams = useCallback(async () => {
    const scoredPlayers = calculateScores();
    const { team1, team2, balance } = optimizeTeams(scoredPlayers);
    
    setTeams({ team1, team2 });
    setBalance(balance);
  }, [calculateScores, optimizeTeams]);

  const handleWeightChange = useCallback((skill, value) => {
    const numericValue = Math.max(
      SKILL_WEIGHT_RANGE.min, 
      Math.min(SKILL_WEIGHT_RANGE.max, parseFloat(value))
    );
    
    setSkillWeights(prev => ({
      ...prev,
      [skill]: numericValue
    }));
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app-container">
        <header>
          <h1>Team Balancer Pro</h1>
          <div className="balance-meter">
            <div 
              className="balance-indicator" 
              style={{ width: `${(1 - balance) * 100}%` }}
            />
            <span>Balance: {(100 - balance * 100).toFixed(1)}%</span>
          </div>
        </header>

        <main>
          <section className="config-panel">
            <div className="file-upload">
              <label>
                <Upload size={20} />
                Import CSV
                <input type="file" accept=".csv" onChange={handleFileUpload} />
              </label>
            </div>

            <div className="skill-weights">
              <h3>Skill Weights</h3>
              {Object.keys(allPlayers[0]?.skills || {}).map((skill) => (
                <div key={skill} className="weight-control">
                  <label>{skill}</label>
                  <input
                    type="number"
                    min={SKILL_WEIGHT_RANGE.min}
                    max={SKILL_WEIGHT_RANGE.max}
                    step="0.1"
                    value={skillWeights[skill] || 1}
                    onChange={(e) => handleWeightChange(skill, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="player-management">
            <div className="player-list">
              <h3>Available Players ({allPlayers.length})</h3>
              {allPlayers.map((player) => (
                <PlayerItem
                  key={player.id}
                  player={player}
                  selected={selectedPlayers.has(player)}
                  onToggle={(p) => setSelectedPlayers(prev => {
                    const next = new Set(prev);
                    next.has(p) ? next.delete(p) : next.add(p);
                    return next;
                  })}
                />
              ))}
            </div>

            <div className="team-assignment">
              <TeamSlot
                team="Team Alpha"
                players={teams.team1}
                onDrop={(player) => {/* Implement manual assignment */}}
              />
              <TeamSlot
                team="Team Bravo"
                players={teams.team2}
                onDrop={(player) => {/* Implement manual assignment */}}
              />
            </div>
          </section>
        </main>

        <footer>
          <button 
            onClick={handleGenerateTeams}
            disabled={selectedPlayers.size < 2}
          >
            <Users size={18} />
            Generate Balanced Teams
          </button>
        </footer>

        {error && (
          <div className="error-overlay">
            <div className="error-card">
              <Info size={24} />
              <p>{error}</p>
              <button onClick={() => setError(null)}>Dismiss</button>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default App;