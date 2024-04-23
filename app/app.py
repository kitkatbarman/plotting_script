from flask import Flask
from .routes.home import home
from .routes.investment_app import investment_app
from .routes.click_button import click_button  # Import the click_button blueprint

def create_app():
    app = Flask(__name__)
    # Configuration and blueprint registration goes here

    app.register_blueprint(home)
    app.register_blueprint(investment_app)
    app.register_blueprint(click_button)  # Register the click_button blueprint

    return app
