// ============================================
// Blox Fruits Live - Main JavaScript
// Both API Keys Included
// ============================================

// 🔑 مفاتيح API (موجودة هنا بناءً على طلبك)
const PARSE_API_KEY = 'pmx_b0bc47ca05c6dbc49dc14bb94be36b53';
const GEMINI_API_KEY = 'AIzaSyD2Fsjvhl3sMV1KU8X6gnXi0zylHWaFpQg';

const VALUES_API = 'https://api.parse.bot/scraper/66e0bf14-56ac-462d-88c7-8469b6d631e9/get_all_fruits';

// ============================================
// 1. LIVE STOCK
// ============================================

let globalStockData = null;

async function loadStock() {
    const stockContainer = document.getElementById('stock-list');
    const timerContainer = document.getElementById('stock-timer');
    if (!stockContainer) return;

    try {
        stockContainer.innerHTML = '<div class="loading">Fetching live stock...</div>';
        const response = await fetch('data/stock.json');
        if (!response.ok) throw new Error('Stock file not found. Run GitHub Action.');
        
        globalStockData = await response.json();
        showStock('normal');
    } catch (error) {
        console.error('Stock Error:', error);
        // محاولة الاتصال المباشر بالـ API إذا فشل الملف المحلي
        try {
            const directResponse = await fetch('https://api.parse.bot/scraper/e534d388-6640-4c19-b9b6-b2ba12930793/get_stock', {
                headers: { 'X-API-Key': PARSE_API_KEY }
            });
            if (directResponse.ok) {
                globalStockData = await directResponse.json();
                showStock('normal');
                return;
            }
        } catch (e) {}
        
        stockContainer.innerHTML = `<div class="card" style="border-left-color: var(--danger);">Failed to load stock. ${error.message}</div>`;
    }
}

