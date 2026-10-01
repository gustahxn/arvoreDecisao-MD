let scenarios = [
    { id: 's1', name: 'Sol', probability: 60 },
    { id: 's2', name: 'Chuva', probability: 40 }
];

let decisions = [
    {
        id: 'd1', name: 'Compra 20 kg', cost: -70,
        values: { 's1': 98, 's2': 98 }
    },
    {
        id: 'd2', name: 'Compra 40 kg', cost: -140,
        values: { 's1': 196, 's2': 140 }
    },
    {
        id: 'd3', name: 'Compra 60 kg', cost: -210,
        values: { 's1': 294, 's2': 140 }
    },
    {
        id: 'd4', name: 'Compra 80 kg', cost: -280,
        values: { 's1': 350, 's2': 140 }
    }
];

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function renderScenarios() {
    const container = document.getElementById('scenarios-container');
    container.innerHTML = '';

    scenarios.forEach(s => {
        const row = document.createElement('div');
        row.className = 'item-row scenario-row';
        row.innerHTML = `
            <div class="item-group">
                <label>Cenário</label>
                <div class="scenario-name">${s.name}</div>
            </div>
            <div class="item-group">
                <label>Probabilidade (%)</label>
                <input type="number" min="0" max="100" value="${s.probability}" onchange="updateScenario('${s.id}', 'probability', this.value)">
            </div>
        `;
        container.appendChild(row);
    });
    
    renderDecisions();
    calculateResults();
}

// expoe funcoes no window para eventos inline
window.updateScenario = function(id, field, value) {
    const s = scenarios.find(x => x.id === id);
    if (s && field === 'probability') {
        let newProb = Number(value);
        if (newProb < 0) newProb = 0;
        if (newProb > 100) newProb = 100;
        s.probability = newProb;
        
        // Auto-adjust the other scenario to keep sum at 100%
        const other = scenarios.find(x => x.id !== id);
        if (other) {
            other.probability = 100 - newProb;
        }
        renderScenarios();
    }
}

function renderDecisions() {
    const container = document.getElementById('decisions-container');
    container.innerHTML = '';

    decisions.forEach(d => {
        const card = document.createElement('div');
        card.className = 'decision-card';
        
        let valuesHtml = '';
        scenarios.forEach(s => {
            const val = d.values[s.id] || 0;
            valuesHtml += `
                <div class="item-group">
                    <label>Receita em: ${s.name}</label>
                    <input type="number" value="${val}" onchange="updateDecisionValue('${d.id}', '${s.id}', this.value)">
                </div>
            `;
        });

        card.innerHTML = `
            <div class="decision-header">
                <div class="item-group">
                    <label>Nome da Opção</label>
                    <input type="text" value="${d.name}" onchange="updateDecision('${d.id}', 'name', this.value)">
                </div>
                <div class="item-group">
                    <label>Custo (negativo)</label>
                    <input type="number" value="${d.cost}" onchange="updateDecision('${d.id}', 'cost', this.value)">
                </div>
                <button class="btn btn-danger" onclick="removeDecision('${d.id}')">Remover</button>
            </div>
            <div class="values-grid">
                ${valuesHtml}
            </div>
        `;
        container.appendChild(card);
    });
}

window.updateDecision = function(id, field, value) {
    const d = decisions.find(x => x.id === id);
    if (d) {
        d[field] = field === 'cost' ? Number(value) : value;
        calculateResults();
    }
}

window.updateDecisionValue = function(decisionId, scenarioId, value) {
    const d = decisions.find(x => x.id === decisionId);
    if (d) {
        d.values[scenarioId] = Number(value);
        calculateResults();
    }
}

window.addDecision = function() {
    decisions.push({ id: generateId(), name: 'Nova Opção', cost: 0, values: {} });
    renderDecisions();
    calculateResults();
}

window.removeDecision = function(id) {
    decisions = decisions.filter(x => x.id !== id);
    renderDecisions();
    calculateResults();
}

function calculateResults() {
    const container = document.getElementById('results-container');
    container.innerHTML = '';

    let totalProb = scenarios.reduce((acc, s) => acc + s.probability, 0);
    if (totalProb !== 100) {
        container.innerHTML = '<p style="color:red; margin-bottom: 1rem;">Aviso: A soma das probabilidades dos cenários não é 100%.</p>';
    }

    let results = decisions.map(d => {
        let emv = 0;
        scenarios.forEach(s => {
            const revenue = d.values[s.id] || 0;
            const profit = revenue + d.cost; // custo ja e negativo (ex: -70)
            emv += profit * (s.probability / 100);
        });
        return { ...d, emv };
    });

    if (results.length === 0) return;

    let bestEmv = Math.max(...results.map(r => r.emv));

    results.forEach(r => {
        const isBest = r.emv === bestEmv && results.length > 1;
        const div = document.createElement('div');
        div.className = `result-card ${isBest ? 'best' : ''}`;
        
        div.innerHTML = `
            <div>
                <strong>${r.name}</strong>
                <br>
                <small>Valor Esperado (EMV): ${r.emv.toFixed(2)}</small>
            </div>
            ${isBest ? '<div class="best-label">Melhor Opção</div>' : ''}
        `;
        container.appendChild(div);
    });
}

document.getElementById('add-decision-btn').addEventListener('click', addDecision);

// renderizacao inicial
renderScenarios();
