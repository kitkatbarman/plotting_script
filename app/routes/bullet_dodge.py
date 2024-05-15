# routes/bullet_dodge.py
from flask import Blueprint, render_template

bullet_dodge = Blueprint('bullet_dodge', __name__)

@bullet_dodge.route('/bullet_dodge')
def bullet_dodge_page():
    return render_template('game.html')
