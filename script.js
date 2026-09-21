// ============================================
// Blox Fruits Live - Main JavaScript
// API Key Included for immediate testing
// ============================================

const PARSE_API_KEY = 'pmx_b0bc47ca05c6dbc49dc14bb94be36b53'; // مفتاحك هنا

// API Endpoints
const STOCK_API = 'https://api.parse.bot/scraper/e534d388-6640-4c19-b9b6-b2ba12930793/get_stock';
const VALUES_API = 'https://api.parse.bot/scraper/66e0bf14-56ac-462d-88c7-8469b6d631e9/get_all_fruits';

// ============================================
// 1. LIVE STOCK FUNCTIONALITY
// ============================================

let globalStockData = null;

async function loadStock() {
    const stockContainer = document.getElementById('stock-list');
    const timerContainer = document.getElementById('stock-timer');
    if (!stockContainer) return;

    try {
        stockContainer.innerHTML = '<div class="loading">Fetching live stock...</div>';
        const response = await fetch(STOCK_API, {
            headers: { 'X-API-Key': PARSE_API_KEY }
        });
        
        if (!response.ok) throw new Error('Failed to fetch stock');
        
        globalStockData = await response.json();
        showStock('normal'); // Show normal by default

    } catch (error) {
        console.error('Stock Error:', error);
        stockContainer.innerHTML = `<div class="card" style="border-left-color: var(--danger);">Failed to load stock data. Check your API key or try again later.</div>`;
    }
}

function showStock(type) {
    const stockContainer = document.getElementById('stock-list');
    if (!stockContainer || !globalStockData) return;

    // Update active tab styling
    const tabNormal = document.getElementById('tab-normal');
    const tabMirage = document.getElementById('tab-mirage');
    if (tabNormal) tabNormal.classList.toggle('active', type === 'normal');
    if (tabMirage) tabMirage.classList.toggle('active', type === 'mirage');

    const data = type === 'normal' ? globalStockData.normal : globalStockData.mirage;
    const dealerName = type === 'normal' ? 'Normal Dealer' : 'Mirage Dealer';

    if (!data || data.length === 0) {
        stockContainer.innerHTML = `<div class="card">No stock data available for ${dealerName}.</div>`;
        return;
    }

    stockContainer.innerHTML = data.map(fruit => `
        <div class="value-item">
            <img src="${fruit.image || 'https://via.placeholder.com/60'}" alt="${fruit.name}" onerror="this.style.display='none'">
            <div class="item-name">${fruit.name}</div>
            <div class="item-rarity">${fruit.type || 'Fruit'}</div>
            <div class="stat-row">
                <span class="stat-label">Beli Price:</span>
                <span class="stat-value">${fruit.price_beli ? fruit.price_beli.toLocaleString() : 'N/A'}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Robux Price:</span>
                <span class="stat-value">${fruit.price_robux || 'N/A'}</span>
            </div>
        </div>
    `).join('');

    // Simple timer display
    if (timerContainer) {
        const now = new Date();
        const nextUpdate = new Date(now);
        if (type === 'normal') {
            nextUpdate.setHours(Math.ceil(now.getHours() / 4) * 4, 0, 0, 0);
        } else {
            nextUpdate.setHours(Math.ceil(now.getHours() / 2) * 2, 0, 0, 0);
        }
        const diff = Math.floor((nextUpdate - now) / 60000);
        timerContainer.textContent = `⏳ Next ${dealerName} restock in approximately ${diff} minutes.`;
    }
}

// ============================================
// 2. LIVE VALUES FUNCTIONALITY (WITH PERM)
// ============================================

let globalValuesData = null;

