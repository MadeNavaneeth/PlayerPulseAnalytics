const BACKEND_URL = 'http://localhost:3000/api';

(function () {
    $(document).ready(function () {
        try {
            tableau.extensions.initializeAsync().then(function () {
                console.log("Tableau Extension Initialized!");
                setupEventListeners();
                fetchData();
            }, function (err) {
                console.info('Tableau context not found. Switching to Standalone Mode.');
                setupEventListeners();
                fetchData();
            });
        } catch (e) {
            console.warn("Tableau Extensions API not found. Running in standalone mode.");
            setupEventListeners();
            fetchData();
        }
    });

    function setupEventListeners() {
        const btn = document.getElementById('refresh-btn');
        if (btn) {
            btn.addEventListener('click', function () {
                fetchData();
            });
        }
    }

    function fetchData() {
        fetchChurnPredictions();
        fetchMonetizationInsights();
    }

    function fetchChurnPredictions() {
        const loading = document.getElementById('churn-loading');
        const countEl = document.getElementById('at-risk-count');
        const listEl = document.getElementById('churn-list');

        if (loading) loading.style.display = 'inline-block';

        fetch(`${BACKEND_URL}/predict`)
            .then(response => response.json())
            .then(data => {
                if (loading) loading.style.display = 'none';
                if (data.atRiskCount !== undefined) {
                    countEl.textContent = data.atRiskCount;

                    const safeCount = data.count - data.atRiskCount;
                    renderChurnChart(data.atRiskCount, safeCount);

                    if (listEl) {
                        listEl.innerHTML = '';
                        data.topAtRisk.forEach(player => {
                            const li = document.createElement('li');
                            li.className = 'list-item';
                            li.style.borderBottom = "1px solid rgba(0,0,0,0.1)";
                            li.style.padding = "12px 20px";
                            const prob = (parseFloat(player.churn_probability) * 100).toFixed(0);
                            li.innerHTML = `
                            <span style="font-weight:600;">${player.player_id}</span>
                            <span style="background:#000; color:#fff; padding: 4px 12px; border-radius:100px; font-weight:800; font-size:12px;">${prob}% RISK</span>
                        `;
                            listEl.appendChild(li);
                        });
                    }
                }
            })
            .catch(err => {
                console.error("Failed to fetch churn predictions", err);
                if (countEl) countEl.textContent = "Err";

                const feedEl = document.getElementById('feed-list');
                if (feedEl) {
                    const li = document.createElement('li');
                    li.style.padding = "5px 0";
                    li.innerHTML = `<span style="color:#000; font-weight:bold;">SYSTEM ERROR:</span> <span style="color:#000;">Churn Data: ${err.message}</span>`;
                    feedEl.prepend(li);
                }
            });
    }

    function fetchMonetizationInsights() {
        const loading = document.getElementById('monetization-loading');
        const countEl = document.getElementById('opportunity-count');
        const totalPotEl = document.getElementById('total-potential');
        const listEl = document.getElementById('monetization-list');

        if (loading) loading.style.display = 'inline-block';

        fetch(`${BACKEND_URL}/monetization`)
            .then(response => response.json())
            .then(data => {
                if (loading) loading.style.display = 'none';
                if (data.opportunities) {
                    if (countEl) countEl.textContent = data.opportunities.length;

                    const totalUpside = data.opportunities.reduce((sum, opp) => sum + parseFloat(opp.potential_uplift), 0);
                    if (totalPotEl) totalPotEl.textContent = '$' + totalUpside.toFixed(0);

                    const labels = [];
                    const dataPoints = [];

                    if (listEl) listEl.innerHTML = '';

                    data.opportunities.slice(0, 5).forEach(opp => {
                        const uplift = parseFloat(opp.potential_uplift).toFixed(2);

                        labels.push(opp.player_id);
                        dataPoints.push(uplift);

                        if (listEl) {
                            const li = document.createElement('li');
                            li.className = 'list-item';
                            li.innerHTML = `
                                <span>${opp.player_id}</span>
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <span class="tag tag-success">+$${uplift} Potential</span>
                                    <button class="btn-sm action-btn" data-id="${opp.player_id}" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                            <line x1="22" y1="2" x2="11" y2="13"></line>
                                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                        </svg>
                                    </button>
                                </div>
                            `;
                            listEl.appendChild(li);
                        }
                    });

                    renderRevenueChart(labels, dataPoints);

                    if (listEl) {
                        $('.action-btn').on('click', function () {
                            const playerId = $(this).data('id');
                            const btn = $(this);
                            btn.css('opacity', '0.7').prop('disabled', true);

                            fetch(`${BACKEND_URL}/action`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ playerId: playerId, actionType: 'grant_offer' })
                            })
                                .then(r => r.json())
                                .then(data => {
                                    btn.css('background', '#00b894').prop('disabled', true);
                                    btn.html(`
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    `);
                                })
                                .catch(e => {
                                    console.error(e);
                                    btn.text('Error').prop('disabled', false);
                                });
                        });
                    }
                }
            })
            .catch(err => {
                console.error("Failed to fetch monetization insights", err);
                if (loading) loading.style.display = 'none';
                if (countEl) countEl.textContent = "Err";

                const feedEl = document.getElementById('feed-list');
                if (feedEl) {
                    const li = document.createElement('li');
                    li.style.padding = "5px 0";
                    li.innerHTML = `<span style="color:#000; font-weight:bold;">SYSTEM ERROR:</span> <span style="color:#000;">Monetiz. Data: ${err.message}</span>`;
                    feedEl.prepend(li);
                }
            });
    }

    let churnChartInstance = null;
    function renderChurnChart(risk, safe) {
        const ctx = document.getElementById('churnChart').getContext('2d');
        if (churnChartInstance) churnChartInstance.destroy();

        churnChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['At Risk', 'Safe'],
                datasets: [{
                    data: [risk, safe],
                    backgroundColor: ['#000000', 'rgba(0,0,0,0.1)'],
                    borderWidth: 0,
                    cutout: '70%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } }
            }
        });
    }

    let revenueChartInstance = null;
    function renderRevenueChart(labels, data) {
        const ctx = document.getElementById('revenueChart').getContext('2d');

        if (revenueChartInstance) {
            revenueChartInstance.destroy();
        }

        revenueChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Potential Revenue ($)',
                    data: data,
                    backgroundColor: '#000000',
                    borderColor: '#000000',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#000',
                        titleFont: { family: 'Inter' },
                        bodyFont: { family: 'Inter' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0, 0, 0, 0.1)' },
                        ticks: { color: '#000', font: { family: 'Inter', weight: 'bold' } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#000', font: { family: 'Inter', weight: 'bold' } }
                    }
                }
            }
        });
    }

    function startLiveFeed() {
        const feedEl = document.getElementById('feed-list');
        const actions = [
            { text: "completed Level 42", type: "info", color: "#a29bfe" },
            { text: "purchased 'Starter Pack' ($4.99)", type: "success", color: "#00CEC9" },
            { text: "failed Boss Raid", type: "danger", color: "#FF7675" },
            { text: "logged in", type: "info", color: "#b2bec3" },
            { text: "triggered Churn Alert", type: "danger", color: "#FF7675" },
            { text: "viewed Store", type: "info", color: "#a29bfe" }
        ];

        function addLog() {
            const now = new Date();
            const time = now.toLocaleTimeString('en-US', { hour12: false });
            const playerId = "Player_" + Math.floor(Math.random() * 9000 + 1000);
            const action = actions[Math.floor(Math.random() * actions.length)];

            const li = document.createElement('li');
            li.style.padding = "5px 0";
            li.style.borderBottom = "1px solid rgba(255,255,255,0.05)";
            li.style.animation = "fadeIn 0.5s ease";
            li.innerHTML = `<span style="opacity:0.5">[${time}]</span> <span style="font-weight:bold; color:#fff">${playerId}</span> <span style="color:${action.color}">${action.text}</span>`;

            feedEl.prepend(li);

            if (feedEl.children.length > 20) {
                feedEl.removeChild(feedEl.lastChild);
            }
        }

        for (let i = 0; i < 5; i++) addLog();

        setInterval(() => {
            addLog();
        }, 2500);
    }

    startLiveFeed();

})();
