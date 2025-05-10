/**
 * A function to call the Torn API with specified parameters and handle the response.
 *
 * @param {object} options - an object containing the parameters for the API call
 * @param {string} options.apiKey - the API key to use for the call
 * @param {string} [options.part] - the API endpoint to call
 * @param {string} [options.selections] - the data to select from the API response
 * @param {string} [options.from] - the starting timestamp for the API request
 * @param {string} [options.to] - the ending timestamp for the API request
 * @param {string} [options.customPath] - the custom path to use for the API call
 * @returns {void}
 */

async function callTornAPI({ apiKey, part = '', selections = '', from = '', to = '', customPath = '' }) {
    let path = customPath || part;
    let url = `https://api.torn.com/${path}?selections=${selections}&key=${apiKey}&comment=tornengine`;

    if (from) url += `&from=${from}`;
    if (to) url += `&to=${to}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            if (data.error) {
                handleTornApiError(data.error);
            } else {
                handleApiData(data, path, selections);
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
    const DEBUG = true;
    if (DEBUG) {
        console.log('API Data:', data);
        console.log('Part:', part);
        console.log('Selections:', selections);
    }
    if (part.startsWith('user')) {
        if (selections === 'basic,properties') {
            printAlert('Success', 'The API Call successful, find the results below.');
            parsePropertyInfo(data, 'properties', 'output');
        }
    }
    if (part === 'torn' && selections === 'rankedwars') {
        parseRankedWars(data, 'output');
    }
    if (part.startsWith('torn/') && selections === 'rankedwarreport') {
        if (data.rankedwarreport) {
            parseRankedWarDetails(data.rankedwarreport, 'rankedWarModalBody');
        } else {
            document.getElementById('rankedWarModalBody').innerHTML = '<div class="alert alert-warning">No report data found for this war.</div>';
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
