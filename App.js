import React, { useState, useEffect } from 'react';

export default function DatabaseInterface() {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [sports, setSports] = useState([]);
  
  // Filter states
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedSport, setSelectedSport] = useState('all');
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    first_name: '',
    last_name: '',
    team_id: '',
    position_id: '',
    position_display_name: '',
    sport_id: ''
  });

  const API_URL = 'http://localhost:5000/api';

  // Load initial data and dynamic dropdowns (Requirement c)
  useEffect(() => {
    fetchPlayers();
    fetchPositions();
    fetchTeams();
    fetchSports();
  }, []);

  const fetchPlayers = async () => {
    const res = await fetch(`${API_URL}/players`);
    const data = await res.json();
    setPlayers(data);
    setFilteredPlayers(data);
  };

  const fetchPositions = async () => {
    const res = await fetch(`${API_URL}/positions`);
    const data = await res.json();
    setPositions(data);
  };

  const fetchTeams = async () => {
    const res = await fetch(`${API_URL}/teams`);
    const data = await res.json();
    setTeams(data);
  };

  const fetchSports = async () => {
    const res = await fetch(`${API_URL}/sports`);
    const data = await res.json();
    setSports(data);
  };

  // Filter players (Requirement b)
  const handleFilter = async () => {
    const res = await fetch(`${API_URL}/players/filter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        position: selectedPosition,
        team: selectedTeam,
        sport: selectedSport
      })
    });
    const data = await res.json();
    setFilteredPlayers(data);
  };

  const resetFilter = () => {
    setSelectedPosition('all');
    setSelectedTeam('all');
    setSelectedSport('all');
    setFilteredPlayers(players);
  };

  // Create player (Requirement a)
  const handleCreate = async () => {
    await fetch(`${API_URL}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setShowForm(false);
    resetForm();
    fetchPlayers();
  };

  // Update player (Requirement a)
  const handleUpdate = async () => {
    await fetch(`${API_URL}/players/${editingPlayer}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setShowForm(false);
    setEditingPlayer(null);
    resetForm();
    fetchPlayers();
  };

  // Delete player (Requirement a)
  const handleDelete = async (id) => {
    if (window.confirm('Delete this player?')) {
      await fetch(`${API_URL}/players/${id}`, { method: 'DELETE' });
      fetchPlayers();
    }
  };

  const startEdit = (player) => {
    setEditingPlayer(player.id);
    setFormData(player);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      id: '',
      first_name: '',
      last_name: '',
      team_id: '',
      position_id: '',
      position_display_name: '',
      sport_id: ''
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Player Database Manager</h1>

      {/* Filter Section (Requirement b) */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Filter Players</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Sport/League</label>
            <select 
              className="w-full p-2 border rounded"
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
            >
              <option value="all">All Sports</option>
              {sports.map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Position</label>
            <select 
              className="w-full p-2 border rounded"
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
            >
              <option value="all">All Positions</option>
              {positions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Team</label>
            <select 
              className="w-full p-2 border rounded"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              <option value="all">All Teams</option>
              {teams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button 
              onClick={handleFilter}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Apply Filter
            </button>
            <button 
              onClick={resetFilter}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Reset
            </button>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Showing {filteredPlayers.length} of {players.length} players
        </p>
      </div>

      {/* Insert/Update Form (Requirement a) */}
      <div className="mb-6">
        <button 
          onClick={() => { setShowForm(!showForm); setEditingPlayer(null); resetForm(); }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {showForm ? 'Cancel' : '+ Add New Player'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingPlayer ? 'Edit Player' : 'Add New Player'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Player ID"
              className="p-2 border rounded"
              value={formData.id}
              onChange={(e) => setFormData({...formData, id: e.target.value})}
              disabled={editingPlayer}
            />
            <input
              type="text"
              placeholder="First Name"
              className="p-2 border rounded"
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
            />
            <input
              type="text"
              placeholder="Last Name"
              className="p-2 border rounded"
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
            />
            <input
              type="text"
              placeholder="Sport/League (NFL, NBA, etc)"
              className="p-2 border rounded"
              value={formData.sport_id}
              onChange={(e) => setFormData({...formData, sport_id: e.target.value})}
            />
            <input
              type="text"
              placeholder="Team ID"
              className="p-2 border rounded"
              value={formData.team_id}
              onChange={(e) => setFormData({...formData, team_id: e.target.value})}
            />
            <input
              type="text"
              placeholder="Position ID"
              className="p-2 border rounded"
              value={formData.position_id}
              onChange={(e) => setFormData({...formData, position_id: e.target.value})}
            />
            <input
              type="text"
              placeholder="Position Display Name"
              className="p-2 border rounded col-span-2"
              value={formData.position_display_name}
              onChange={(e) => setFormData({...formData, position_display_name: e.target.value})}
            />
          </div>
          <button 
            onClick={editingPlayer ? handleUpdate : handleCreate}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {editingPlayer ? 'Update Player' : 'Create Player'}
          </button>
        </div>
      )}

      {/* Player Report Table (Requirement b) */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold p-6 bg-gray-100">Player Report</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Sport</th>
                <th className="p-3 text-left">Team</th>
                <th className="p-3 text-left">Position</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">
                    No players found
                  </td>
                </tr>
              ) : (
                filteredPlayers.map(player => (
                  <tr key={player.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{player.id}</td>
                    <td className="p-3">{player.first_name} {player.last_name}</td>
                    <td className="p-3">{player.sport_id || 'N/A'}</td>
                    <td className="p-3">{player.team_id || 'N/A'}</td>
                    <td className="p-3">{player.position_display_name || 'N/A'}</td>
                    <td className="p-3">
                      <button 
                        onClick={() => startEdit(player)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(player.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
