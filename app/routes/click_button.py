from flask import Blueprint, render_template

click_button = Blueprint('click_button', __name__, url_prefix='/')

@click_button.route('/click-a-button/')
def click_button_page():
    return render_template('click_button.html')
