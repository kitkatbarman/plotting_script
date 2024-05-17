from flask import Blueprint, render_template

circles = Blueprint('circles', __name__)

@circles.route('/circles')
def circles_route():
    return render_template('circles.html')
