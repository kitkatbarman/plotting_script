from flask import Blueprint, render_template

randomWalk = Blueprint('randomWalk', __name__)

@randomWalk.route('/randomWalk')
def randomWalk_page():
    return render_template('randomWalk.html')