async function loadValues(category = 'fruits') {
    const valuesContainer = document.getElementById('values-list');
    if (!valuesContainer) return;

    // Update active tab styling
    const tabFruits = document.getElementById('tab-fruits');
    const tabLimiteds = document.getElementById('tab-limiteds');
    const tabGamepasses = document.getElementById('tab-gamepasses');
    if (tabFruits) tabFruits.classList.toggle('active', category === 'fruits');
    if (tabLimiteds) tabLimiteds.classList.toggle('active', category === 'limiteds');
    if (tabGamepasses) tabGamepasses.classList.toggle('active', category === 'gamepasses');

    try {
        valuesContainer.innerHTML = '<div class="loading">Loading live values...</div>';
        
        let apiCategory = 'fruits';
        if (category === 'limiteds') apiCategory = 'limiteds';
        if (category === 'gamepasses') apiCategory = 'gamepasses';

        const response = await fetch(`${VALUES_API}?category=${apiCategory}`, {
            headers: { 'X-API-Key': PARSE_API_KEY }
        });

        if (!response.ok) throw new Error('Failed to fetch values');

        const data = await response.json();
        globalValuesData = data;
        renderValues(data, category);

    } catch (error) {
        console.error('Values Error:', error);
        valuesContainer.innerHTML = `<div class="card" style="border-left-color: var(--danger);">Failed to load values. Check your API key or try again later.</div>`;
    }
}

function renderValues(data, category) {
    const valuesContainer = document.getElementById('values-list');
    if (!valuesContainer) return;

    let items = [];
    if (Array.isArray(data)) {
        items = data;
    } else if (data.fruits) {
        items = data.fruits;
    } else if (data.items) {
        items = data.items;
    } else if (data.data) {
        items = data.data;
    } else {
        for (const key in data) {
            if (Array.isArray(data[key])) {
                items = data[key];
                break;
            }
        }
    }

    if (items.length === 0) {
        valuesContainer.innerHTML = '<div class="card">No items found for this category.</div>';
        return;
    }

    valuesContainer.innerHTML = items.map(item => {
        let tradeValue = item.trade_value;
        if (typeof tradeValue === 'number') {
            tradeValue = tradeValue >= 1000000 
                ? (tradeValue / 1000000).toFixed(2) + 'M' 
                : tradeValue.toLocaleString();
        } else if (tradeValue === null || tradeValue === undefined) {
            tradeValue = 'N/A';
        }

        const hasPermValue = item.perm_trade_value !== undefined && item.perm_trade_value !== null;
        let permValueDisplay = '';
        
        if (hasPermValue) {
            let permVal = item.perm_trade_value;
            if (typeof permVal === 'number') {
                permVal = permVal >= 1000000 
                    ? (permVal / 1000000).toFixed(2) + 'M' 
                    : permVal.toLocaleString();
            }
            permValueDisplay = `
                <div class="stat-row perm-value">
                    <span class="stat-label">⭐ Perm Value:</span>
                    <span class="stat-value">${permVal}</span>
                </div>`;
        } else if (category === 'fruits' || category === 'fruits') {
            permValueDisplay = `
                <div class="stat-row perm-value">
                    <span class="stat-label">⭐ Perm Value:</span>
                    <span class="stat-value" style="color: var(--text-muted);">Check API</span>
                </div>`;
        }

        const rarityColor = getRarityColor(item.rarity);

        return `
        <div class="value-item">
            <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.name}" onerror="this.style.display='none'">
            <div class="item-name">${item.name}</div>
            <div class="item-rarity" style="color: ${rarityColor}">${item.rarity || 'Unknown'}</div>
            <div class="stat-row">
                <span class="stat-label">Trade Value:</span>
                <span class="stat-value">${tradeValue}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Demand:</span>
                <span class="stat-value">${item.demand || 'N/A'} / 10</span>
            </div>
            ${permValueDisplay}
        </div>
    `}).join('');
}

function getRarityColor(rarity) {
    if (!rarity) return 'var(--text-muted)';
    const r = rarity.toLowerCase();
    if (r.includes('mythical')) return '#fbbf24';
    if (r.includes('legendary')) return '#f97316';
    if (r.includes('rare')) return '#0ea5e9';
    if (r.includes('uncommon')) return '#22c55e';
    if (r.includes('common')) return '#94a3b8';
    return 'var(--text-muted)';
}

