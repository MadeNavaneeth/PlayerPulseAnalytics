import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import pickle
import numpy as np

def train_monetization_model():
    print("Loading data for monetization model...")
    try:
        df = pd.read_csv('processed_telemetry_data.csv')
    except FileNotFoundError:
        print("Data file not found. Run process_data.py first.")
        return
    
    # We want to predict likely future spend, or just use current LTV insights
    # For this mock, let's try to predict 'total_lifetime_spend' based on engagement
    # In reality, we'd predict NEXT MONTH's spend.
    
    features = ['avg_session_length_mins', 'days_since_last_login', 'level_reached']
    target = 'total_lifetime_spend'
    
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Gradient Boosting Regressor...")
    model = GradientBoostingRegressor(random_state=42)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    print(f"Model RMSE: {rmse:.2f}")
    
    print("Saving monetization model...")
    with open('monetization_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    
    # Generate "Potential Value"
    # Let's say potential value is what the model predicts - actual spend (if positive)
    model_preds = model.predict(X)
    df['predicted_ltv'] = model_preds
    df['potential_uplift'] = df['predicted_ltv'] - df['total_lifetime_spend']
    df['potential_uplift'] = df['potential_uplift'].apply(lambda x: max(0, x)) # No negative uplift
    
    # Save insights
    df.to_csv('monetization_insights.csv', index=False)
    print("Monetization insights saved to monetization_insights.csv")

if __name__ == "__main__":
    train_monetization_model()
