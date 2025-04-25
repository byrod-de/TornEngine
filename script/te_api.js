async function callTornAPI({ apiKey, part = '', selections = '', from = '', to = '' }) {
    try {
        let url = `https://api.torn.com/${part}?selections=${selections}&key=${apiKey}&comment=tornengine`;

        if (from) url += `&from=${from}`;
        if (to) url += `&to=${to}`;

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            if (data.error) {
                handleTornApiError(data.error);
            } else {
                handleApiData(data, part, selections);
            }
        } else {
            printAlert('Error', 'Torn API not available.');
        }
    } catch (error) {
        console.error('callTornAPI error:', error);
        printAlert('Error', 'API call failed.');
    }
}

// --- Torn API Call (v2) ---

async function callTornAPIv2({ apiKey, part = '', selection = '', category = '' }) {
    try {
        let url = `https://api.torn.com/v2/${part}/${selection}?key=${apiKey}&comment=tornengine`;
        if (category) url += `&cat=${category}`;

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            if (data.error) {
                handleTornApiError(data.error);
            } else {
                handleApiData(data, part, selection);
            }
        } else {
            printAlert('Error', 'Torn API v2 not available.');
        }
    } catch (error) {
        console.error('callTornAPIv2 error:', error);
        printAlert('Error', 'API v2 call failed.');
    }
}

// --- TornStats API Call ---

async function callTornStatsAPI(apiKey, id) {
    try {
        const url = `https://www.tornstats.com/api/v3/user/${id}?selections=profile&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            if (data.error) {
                printAlert('Error', data.error);
            } else {
                handleApiData(data, 'tornstats', 'user');
            }
        } else {
            printAlert('Error', 'TornStats API not available.');
        }
    } catch (error) {
        console.error('callTornStatsAPI error:', error);
        printAlert('Error', 'TornStats API call failed.');
    }
}

// --- Ranked War Details Call (special case) ---

async function callRankedWarDetails(apiKey, warId) {
    try {
        const url = `https://api.torn.com/torn/${warId}?selections=rankedwars&key=${apiKey}&comment=tornengine`;

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            if (data.error) {
                handleTornApiError(data.error);
            } else {
                handleApiData(data, 'rankedwar', warId);
            }
        } else {
            printAlert('Error', 'Ranked Wars API not available.');
        }
    } catch (error) {
        console.error('callRankedWarDetails error:', error);
        printAlert('Error', 'Ranked War Details API call failed.');
    }
}

// --- API Helpers ---

function handleTornApiError(error) {
    if (error.code === 2) {
        printAlert('Error', 'Incorrect API Key.');
    } else if (error.code === 5) {
        printAlert('Error', 'Too many requests. Slow down!');
    } else {
        printAlert('Error', `API Error: ${error.error}`);
    }
}

function handleApiData(data, part, selections) {
    console.log('API Data:', data);
    console.log('Part:', part);
    console.log('Selections:', selections);
    if (part.startsWith('user')) {
        if (selections === 'basic,properties') {
            printAlert('Success', 'The API Call successful, find the results below.');
            parsePropertyInfo(data, 'properties', 'output');
        }
    }
    // other cases (members, attacks, etc.)
}


// --- Key Retrieval (Storage Helpers) ---

function storageAvailable(type) {
    try {
        const storage = window[type];
        const testKey = '__storage_test__';
        storage.setItem(testKey, testKey);
        storage.removeItem(testKey);
        return true;
    } catch (e) {
        return false;
    }
}

function getApiKey() {
    let localStorageApiKey = "";
    if (storageAvailable('localStorage')) {
      localStorageApiKey = localStorage.getItem('api_key');
    }
    let trustedApiKey = document.getElementById("trustedkey").value || localStorageApiKey;
  
    sessionStorage.trustedApiKey = trustedApiKey;
    localStorage.setItem('api_key', trustedApiKey);
  
    return trustedApiKey;
  }

// --- User Submit Handler ---

function userSubmit() {
    const key = document.getElementById('apiKeyInput').value.trim();

    if (!key || key.length !== 16) {
        printAlert('Error', 'Please enter a valid 16-character API key.');
        return;
    }

    sessionStorage.setItem('apiKey', key);
    printAlert('Success', 'API key saved successfully.');

    // Trigger a key check or data reload if necessary
}
