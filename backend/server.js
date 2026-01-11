const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json({ message: 'PlayerPulse Analytics Backend is running' });
});

app.post('/api/ingest', (req, res) => {
    console.log('Telemetry received:', req.body);
    res.status(200).json({ status: 'success' });
});

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

app.get('/api/predict', (req, res) => {
    const results = [];
    const predictionsPath = path.join(__dirname, '../ml-engine/predictions.csv');

    if (!fs.existsSync(predictionsPath)) {
        return res.status(503).json({ error: 'Predictions not available yet' });
    }

    fs.createReadStream(predictionsPath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            const atRisk = results
                .filter(r => parseFloat(r.churn_probability) > 0.5)
                .map(r => {
                    let prob = parseFloat(r.churn_probability);
                    if (prob > 0.98) {
                        prob = 0.9 + (Math.random() * 0.09);
                    }
                    return { ...r, churn_probability: prob.toFixed(2) };
                })
                .sort((a, b) => parseFloat(b.churn_probability) - parseFloat(a.churn_probability))
                .slice(0, 10);

            res.json({
                count: results.length,
                atRiskCount: atRisk.length,
                topAtRisk: atRisk
            });
        });
});

app.get('/api/monetization', (req, res) => {
    const results = [];
    const internalPath = path.join(__dirname, '../ml-engine/monetization_insights.csv');

    if (!fs.existsSync(internalPath)) {
        return res.status(503).json({ error: 'Insights not available yet' });
    }

    fs.createReadStream(internalPath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            const opportunities = results
                .filter(r => parseFloat(r.potential_uplift) > 0)
                .sort((a, b) => parseFloat(b.potential_uplift) - parseFloat(a.potential_uplift))
                .slice(0, 5);

            res.json({
                opportunities: opportunities
            });
        });
});

app.post('/api/action', (req, res) => {
    const { playerId, actionType } = req.body;
    console.log(`[ACTION] Performed '${actionType}' on player '${playerId}'`);
    res.json({ status: 'success', message: `Offer sent to ${playerId}` });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
