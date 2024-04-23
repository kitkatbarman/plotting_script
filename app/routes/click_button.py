from flask import Blueprint, render_template

click_button = Blueprint('click_button', __name__, url_prefix='/click-a-button')  # Update URL prefix

# Route to render the click_button.html template
@click_button.route('/')
def click_button_page():
    return render_template('click_button.html')
