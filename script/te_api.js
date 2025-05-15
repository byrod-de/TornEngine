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


/**
 * A function to call the Torn API v2 with specified parameters and handle the response.
 *
 * @param {object} options - an object containing the parameters for the API call
 * @param {string} options.apiKey - the API key to use for the call
 * @param {string} [options.part] - the API endpoint to call
 * @param {string} [options.selections] - the data to select from the API response
 * @param {string} [options.from] - the starting timestamp for the API request
 * @param {string} [options.to] - the ending timestamp for the API request
 * @param {string} [options.category] - the category to use for the API request
 * @returns {void}
 */
async function callTornAPIv2({ apiKey, part = '', selections = '', from = '', to = '', category = '' }) {
    try {
        let url = `https://api.torn.com/v2/${part}/${selections}?key=${apiKey}&comment=tornengine`;
        if (category) url += `&cat=${category}`;
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
            printAlert('Error', 'Torn API v2 not available.');
        }
    } catch (error) {
        console.error('callTornAPIv2 error:', error);
        printAlert('Error', 'API v2 call failed.');
    }
}

// --- TornStats API Call ---

async function callTornStatsAPI(apiKey, part, selection, category, cacheStats = false) {
    try {
        const url = `https://www.tornstats.com/api/v2/${apiKey}/${part}/${category}/${selection}`;

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            if (data.error) {
                printAlert('Error', data.error);
            } else {
                handleApiData(data, 'tornstats', category, cacheStats);
            }
        } else {
            printAlert('Error', 'TornStats API not available.');
        }
    } catch (error) {
        console.error('callTornStatsAPI error:', error);
        printAlert('Error', 'TornStats API call failed.');
    }
}


/**
 * Calls the Torn API to fetch the ranked war report for a specific war.
 * The report is displayed in the ranked war modal.
 * @param {string} apiKey - The Torn API key.
 * @param {string} warId - The ID of the ranked war to fetch.
 */
function callRankedWarDetails(apiKey, warId) {
    const modalTitle = document.getElementById('rankedWarModalLabel');
    const modalBody = document.getElementById('rankedWarModalBody');

    modalTitle.textContent = 'Loading...';
    modalBody.innerHTML = '<div class="alert alert-info">Fetching war details. Please wait...</div>';

    callTornAPI({
        apiKey: apiKey,
        selections: 'rankedwarreport',
        customPath: `torn/${warId}`
    });
}


/**
 * Handles errors returned by the Torn API.
 *
 * @param {object} error - The error object returned by the Torn API.
 */
function handleTornApiError(error) {
    if (error.code === 2) {
        printAlert('Error', 'Incorrect API Key.');
    } else if (error.code === 5) {
        printAlert('Error', 'Too many requests. Slow down!');
    } else {
        printAlert('Error', `API Error: ${error.error}`);
    }
}

/**
 * Handles the response data from a Torn API call. This function is the central
 * point for processing the data returned by the Torn API. It will parse the
 * data and update the relevant page elements with the fetched data.
 *
 * @param {object} data - The response data from the Torn API.
 * @param {string} part - The part of the Torn API that was called.
 * @param {string} selections - The selections criteria used in the API call.
 */
function handleApiData(data, part, selections, cacheStats = false) {
    const DEBUG = true;
    if (DEBUG) {
        console.log('API Data:', data);
        console.log('Part:', part);
        console.log('Selections:', selections);
    }

    const page = document.body.dataset.page;

    if (part.startsWith('user') && selections === 'basic,properties') {
        printAlert('Success', 'The API Call successful, find the results below.');
        parsePropertyInfo(data, 'properties', 'output');
    }

    if (part === 'torn' && selections === 'rankedwars') {
        printAlert('Success', 'The API Call successful, find the results below.');
        parseRankedWars(data, 'output');
    }

    if (part.startsWith('torn/') && selections === 'rankedwarreport') {
        if (data.rankedwarreport) {
            printAlert('Success', 'The API Call successful, find the results below.');
            parseRankedWarDetails(data.rankedwarreport, 'rankedWarModalBody');
        } else {
            document.getElementById('rankedWarModalBody').innerHTML = '<div class="alert alert-warning">No report data found for this war.</div>';
        }
    }

    if (part === 'faction' && selections === 'basic,crimeexp') {
        if (data.crimeexp && data.members) {
            printAlert('Success', 'The API Call successful, find the results below.');
            parseCrimeexp(data.crimeexp, 'output', data.members);
        } else {
            printAlert('Warning', 'Faction API permissions may be missing.');
        }
    }

    if (part === 'faction' && selections === 'basic,crimes') {
        if (data.crimes && data.members) {
            switch (page) {
                case 'pa_payouts':
                    printAlert('Success', 'The API Call successful, find the results below.');
                    parsePayouts(data.crimes, 'output', data.members);
                    break;
                case 'oc_overview':
                    printAlert('Success', 'The API Call successful, find the results below.');
                    parseOCs(data.crimes, 'output', data.members);
                    break;
                default:
                    printAlert('Warning', 'Unhandled page context for basic,crimes data.');
            }
        } else {
            printAlert('Warning', 'Faction API permissions may be missing.');
        }
    }

    if (part === 'faction' && selections === 'basic,crimes,members') {
        if (data.crimes && data.members) {
            switch (page) {
                case 'oc2_center':
                    printAlert('Success', 'The API Call successful, find the results below.');
                    parseOC2(data, 'summary');
                    break;
                case 'missing_items':
                    printAlert('Success', 'The API Call successful, find the results below.');
                    parseMissingItems(data, 'output');
                    break;
                default:
                    printAlert('Warning', 'Unhandled page context for basic,crimes data.');
            }
        } else {
            printAlert('Warning', 'Faction API permissions may be missing.');
        }
    }

    if (part.startsWith('faction/') && selections === 'basic,members,wars') {
        if (data.members && data.wars) {
            printAlert('Success', 'The API Call successful, find the results below.');
            parseMembers(data, 'output');
        } else {
            printAlert('Warning', 'Faction API permissions may be missing.');
        }
    }

    if (part === 'tornstats' && selections === 'user') {
        if (data) {
            printAlert('Success', 'TornStats API Call successful, find the results below.');
            parseUserSpy(data, 'user');
        } else {
            printAlert('Warning', 'TornStats API permissions may be missing.');
        }
    }

        if (part === 'tornstats' && selections === 'faction') {
        if (data) {
            printAlert('Success', 'TornStats API Call successful, find the results below.');
            parseFactionSpy(data, cacheStats);
        } else {
            printAlert('Warning', 'TornStats API permissions may be missing.');
        }
    }
    // Add other pages here when needed
}

/**
 * Retrieves the trusted API key from localStorage and sets it to sessionStorage.
 * If the trusted key in localStorage is empty, it will use the value in the
 * "trustedkey" input element.
 *
 * @return {string} The trusted API key
 */
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
