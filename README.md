# PlayerPulse Analytics 🎮📊

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0-brightgreen)
![Python](https://img.shields.io/badge/python-3.8%2B-blue)
![Tableau](https://img.shields.io/badge/tableau-extension-orange)

> **Real-time game analytics dashboard featuring ML-powered churn prediction, dynamic live ops feeds, and native Tableau Extension integration.**

PlayerPulse bridges the gap between raw game telemetry and actionable insights. It leverages Machine Learning to predict player churn in real-time, segment players into dynamic cohorts (Whales, Dolphins, Minnows), and identify high-value monetization opportunities. Built as a dual-mode application, it functions both as a standalone web app and a fully integrated Tableau Extension.

## 📸 Dashboard Preview

![Dashboard Overview](<Screenshots/Screenshot 2026-01-11 132535.png>)
*Real-time monitoring of Player Churn Risk and Revenue Uplift opportunities.*

![Live Ops & Actions](<Screenshots/Screenshot 2026-01-11 132546.png>)
*Deep dive into Live Operations feed and Cohort Analysis.*

---

## ✨ Key Features

*   **🧠 AI-Powered Insights**
    *   **Churn Prediction:** Random Forest classifier analyzes player behavior to predict churn probability.
    *   **Monetization Uplift:** Identifies active players with high spending potential who haven't purchased recently.

*   **⚡ Live Ops Feed**
    *   Real-time, chat-style ticker of significant player events (Level Ups, Shop Visits, Churn Alerts).
    *   Visualizes the "pulse" of your game economy as it happens.

*   **📉 Dynamic Cohorts**
    *   Automated segmentation of players into **Whales** (> $100), **Dolphins** ($10-$100), and **Minnows** (< $10).
    *   Tracks retention rates and average spend per segment.

*   **🧩 Tableau Integration**
    *   Includes a `.trex` manifest for native integration with Tableau Desktop via the Extensions API.
    *   Supports two-way communication with Tableau worksheets (dashboard filtering based on selected players).

*   **🎨 Modern UI/UX**
    *   Sleek "Bento Grid" layout with glassmorphism elements.
    *   Interactive tooltips explaining complex metrics.
    *   Full responsive design for various dashboard sizes.

---

## 🛠️ Tech Stack

*   **Frontend:** HTML5, CSS3 (Custom Glassmorphism), JavaScript (ES6+), Chart.js
*   **Backend:** Node.js, Express.js (REST API)
*   **Machine Learning:** Python (Scikit-Learn, Pandas), Random Forest Classifier
*   **Data Integration:** Tableau Extensions API, Tableau Hyper API

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v14+)
*   Python (3.8+)
*   Tableau Desktop (Optional, for extension mode)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/MadeNavaneeth/PlayerPulseAnalytics.git
    cd PlayerPulseAnalytics
    ```

2.  **Install Backend Dependencies**
    ```bash
    cd backend
    npm install
    ```

3.  **Setup ML Environment**
    ```bash
    cd ../ml-engine
    # create virtual env (optional but recommended)
    # python -m venv venv
    pip install -r requirements.txt
    ```

### Running the Project

1.  **Start the Backend Server**
    ```bash
    # Terminal 1
    cd backend
    node server.js
    ```
    *Server runs on `http://localhost:3000`*

2.  **Generate Mock Data (Optional)**
    If you want fresh predictions:
    ```bash
    # Terminal 2
    cd ml-engine
    python train_model.py
    ```

3.  **Launch Dashboard**
    *   **Standalone:** Open `http://localhost:3000/index.html` in your browser.
    *   **Tableau:** Open Tableau, drag in an "Extension" object, and select `extension/playerpulse.trex`.

---

## 📂 Project Structure

```
PlayerPulseAnalytics/
├── backend/            # Express.js API Gateway
│   └── server.js       # Serves predictions & handles actions
├── extension/          # Frontend Dashboard
│   ├── index.html      # Main Dashboard UI
│   ├── script.js       # Logic & Tableau API integration
│   └── playerpulse.trex# Tableau Manifest File
├── ml-engine/          # Python Machine Learning
│   ├── predictions.csv # Generated output data
│   └── train_model.py  # RF Model Training Script
└── README.md
```

## 🏷️ Tags
`game-analytics` `machine-learning` `tableau-extension` `churn-prediction` `nodejs` `python` `real-time-dashboard`
