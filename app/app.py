from flask import Flask
from .routes.home import home
from .routes.investment_app import investment_app
from .routes.click_button import click_button
from .routes.break_button import break_button  # Import the break_button Blueprint

def create_app():
    app = Flask(__name__)
    # Configuration and blueprint registration goes here

    app.register_blueprint(home)
    app.register_blueprint(click_button)
    app.register_blueprint(investment_app)
    app.register_blueprint(break_button)  # Register the break_button Blueprint

    return app
