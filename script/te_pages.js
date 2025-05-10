document.addEventListener('DOMContentLoaded', () => {
    const submit = document.getElementById('submit');
    if (!submit) return;

    const page = document.body.dataset.page;

    submit.addEventListener('click', () => {
        const key = getApiKey();
        if (!key || key.length !== 16) {
            printAlert('Error', 'Please enter a valid API key.');
            return;
        }

        switch (page) {
            case 'trailers':
                const playerId = document.getElementById('playerid').value.trim() || '';
                callTornAPI({ apiKey: key, part: `user/${playerId}`, selections: 'basic,properties' });
                break;

            case 'pa_planner':
                callTornAPI({ apiKey: key, part: 'faction', selections: 'basic,crimeexp' });
                break;

            case 'pa_payouts':
                const today = new Date();
                const monthOffset = parseInt(document.getElementById('monthSelect').value);
                const { firstDay, lastDay } = calculateMonthTimestamps(today, today.getMonth() - monthOffset, 192);
                callTornAPI({ apiKey: key, part: 'faction', selections: 'basic,crimes', from: firstDay, to: lastDay });
                break;

            case 'rankedwars':
                callTornAPI({ apiKey: key, part: 'torn', selections: 'rankedwars' });
                break;

            // add more cases if needed
        }
    });
});
