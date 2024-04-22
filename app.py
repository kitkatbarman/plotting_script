from flask import Flask, render_template, request
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter
import io
import base64

app = Flask(__name__)

def plot_investment_growth(starting_amount, daily_interests, loss_percent, loss_frequency, days):
    plt.figure(figsize=(5, 5))
    for daily_interest in daily_interests:
        daily_interest /= 100.0  # Convert to a fraction
        investment_values = np.zeros(days)
        investment_values[0] = starting_amount
        for i in range(1, days):
            if i % loss_frequency == 0:
                investment_values[i] = investment_values[i - 1] * (1 - loss_percent / 100)
            else:
                investment_values[i] = investment_values[i - 1] * (1 + daily_interest)
        plt.plot(investment_values, label=f'{daily_interest * 100:.2f}% gain per trade')
    plt.tight_layout()
    plt.title('Investment Increase Over Time')
    plt.xlabel('Trades')
    plt.ylabel('Amount ($)')
    plt.gca().yaxis.set_major_formatter(FuncFormatter(lambda x, _: f'{x:,.0f}'))
    # plt.ylim(0, 1000000)
    plt.legend()
    plt.grid(True)
    img = io.BytesIO()
    plt.savefig(img, format='png', bbox_inches='tight')  # bbox_inches='tight' can also help
    img.seek(0)
    plot_url = base64.b64encode(img.getvalue()).decode()
    plt.close()
    return plot_url

@app.route('/', methods=['GET', 'POST'])
def home():
    plot_url = None
    form_data = {'starting_amount': '', 'loss_percent': '', 'loss_frequency': '', 'interest_rates': '', 'days': ''}
    error_messages = []

    if request.method == 'POST':
        try:
            form_data['starting_amount'] = float(request.form.get('starting_amount', 0))
            form_data['loss_percent'] = float(request.form.get('loss_percent', 0))
            form_data['loss_frequency'] = int(request.form.get('loss_frequency', 0))
            form_data['interest_rates'] = request.form.get('interest_rates', '')
            form_data['days'] = int(request.form.get('days', 0))

            # Convert interest rates from string to a list of floats
            daily_interests = [float(i) for i in form_data['interest_rates'].split(',') if i.strip()]

            # Perform additional validation as necessary
            if form_data['starting_amount'] <= 0:
                error_messages.append('Starting amount must be greater than 0.')
            if not daily_interests:
                error_messages.append('At least one interest rate must be provided.')
            if form_data['days'] <= 0:
                error_messages.append('Number of days must be greater than 0.')

            # If no errors, generate plot
            if not error_messages:
                plot_url = plot_investment_growth(form_data['starting_amount'], daily_interests, form_data['loss_percent'], form_data['loss_frequency'], form_data['days'])

        except ValueError:
            error_messages.append('Please ensure all inputs are valid numbers without spaces or letters.')

    return render_template('index.html', plot_url=plot_url, form_data=form_data, error_messages=error_messages)

if __name__ == '__main__':
    app.run(debug=True)