// ============================================
// 3. SEARCH FUNCTIONALITY (Home Page)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length < 2) {
                document.getElementById('search-results').innerHTML = '';
                return;
            }
            performSearch(query);
        });
    }
});

async function performSearch(query) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;

    try {
        const [fruitsRes, limitedsRes, gamepassesRes] = await Promise.all([
            fetch(`${VALUES_API}?category=fruits`, { headers: { 'X-API-Key': PARSE_API_KEY } }),
            fetch(`${VALUES_API}?category=limiteds`, { headers: { 'X-API-Key': PARSE_API_KEY } }),
            fetch(`${VALUES_API}?category=gamepasses`, { headers: { 'X-API-Key': PARSE_API_KEY } })
        ]);

        const fruits = await fruitsRes.json();
        const limiteds = await limitedsRes.json();
        const gamepasses = await gamepassesRes.json();

        let allItems = [];
        [fruits, limiteds, gamepasses].forEach(data => {
            if (Array.isArray(data)) allItems.push(...data);
            else if (data.fruits) allItems.push(...data.fruits);
            else if (data.items) allItems.push(...data.items);
            else if (data.data) allItems.push(...data.data);
        });

        const filtered = allItems.filter(item => 
            item.name && item.name.toLowerCase().includes(query)
        );

        if (filtered.length === 0) {
            resultsContainer.innerHTML = '<div class="card">No results found.</div>';
            return;
        }

        resultsContainer.innerHTML = filtered.slice(0, 12).map(item => {
            let tradeValue = item.trade_value;
            if (typeof tradeValue === 'number') {
                tradeValue = tradeValue >= 1000000 
                    ? (tradeValue / 1000000).toFixed(2) + 'M' 
                    : tradeValue.toLocaleString();
            } else {
                tradeValue = 'N/A';
            }

            return `
            <div class="value-item">
                <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.name}" onerror="this.style.display='none'">
                <div class="item-name">${item.name}</div>
                <div class="item-rarity">${item.rarity || 'Item'}</div>
                <div class="stat-row">
                    <span class="stat-label">Value:</span>
                    <span class="stat-value">${tradeValue}</span>
                </div>
            </div>`;
        }).join('');

    } catch (error) {
        console.error('Search Error:', error);
        resultsContainer.innerHTML = '<div class="card">Search failed. Please try again.</div>';
    }
}

// ============================================
// 4. AI CHAT FUNCTIONALITY
// ============================================

const aiResponses = {
    'hello': 'Hello! How can I help you with Blox Fruits today?',
    'hi': 'Hey there! Ask me about fruits, swords, or strategies.',
    'best fruit': 'For PvP, Kitsune and Dragon are top tier. For grinding, Buddha and Magma are excellent.',
    'how to get superhuman': 'You need 4 fighting styles at 300 mastery (Dark Step, Electric, Water Kung Fu, Dragon Breath), then 3,000,000 Beli. Talk to Martial Arts Master in Snow Mountain.',
    'best sword': 'Cursed Dual Katana (CDK) is considered the best overall. Dark Blade is great for PvP.',
    'how to get godhuman': 'Master 5 fighting styles to 400, then talk to Ancient Monk in Floating Turtle Island. Costs 5,000,000 Beli and 5,000 Fragments.',
    'default': 'I can help with fruit values, sword recommendations, fighting style guides, and more. Could you rephrase your question?'
};

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    addChatMessage(message, 'user');
    input.value = '';

    setTimeout(() => {
        const response = getAIResponse(message.toLowerCase());
        addChatMessage(response, 'ai');
    }, 500);
}

function getAIResponse(query) {
    for (const key in aiResponses) {
        if (key !== 'default' && query.includes(key)) {
            return aiResponses[key];
        }
    }
    return aiResponses['default'];
}

function addChatMessage(text, sender) {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.textContent = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});

// ============================================
// 5. INITIALIZATION
// ============================================

setInterval(() => {
    if (document.getElementById('stock-list')) {
        loadStock();
    }
}, 300000);
