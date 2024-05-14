from flask import Flask
from .routes.home import home
from .routes.investment_app import investment_app
from .routes.click_button import click_button
from .routes.break_button import break_button
from .routes.randomWalk import randomWalk

def create_app():
    app = Flask(__name__)
    app.register_blueprint(home)
    app.register_blueprint(click_button)
    app.register_blueprint(investment_app)
    app.register_blueprint(break_button)
    app.register_blueprint(randomWalk)
    return app
