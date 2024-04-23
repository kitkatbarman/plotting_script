import numpy as np
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter
import io
import base64

def plot_investment_growth(starting_amount, daily_interests, loss_percent, loss_frequency, days):
    plt.figure(figsize=(5, 5))
    for daily_interest in daily_interests:
        daily_interest /= 100.0
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
    plt.legend()
    plt.grid(True)
    img = io.BytesIO()
    plt.savefig(img, format='png', bbox_inches='tight')
    img.seek(0)
    plot_url = base64.b64encode(img.getvalue()).decode()
    plt.close()
    return plot_url
