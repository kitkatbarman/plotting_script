from flask import Blueprint, render_template

break_button = Blueprint('break_button', __name__, url_prefix='/')

@break_button.route('/break-the-button/')
def break_button_page():
    return render_template('break_button.html')