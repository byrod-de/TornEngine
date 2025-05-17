document.addEventListener('DOMContentLoaded', () => {
    const submit = document.getElementById('submit');
    if (!submit) return;

    const page = document.body.dataset.page;

    submit.addEventListener('click', () => {
        const apiKey = getApiKey();
        if (!apiKey || apiKey.length !== 16) {
            printAlert('Error', 'Please enter a valid API key.');
            return;
        }

        const today = new Date();
        const monthOffset = document.getElementById('monthSelect')?.value
            ? parseInt(document.getElementById('monthSelect').value)
            : 0;
        const currentMonth = today.getMonth();
        const { firstDay, lastDay } = calculateMonthTimestamps(today, currentMonth - monthOffset, 192);


        switch (page) {
            case 'trailers':
                const playerId = document.getElementById('playerid').value.trim() || '';
                callTornAPI({ apiKey: apiKey, part: `user/${playerId}`, selections: 'basic,properties' });
                break;

            case 'pa_planner':
                callTornAPI({ apiKey: apiKey, part: 'faction', selections: 'basic,crimeexp' });
                break;

            case 'pa_payouts':
                callTornAPI({ apiKey: apiKey, part: 'faction', selections: 'basic,crimes', from: firstDay, to: lastDay });
                break;

            case 'rankedwars':
                callTornAPI({ apiKey: apiKey, part: 'torn', selections: 'rankedwars' });
                break;

            case 'oc_overview':
                callTornAPI({ apiKey: apiKey, part: 'faction', selections: 'basic,crimes', from: firstDay, to: lastDay });
                break;

            case 'oc2_center':
                const category = document.getElementsByName('categoryRadio');
                let selectedCategory = '';
                for (let radio of category) {
                    if (radio.checked) selectedCategory = radio.value;
                }
                callTornAPIv2({ apiKey: apiKey, part: 'faction', selections: 'basic,crimes,members', from: firstDay, to: lastDay, category: selectedCategory });
                break;

            case 'missing_items':
                let availableCategory = 'available';

                callTornAPIv2({ apiKey: apiKey, part: 'faction', selections: 'basic,crimes,members', from: firstDay, to: lastDay, category: availableCategory });
                break;

            case 'members':
                const factionId = document.getElementById('factionid').value.trim() || '';
                callTornAPIv2({ apiKey: apiKey, part: `faction/${factionId}`, selections: 'basic,members,wars' });
                break;
        }
    });
});
