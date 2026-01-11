import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_mock_data(num_players=1000):
    print(f"Generating data for {num_players} players...")
    
    player_ids = [f"player_{i}" for i in range(num_players)]
    
    # 1. Session Behavior
    # Random session lengths between 1 min and 120 mins
    avg_session_lengths = np.random.gamma(shape=2, scale=10, size=num_players) 
    avg_session_lengths = np.clip(avg_session_lengths, 1, 120)

    # 2. Engagement
    # Days since last login (skewed towards 0 for active players)
    days_since_active = np.random.exponential(scale=5, size=num_players)
    days_since_active = np.clip(days_since_active, 0, 365).astype(int)
    
    # Last Login Date
    today = datetime.now()
    last_login_dates = [(today - timedelta(days=int(d))).strftime('%Y-%m-%d') for d in days_since_active]

    # 3. Monetization
    # Total spent: Many 0s, some high spenders
    is_payer = np.random.choice([0, 1], size=num_players, p=[0.7, 0.3]) # 30% conversion rate
    total_spent = is_payer * np.random.exponential(scale=50, size=num_players)
    
    # 4. Churn Label (Target)
    # Simple logic: Churn if inactive > 14 days OR (Low session time AND inactive > 7 days)
    churned = []
    for i in range(num_players):
        if days_since_active[i] > 14:
            churned.append(1)
        elif days_since_active[i] > 7 and avg_session_lengths[i] < 5:
            churned.append(1)
        else:
            churned.append(0)

    # Create DataFrame
    df = pd.DataFrame({
        'player_id': player_ids,
        'avg_session_length_mins': avg_session_lengths,
        'days_since_last_login': days_since_active,
        'last_login_date': last_login_dates,
        'total_lifetime_spend': total_spent,
        'level_reached': np.random.randint(1, 50, size=num_players),
        'churned': churned
    })

    # Save to CSV
    output_file = 'mock_telemetry_data.csv'
    df.to_csv(output_file, index=False)
    print(f"Data saved to {output_file}")
    
    return df

if __name__ == "__main__":
    generate_mock_data()
