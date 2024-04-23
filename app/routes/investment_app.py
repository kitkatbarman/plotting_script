from flask import Blueprint, render_template, request
from ..utils.plotting import plot_investment_growth  # Adjust the import path accordingly

investment_app = Blueprint('investment_app', __name__, url_prefix='/')

@investment_app.route('/investment-app/', methods=['GET', 'POST'])
def investment_app_route():
    plot_url = None
    form_data = {'starting_amount': '', 'loss_percent': '', 'loss_frequency': '', 'interest_rates': '', 'days': ''}
    error_messages = []

    if request.method == 'POST':
        try:
            form_data['starting_amount'] = float(request.form['starting_amount'])
            form_data['loss_percent'] = float(request.form['loss_percent'])
            form_data['loss_frequency'] = int(request.form['loss_frequency'])
            form_data['interest_rates'] = request.form['interest_rates']
            form_data['days'] = int(request.form['days'])
            
            daily_interests = [float(i) for i in form_data['interest_rates'].split(',') if i.strip()]

            if form_data['starting_amount'] <= 0:
                error_messages.append('Starting amount must be greater than 0.')
            if not daily_interests:
                error_messages.append('At least one interest rate must be provided.')
            if form_data['days'] <= 0:
                error_messages.append('Number of days must be greater than 0.')

            if not error_messages:
                plot_url = plot_investment_growth(form_data['starting_amount'], daily_interests, form_data['loss_percent'], form_data['loss_frequency'], form_data['days'])

        except ValueError:
            error_messages.append('Please ensure all inputs are valid numbers without spaces or letters.')

    return render_template('index.html', plot_url=plot_url, form_data=form_data, error_messages=error_messages)
