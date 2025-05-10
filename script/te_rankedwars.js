document.addEventListener('DOMContentLoaded', () => {
    const submit = document.getElementById('submit');
    submit.addEventListener('click', () => {
        const key = getApiKey();
        if (!key || key.length !== 16) {
            printAlert('Error', 'Please enter a valid API key.');
            return;
        }

        callTornAPI({
            apiKey: key,
            part: 'torn',
            selections: 'rankedwars'
        });
    });
});


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

