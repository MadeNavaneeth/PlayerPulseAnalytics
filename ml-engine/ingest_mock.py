import time
import json
import random

# Mock Firebase structure
# In a real app, we would use firebase_admin to write to Firestore or RTDB

def ingest_event(event_data):
    # Simulate network latency
    time.sleep(0.1)
    print(f"[FIREBASE MOCK] Ingested event: {event_data['event_type']} for {event_data['player_id']}")

def simulate_live_traffic():
    print("Simulating live game traffic...")
    player_count = 5
    
    event_types = ['level_up', 'purchase', 'session_start', 'session_end']
    
    for i in range(10): # Simulate 10 events
        player_id = f"player_{random.randint(0, player_count)}"
        event_type = random.choice(event_types)
        
        event = {
            'player_id': player_id,
            'event_type': event_type,
            'timestamp': time.time(),
            'payload': {}
        }
        
        if event_type == 'purchase':
            event['payload'] = {'amount': random.uniform(0.99, 19.99)}
        
        ingest_event(event)

if __name__ == "__main__":
    simulate_live_traffic()
