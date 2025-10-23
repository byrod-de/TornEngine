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
 * A function to call the Torn API v2 with a custom URL and handle the response.
 *
 * @param {object} options - an object containing the parameters for the API call
 * @param {string} options.apiKey - the API key to use for the call
 * @param {string} options.url - the custom URL to use for the API call
 * @returns {void}
 */
async function callTornAPIv2ByURL({ apiKey, url }) {
    try {
        const fullUrl = new URL(url);
        fullUrl.searchParams.set('key', apiKey);
        fullUrl.searchParams.set('comment', 'tornengine');

        //replace https://api.torn.com/ with empty string for logging
        const shortUrl = url.replace('https://api.torn.com/v2/', '').split('?')[0]; //remove query parameters for logging

        const response = await fetch(fullUrl);
        const data = await response.json();

        if (response.ok) {
            if (data.error) {
                handleTornApiError(data.error);
            } else {
                handleApiURLData(data, shortUrl);
            }
        } else {
            printAlert('Error', 'Torn API v2 not available.');
        }
    } catch (error) {
        console.error('callTornAPI error:', error);
        printAlert('Error', 'API call failed.');
    }
}

async function callTornAPIv2InBatch({ apiKey, url, batchSize = 5 }) {
    try {
        const fullUrl = new URL(url);
        fullUrl.searchParams.set('key', apiKey);
        fullUrl.searchParams.set('comment', 'tornengine');
        fullUrl.searchParams.delete('offset');

        //replace https://api.torn.com/ with empty string for logging
        const shortUrl = url.replace('https://api.torn.com/v2/', '').split('?')[0];

        const response = await fetch(fullUrl);
        const data = await response.json();

        if (response.ok) {
            if (data.error) {
                handleTornApiError(data.error);
            } else {
                if (data._metadata && data._metadata.links && data._metadata.links.next) {
                    let mergedData = { ...data };
                    console.log(mergedData);
                    let nextUrl = data._metadata.links?.next || null;
                    let count = 1;

                    const prevBtn = document.getElementById('btnPrevPage');
                    const nextBtn = document.getElementById('btnNextPage');
                    const showMoreBtn = document.getElementById('btnShowMore');
                    
                    if (prevBtn) prevBtn.disabled = true;
                    if (nextBtn) nextBtn.disabled = true;
                    if (showMoreBtn) showMoreBtn.disabled = true;

                    const summaryEl = document.getElementById('summary');
                    summaryEl?.insertAdjacentHTML('beforeend', '<div id="batchStatus">Starting batch merge...</div>');

                    while (count < batchSize && nextUrl) {

                        if (summaryEl) {
                            const dots = '...'.repeat(count % 4);
                            summaryEl.querySelector('#batchStatus').textContent =`Merging pages ${dots}`;
                        }

                        const nextUrlFull = new URL(nextUrl);
                        nextUrlFull.searchParams.set('key', apiKey);
                        nextUrlFull.searchParams.set('comment', 'tornengine');

                        const nextResponse = await fetch(nextUrlFull);
                        const nextData = await nextResponse.json();

                        if (nextResponse.ok) {
                            if (nextData.error) {
                                handleTornApiError(nextData.error);
                            } else {
                                mergedData.list.push(...nextData.list);
                                nextUrl = nextData._metadata.links.next;
                            }
                        } else {
                            printAlert('Error', 'Torn API not available.');
                            break;
                        }

                        await new Promise(resolve => setTimeout(resolve, delayRandomizer())); //delay between calls
                        count++;
                    }
                    summaryEl?.querySelector('#batchStatus')?.remove();
                    if (prevBtn) prevBtn.disabled = false;
                    if (nextBtn) nextBtn.disabled = false;
                    handleApiURLData(mergedData, shortUrl);
                } else {
                    handleApiURLData(data, shortUrl);
                }
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
async function callTornAPIv2({ apiKey, part = '', selections = '', from = '', to = '', category = '', filters = '' }) {
    try {
        const url = new URL(`https://api.torn.com/v2/${part}/${selections}`);

        url.searchParams.set('key', apiKey);
        url.searchParams.set('comment', 'tornengine');
        if (category) url.searchParams.set('cat', category);
        if (from) url.searchParams.set('from', from);
        if (to) url.searchParams.set('to', to);
        if (filters) url.searchParams.set('filters', filters);

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


function canRevive(apiKey) {
    callTornAPI({
        apiKey: apiKey,
        part: 'user/2',
        selections: 'profile'
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
    const DEBUG = false;
    if (DEBUG) {
        console.log('API Data:', data);
        console.log('Part:', part);
        console.log('Selections:', selections);
    }

    const page = document.body.dataset.page;

    if (part.startsWith('user') && selections === 'basic,properties') {
        printAlert('Success', 'API Call successful, find the results below.');
        parsePropertyInfo(data, 'properties', 'output');
    }

    if (part === 'torn' && selections === 'rankedwars') {
        printAlert('Success', 'API Call successful, find the results below.');
        parseRankedWars(data, 'output');
    }

    if (part.startsWith('torn/') && selections === 'rankedwarreport') {
        if (data.rankedwarreport) {
            printAlert('Success', 'API Call successful, find the results below.');
            parseRankedWarDetails(data.rankedwarreport, 'rankedWarModalBody');
        } else {
            document.getElementById('rankedWarModalBody').innerHTML = '<div class="alert alert-warning">No report data found for this war.</div>';
        }
    }

    if (part === 'faction' && selections === 'basic,crimeexp') {
        if (data.crimeexp && data.members) {
            printAlert('Success', 'API Call successful, find the results below.');
            parseCrimeexp(data.crimeexp, 'output', data.members);
        } else {
            printAlert('Warning', 'Faction API permissions may be missing.');
        }
    }

    if (part === 'faction' && selections === 'basic,crimes') {
        if (data.crimes && data.members) {
            switch (page) {
                case 'pa_payouts':
                    printAlert('Success', 'API Call successful, find the results below.');
                    parsePayouts(data.crimes, 'output', data.members);
                    break;
                case 'oc_overview':
                    printAlert('Success', 'API Call successful, find the results below.');
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
                    printAlert('Success', 'API Call successful, find the results below.');
                    parseOC2(data, 'summary');
                    break;
                case 'missing_items':
                    printAlert('Success', 'API Call successful, find the results below.');
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
            printAlert('Success', 'API Call successful, find the results below.');
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

    if (part === 'user/2' && selections === 'profile') {
        if (data) {
            printAlert('Success', 'User API Call successful, find the results below.');
            parseUserProfile(data, 'output');
        } else {
            printAlert('Warning', 'User API permissions may be missing.');
        }
    }

    if (part === 'user' && selections === 'list') {
        if (data) {
            printAlert('Success', 'User Lists API Call successful, find the results below.');
            parseUserLists(data, 'output');
        } else {
            printAlert('Warning', 'User Lists API permissions may be missing.');
        }
    }

    // Add other pages here when needed
}

function handleApiURLData(data, url) {
    switch (url) {
        case 'user/list':
            if (data) {
                printAlert('Success', 'User Lists API Call successful, find the results below.');
                parseUserLists(data, 'output');
            } else {
                printAlert('Warning', 'User Lists API permissions may be missing.');
            }
            break;
        default:
            printAlert('Warning', 'Unhandled API URL.');
    }
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

/**
 * Saves the user-provided API key to sessionStorage and checks its validity.
 * If the key is invalid, an error alert is shown. If the key is valid, a
 * success alert is shown and the key is stored to sessionStorage.
 *
 * @return {void}
 */
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

function submitPagination(url, batchSize = 0) {
    const apiKey = getApiKey();

    if (batchSize === 0) {
        callTornAPIv2ByURL({ apiKey: apiKey, url: url });
    } else {
        callTornAPIv2InBatch({ apiKey: apiKey, url: url, batchSize: batchSize });
    }
}