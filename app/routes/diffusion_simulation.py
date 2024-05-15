# routes/diffusion_simulation.py
from flask import Blueprint, render_template

diffusion_simulation = Blueprint('diffusion_simulation', __name__)

@diffusion_simulation.route('/diffusion_simulation')
def diffusion_simulation_page():
    return render_template('diffusion_simulation.html')
