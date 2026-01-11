import pandas as pd
import numpy as np

def process_data(input_file='mock_telemetry_data.csv'):
    print(f"Processing data from {input_file}...")
    
    try:
        df = pd.read_csv(input_file)
    except FileNotFoundError:
        print("Input file not found. Please run data_generator.py first.")
        return

    # Data Cleaning and Feature Engineering
    
    # 1. Log Transform Spending (to handle skewness)
    # Adding 1 to avoid log(0)
    df['log_total_spent'] = np.log1p(df['total_lifetime_spend'])
    
    # 2. Activity Segments
    # Active: < 7 days inactive
    # At Risk: 7-14 days inactive
    # Churned: > 14 days inactive
    conditions = [
        (df['days_since_last_login'] <= 7),
        (df['days_since_last_login'] > 7) & (df['days_since_last_login'] <= 14),
        (df['days_since_last_login'] > 14)
    ]
    choices = ['Active', 'At_Risk', 'Churned_Status']
    df['activity_segment'] = np.select(conditions, choices, default='Unknown')

    # 3. High Value Player Flag
    # Spending > 90th percentile
    threshold = df[df['total_lifetime_spend'] > 0]['total_lifetime_spend'].quantile(0.9)
    df['is_high_value'] = (df['total_lifetime_spend'] > threshold).astype(int)
    
    print("Data processed successfully.")
    print(df[['player_id', 'activity_segment', 'is_high_value']].head())
    
    # Save processed data
    output_file = 'processed_telemetry_data.csv'
    df.to_csv(output_file, index=False)
    print(f"Processed data saved to {output_file}")

if __name__ == "__main__":
    process_data()
