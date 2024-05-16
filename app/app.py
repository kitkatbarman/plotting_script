from flask import Flask, request, jsonify
import sqlite3
from better_profanity import profanity
from datetime import datetime
import logging
from .routes.home import home
from .routes.investment_app import investment_app
from .routes.click_button import click_button
from .routes.break_button import break_button
from .routes.randomWalk import randomWalk
from .routes.bullet_dodge import bullet_dodge
from .routes.diffusion_simulation import diffusion_simulation  # Import new blueprint

DB_PATH = '/home/ubuntu/plotting_script/game_scores.db'


def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.cursor()
        cur.execute('''
        CREATE TABLE IF NOT EXISTS high_scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(10) NOT NULL,
            score INTEGER NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        cur.execute('''
        CREATE TABLE IF NOT EXISTS all_scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            score INTEGER NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        conn.commit()

def create_app():
    app = Flask(__name__)
    init_db()

    app.register_blueprint(home)
    app.register_blueprint(click_button)
    app.register_blueprint(investment_app)
    app.register_blueprint(break_button)
    app.register_blueprint(randomWalk)
    app.register_blueprint(bullet_dodge)
    app.register_blueprint(diffusion_simulation)  # Register new blueprint

    logging.basicConfig(level=logging.DEBUG)

    @app.route('/submit_score', methods=['POST'])
    def submit_score():
        try:
            data = request.get_json()
            name = data['name']
            score = data['score']

            if profanity.contains_profanity(name):
                return jsonify({"message": "Please enter a valid name without offensive words."}), 400

            with sqlite3.connect(DB_PATH) as conn:
                cur = conn.cursor()
                
                # Insert into all_scores table
                cur.execute("INSERT INTO all_scores (score) VALUES (?)", (score,))
                
                # Check if the score qualifies as a high score
                cur.execute("SELECT score FROM high_scores ORDER BY score DESC LIMIT 10")
                high_scores = cur.fetchall()
                
                if len(high_scores) < 10 or score > high_scores[-1][0]:
                    cur.execute("INSERT INTO high_scores (name, score) VALUES (?, ?)", (name, score))
                    
                    # Ensure only top 10 scores are kept
                    cur.execute("DELETE FROM high_scores WHERE id NOT IN (SELECT id FROM high_scores ORDER BY score DESC LIMIT 10)")

                conn.commit()

            return jsonify({"message": "Score submitted successfully"})
        
        except Exception as e:
            logging.error("Error occurred while submitting score: %s", e)
            return jsonify({"message": "An error occurred while submitting the score"}), 500

    @app.route('/get_high_scores', methods=['GET'])
    def get_high_scores():
        try:
            with sqlite3.connect(DB_PATH) as conn:
                cur = conn.cursor()
                cur.execute("SELECT name, score FROM high_scores ORDER BY score DESC LIMIT 10")
                high_scores = cur.fetchall()
            return jsonify(high_scores)
        
        except Exception as e:
            logging.error("Error occurred while fetching high scores: %s", e)
            return jsonify({"message": "An error occurred while fetching high scores"}), 500

    return app
