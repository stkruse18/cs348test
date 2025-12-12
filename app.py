from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Player, Game, Appearance, OverUnderLine

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///underdog.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True  # This prints SQL queries to console
CORS(app)  # Enable CORS for React frontend

db.init_app(app)

# GET all players - Using RAW SQL
@app.route('/api/players', methods=['GET'])
def get_players():
    # Raw SQL query
    sql = "SELECT id, first_name, last_name, team_id, position_id, position_display_name, sport_id FROM players"
    result = db.session.execute(db.text(sql))
    
    players = []
    for row in result:
        players.append({
            'id': row.id,
            'first_name': row.first_name,
            'last_name': row.last_name,
            'team_id': row.team_id,
            'position_id': row.position_id,
            'position_display_name': row.position_display_name,
            'sport_id': row.sport_id
        })
    
    print(f"\n[SQL EXECUTED]: {sql}")
    print(f"[RESULT]: Retrieved {len(players)} players\n")
    return jsonify(players)

# GET unique positions (for dropdown - requirement c) - Using RAW SQL
@app.route('/api/positions', methods=['GET'])
def get_positions():
    # Raw SQL query
    sql = "SELECT DISTINCT position_display_name FROM players WHERE position_display_name IS NOT NULL"
    result = db.session.execute(db.text(sql))
    
    positions = [row.position_display_name for row in result]
    
    print(f"\n[SQL EXECUTED]: {sql}")
    print(f"[RESULT]: Retrieved {len(positions)} unique positions\n")
    return jsonify(positions)

# GET unique teams (for dropdown - requirement c) - Using RAW SQL
@app.route('/api/teams', methods=['GET'])
def get_teams():
    # Raw SQL query
    sql = "SELECT DISTINCT team_id FROM players WHERE team_id IS NOT NULL"
    result = db.session.execute(db.text(sql))
    
    teams = [row.team_id for row in result]
    
    print(f"\n[SQL EXECUTED]: {sql}")
    print(f"[RESULT]: Retrieved {len(teams)} unique teams\n")
    return jsonify(teams)

# GET unique sports (for dropdown - requirement c) - Using RAW SQL
@app.route('/api/sports', methods=['GET'])
def get_sports():
    # Raw SQL query
    sql = "SELECT DISTINCT sport_id FROM players WHERE sport_id IS NOT NULL"
    result = db.session.execute(db.text(sql))
    
    sports = [row.sport_id for row in result]
    
    print(f"\n[SQL EXECUTED]: {sql}")
    print(f"[RESULT]: Retrieved {len(sports)} unique sports\n")
    return jsonify(sports)

# Filter players (requirement b) - Using RAW SQL with WHERE clause
@app.route('/api/players/filter', methods=['POST'])
def filter_players():
    data = request.json
    position = data.get('position')
    team = data.get('team')
    sport = data.get('sport')
    
    # Build dynamic WHERE clause
    conditions = []
    params = {}
    
    if position and position != 'all':
        conditions.append("position_display_name = :position")
        params['position'] = position
    
    if team and team != 'all':
        conditions.append("team_id = :team")
        params['team'] = team
    
    if sport and sport != 'all':
        conditions.append("sport_id = :sport")
        params['sport'] = sport
    
    # Construct SQL query
    sql = "SELECT id, first_name, last_name, team_id, position_id, position_display_name, sport_id FROM players"
    if conditions:
        sql += " WHERE " + " AND ".join(conditions)
    
    # Execute query
    result = db.session.execute(db.text(sql), params)
    
    players = []
    for row in result:
        players.append({
            'id': row.id,
            'first_name': row.first_name,
            'last_name': row.last_name,
            'team_id': row.team_id,
            'position_id': row.position_id,
            'position_display_name': row.position_display_name,
            'sport_id': row.sport_id
        })
    
    print(f"\n[SQL EXECUTED]: {sql}")
    print(f"[PARAMETERS]: {params}")
    print(f"[RESULT]: Retrieved {len(players)} filtered players\n")
    return jsonify(players)

# CREATE new player (requirement a) - Using RAW SQL INSERT
@app.route('/api/players', methods=['POST'])
def create_player():
    data = request.json
    
    # Raw SQL INSERT
    sql = """
        INSERT INTO players (id, first_name, last_name, team_id, position_id, position_display_name, sport_id)
        VALUES (:id, :first_name, :last_name, :team_id, :position_id, :position_display_name, :sport_id)
    """
    
    params = {
        'id': data['id'],
        'first_name': data['first_name'],
        'last_name': data['last_name'],
        'team_id': data.get('team_id'),
        'position_id': data.get('position_id'),
        'position_display_name': data.get('position_display_name'),
        'sport_id': data.get('sport_id')
    }
    
    db.session.execute(db.text(sql), params)
    db.session.commit()
    
    print(f"\n[SQL EXECUTED]: {sql}")
    print(f"[PARAMETERS]: {params}")
    print(f"[RESULT]: Player created successfully\n")
    
    return jsonify({'message': 'Player created successfully'}), 201

# UPDATE player (requirement a) - Using RAW SQL UPDATE
@app.route('/api/players/<player_id>', methods=['PUT'])
def update_player(player_id):
    data = request.json
    
    # Raw SQL UPDATE
    sql = """
        UPDATE players 
        SET first_name = :first_name,
            last_name = :last_name,
            team_id = :team_id,
            position_id = :position_id,
            position_display_name = :position_display_name,
            sport_id = :sport_id
        WHERE id = :id
    """
    
    params = {
        'id': player_id,
        'first_name': data.get('first_name'),
        'last_name': data.get('last_name'),
        'team_id': data.get('team_id'),
        'position_id': data.get('position_id'),
        'position_display_name': data.get('position_display_name'),
        'sport_id': data.get('sport_id')
    }
    
    result = db.session.execute(db.text(sql), params)
    db.session.commit()
    
    print(f"\n[SQL EXECUTED]: {sql}")
    print(f"[PARAMETERS]: {params}")
    print(f"[RESULT]: Updated {result.rowcount} row(s)\n")
    
    if result.rowcount == 0:
        return jsonify({'error': 'Player not found'}), 404
    
    return jsonify({'message': 'Player updated successfully'})

# DELETE player (requirement a) - Using RAW SQL DELETE
@app.route('/api/players/<player_id>', methods=['DELETE'])
def delete_player(player_id):
    # Raw SQL DELETE
    sql = "DELETE FROM players WHERE id = :id"
    
    params = {'id': player_id}
    
    result = db.session.execute(db.text(sql), params)
    db.session.commit()
    
    print(f"\n[SQL EXECUTED]: {sql}")
    print(f"[PARAMETERS]: {params}")
    print(f"[RESULT]: Deleted {result.rowcount} row(s)\n")
    
    if result.rowcount == 0:
        return jsonify({'error': 'Player not found'}), 404
    
    return jsonify({'message': 'Player deleted successfully'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