function showStock(type) {
    const stockContainer = document.getElementById('stock-list');
    if (!stockContainer || !globalStockData) return;

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
            <div class="stat-row"><span class="stat-label">Beli:</span><span class="stat-value">${fruit.price_beli ? fruit.price_beli.toLocaleString() : 'N/A'}</span></div>
            <div class="stat-row"><span class="stat-label">Robux:</span><span class="stat-value">${fruit.price_robux || 'N/A'}</span></div>
        </div>
    `).join('');

    if (timerContainer) {
        const now = new Date();
        const nextUpdate = new Date(now);
        if (type === 'normal') nextUpdate.setHours(Math.ceil(now.getHours() / 4) * 4, 0, 0, 0);
        else nextUpdate.setHours(Math.ceil(now.getHours() / 2) * 2, 0, 0, 0);
        const diff = Math.floor((nextUpdate - now) / 60000);
        timerContainer.textContent = `⏳ Next ${dealerName} restock in ~${diff} minutes.`;
    }
}

// ============================================
// 2. LIVE VALUES
// ============================================

async function loadValues(category = 'fruits') {
    const valuesContainer = document.getElementById('values-list');
    if (!valuesContainer) return;

    ['tab-fruits', 'tab-limiteds', 'tab-gamepasses'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });
    const activeTab = document.getElementById(category === 'fruits' ? 'tab-fruits' : category === 'limiteds' ? 'tab-limiteds' : 'tab-gamepasses');
    if (activeTab) activeTab.classList.add('active');

    try {
        valuesContainer.innerHTML = '<div class="loading">Loading live values...</div>';
        
        let data = null;
        // محاولة القراءة من الملف المحلي أولاً
        try {
            const response = await fetch('data/values.json');
            if (response.ok) data = await response.json();
        } catch (e) {}

        // إذا لم يوجد ملف محلي، اتصل مباشرة بالـ API
        if (!data) {
            const response = await fetch(`${VALUES_API}?category=${category}`, {
                headers: { 'X-API-Key': PARSE_API_KEY }
            });
            if (!response.ok) throw new Error('Failed to fetch values');
            data = await response.json();
        }

        let items = [];
        if (Array.isArray(data)) items = data;
        else if (data.fruits) items = data.fruits;
        else if (data.items) items = data.items;
        else if (data.data) items = data.data;
        else for (const key in data) { if (Array.isArray(data[key])) { items = data[key]; break; } }

        renderValues(items, category);
    } catch (error) {
        console.error('Values Error:', error);
        valuesContainer.innerHTML = `<div class="card" style="border-left-color: var(--danger);">Failed to load values: ${error.message}</div>`;
    }
}

function renderValues(items, category) {
    const valuesContainer = document.getElementById('values-list');
    if (!valuesContainer) return;

    if (!items || items.length === 0) {
        valuesContainer.innerHTML = '<div class="card">No items found for this category.</div>';
        return;
    }

    valuesContainer.innerHTML = items.map(item => {
        let tradeValue = item.trade_value;
        if (typeof tradeValue === 'number') {
            tradeValue = tradeValue >= 1000000 ? (tradeValue / 1000000).toFixed(2) + 'M' : tradeValue.toLocaleString();
        } else { tradeValue = 'N/A'; }

        const hasPerm = item.perm_trade_value !== undefined && item.perm_trade_value !== null;
        let permDisplay = '';
        if (hasPerm) {
            let pv = item.perm_trade_value;
            if (typeof pv === 'number') pv = pv >= 1000000 ? (pv / 1000000).toFixed(2) + 'M' : pv.toLocaleString();
            permDisplay = `<div class="stat-row perm-value"><span class="stat-label">⭐ Perm Value:</span><span class="stat-value">${pv}</span></div>`;
        }

        return `
        <div class="value-item">
            <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.name}" onerror="this.style.display='none'">
            <div class="item-name">${item.name}</div>
            <div class="item-rarity" style="color: ${getRarityColor(item.rarity)}">${item.rarity || 'Unknown'}</div>
            <div class="stat-row"><span class="stat-label">Trade Value:</span><span class="stat-value">${tradeValue}</span></div>
            <div class="stat-row"><span class="stat-label">Demand:</span><span class="stat-value">${item.demand || 'N/A'}/10</span></div>
            ${permDisplay}
        </div>`;
    }).join('');
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
// 3. SEARCH
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
        let allItems = [];
        try {
            const response = await fetch('data/values.json');
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) allItems = data;
                else if (data.fruits) allItems = data.fruits;
                else if (data.items) allItems = data.items;
                else if (data.data) allItems = data.data;
            }
        } catch (e) {}

        if (allItems.length === 0) {
            const response = await fetch(`${VALUES_API}?category=fruits`, {
                headers: { 'X-API-Key': PARSE_API_KEY }
            });
            const data = await response.json();
            if (Array.isArray(data)) allItems = data;
            else if (data.fruits) allItems = data.fruits;
            else if (data.items) allItems = data.items;
        }

        const filtered = allItems.filter(item => item.name && item.name.toLowerCase().includes(query));

        if (filtered.length === 0) {
            resultsContainer.innerHTML = '<div class="card">No results found.</div>';
            return;
        }

        resultsContainer.innerHTML = filtered.slice(0, 12).map(item => {
            let tv = item.trade_value;
            if (typeof tv === 'number') tv = tv >= 1000000 ? (tv / 1000000).toFixed(2) + 'M' : tv.toLocaleString();
            else tv = 'N/A';
            return `<div class="value-item">
                <img src="${item.image || 'https://via.placeholder.com/60'}" onerror="this.style.display='none'">
                <div class="item-name">${item.name}</div>
                <div class="item-rarity">${item.rarity || 'Item'}</div>
                <div class="stat-row"><span class="stat-label">Value:</span><span class="stat-value">${tv}</span></div>
            </div>`;
        }).join('');
    } catch (error) {
        resultsContainer.innerHTML = '<div class="card">Search failed.</div>';
    }
}

// ============================================
// 4. LIVE AI - Google Gemini
// ============================================

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    addChatMessage(message, 'user');
    input.value = '';

    const chatBox = document.getElementById('chat-box');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-message ai';
    loadingDiv.id = 'ai-loading';
    loadingDiv.textContent = 'Thinking...';
    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are Live AI, a helpful and friendly Blox Fruits expert assistant for the website "Blox Fruits Live". 

Rules:
1. Understand the user's question even if they have spelling mistakes or use different languages (Arabic, English, Spanish, etc.).
2. Always respond in the SAME language the user used.
3. If they ask about a fruit, provide its trade value, demand, and how to get it.
4. If they ask about a sword or fighting style, provide how to get it and its best use.
5. Keep answers concise, accurate, and helpful.
6. If you don't know something, say so honestly.

User question: ${message}`
                    }]
                }]
            })
        });

        const data = await response.json();
        const loadingEl = document.getElementById('ai-loading');
        if (loadingEl) loadingEl.remove();

        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
            addChatMessage(data.candidates[0].content.parts[0].text, 'ai');
        } else if (data.error) {
            addChatMessage(`AI Error: ${data.error.message}`, 'ai');
        } else {
            addChatMessage("Sorry, I couldn't process that. Please try again.", 'ai');
        }
    } catch (error) {
        const loadingEl = document.getElementById('ai-loading');
        if (loadingEl) loadingEl.remove();
        addChatMessage(`Connection error: ${error.message}`, 'ai');
    }
}

function addChatMessage(text, sender) {
    const chatBox = document.getElementById('chat-box');
    if (!chatBox) return;
    const div = document.createElement('div');
    div.className = `chat-message ${sender}`;
    div.textContent = text;
    chatBox.appendChild(div);
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
// 5. LIVE STATS
// ============================================

async function updateLiveStats() {
    const stats = { 'stat-fruits': '1,200+', 'stat-swords': '150+', 'stat-players': '500K+' };
    for (const [id, value] of Object.entries(stats)) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }
}
if (document.getElementById('live-stats')) updateLiveStats();

// ============================================
// 6. AUTO-REFRESH
// ============================================
setInterval(() => {
    if (document.getElementById('stock-list')) loadStock();
}, 300000);
