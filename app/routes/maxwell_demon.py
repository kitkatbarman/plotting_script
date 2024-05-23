from flask import Blueprint, render_template

maxwell_demon = Blueprint('maxwell_demon', __name__)

@maxwell_demon.route('/maxwell_demon')
def maxwell_demon_route():
    return render_template('maxwell_demon.html')
