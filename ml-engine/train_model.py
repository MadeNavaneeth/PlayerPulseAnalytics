import pandas as pd
# import xgboost as xgb
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pickle

def train_churn_model():
    print("Loading data...")
    try:
        df = pd.read_csv('processed_telemetry_data.csv')
    except FileNotFoundError:
        print("Data file not found. Run process_data.py first.")
        return

    # Features and Target
    # We need to map 'activity_segment' or just use numeric features for now
    # Let's simple encode 'activity_segment' if we want, or just use numeric
    
    features = ['avg_session_length_mins', 'days_since_last_login', 'total_lifetime_spend', 'is_high_value']
    X = df[features]
    y = df['churned']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    accuracy = accuracy_score(y_test, preds)
    print(f"Model Accuracy: {accuracy:.2f}")
    
    print("Saving model...")
    with open('churn_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    print("Model saved to churn_model.pkl")

    # Save predictions for all users for the dashboard
    all_preds = model.predict_proba(X)[:, 1] # Probability of churn
    df['churn_probability'] = all_preds
    df.to_csv('predictions.csv', index=False)
    print("Predictions saved to predictions.csv")

if __name__ == "__main__":
    train_churn_model()
