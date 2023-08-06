document.addEventListener('DOMContentLoaded', function () {
    let territoriesData = getTerritories(); // Declare territoriesData at a higher scope

    const svg = document.getElementById('mapSVG');
    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    document.body.appendChild(tooltip);

    const territoryForm = document.getElementById('userForm');
    territoryForm.addEventListener('submit', handleFormSubmit);

    const territoryNameInput = document.getElementById('territoryNameInput');
    territoryNameInput.addEventListener('input', handleFilterChange);

    const factionInput = document.getElementById('factionInput');
    factionInput.addEventListener('input', handleFilterChange);

    function resetFilters() {
        territoryNameInput.value = '';
        factionInput.value = '';
        showAllCards();
        filterTerritories('');
    }

    // Add a new event listener to reset filters when inputs are cleared
    territoryNameInput.addEventListener('change', function () {
        if (territoryNameInput.value === '') {
            resetFilters();
        }
    });

    factionInput.addEventListener('change', function () {
        if (factionInput.value === '') {
            resetFilters();
        }
    });

    const colorSwitch = document.getElementById('colorSwitch');
    colorSwitch.addEventListener('change', () => {
        drawMap(); // Redraw the map when the switch is clicked
    });

    drawMap();

    function handleFormSubmit(event) {
        event.preventDefault();
        const trustedApiKey = getApiKey();

        if (trustedApiKey === '') {
            printAlert('Warning', 'You might want to enter your API key if you expect this to work...');
        } else {
            fetchTerritoryData(trustedApiKey);
        }
    }

    async function fetchTerritoryData(apiKey) {
        try {
            const response = await fetch(`https://api.torn.com/torn/?selections=territorywars&key=${apiKey}&comment=TornEngine`);
            const data = await response.json();
            const territoryWars = data.territorywars;

            printAlert('Success', 'The API Call successful, find the results below the map.');

            //territoriesData = getTerritories();
            const cardsData = createCardsData(territoryWars, territoriesData); // Pass both territoryWars and territoriesData
            addCardsWithData(cardsData);
            highlightTerritories(territoryWars);
        } catch (error) {
            console.error('Error fetching territory data:', error);
            printAlert('Error', error);

        }
    }

    function highlightTerritories(territoryWars) {
        for (const territoryId in territoryWars) {
            const group = document.getElementById(territoryId);

            if (group) {
                group.classList.add('highlighted');
            }
        }
    }

    function getColorParam(territory) {
        // Read the switch status
        const useSize = colorSwitch.checked;

        // Decide whether to use "size" or "sector" based on the switch status
        return useSize ? territory.sector : territory.size;
    }

    function drawMap() {
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }

        //territoriesData = getTerritories();

        for (const territoryId in territoriesData.territory) {
            const territory = territoriesData.territory[territoryId];
            const x = parseFloat(territory.coordinate_x) / 5;
            const y = parseFloat(territory.coordinate_y) / 5;
            const sector = territory.sector;
            const size = territory.size;
            const colorParam = getColorParam(territory);
            const color = getColorForCircle(colorParam);

            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.id = territoryId;
            svg.appendChild(group);

            // Apply the highlighted class to the group element
            if (group.classList.contains('highlighted')) {
                group.classList.add('highlighted');
            }

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', size * 1.2);

            // Apply the highlighted class to the circle element
            if (group.classList.contains('highlighted')) {
                circle.classList.add('highlighted');
            }

            circle.setAttribute('fill', color);
            circle.setAttribute('data-toggle', 'tooltip');
            circle.setAttribute('data-html', 'true');
            group.appendChild(circle);

            group.addEventListener('mouseover', (event) => {
                const mouseX = event.clientX;
                const mouseY = event.clientY;
                showTooltip(territoryId, territory, mouseX, mouseY);
                highlightNeighbors(territory.neighbors);
            });

            group.addEventListener('mouseout', () => {
                hideTooltip();
                unhighlightNeighbors(territory.neighbors);
            });
        }
    }

    function handleFilterChange() {
        const territoryNameFilter = territoryNameInput.value.trim().toLowerCase();
        const factionFilter = factionInput.value.trim().toLowerCase();

        // Filter the cards based on territory name and faction
        filterCards(territoryNameFilter, factionFilter);
        filterTerritories(territoryNameFilter);
    }


    territoryNameInput.addEventListener('input', handleFilterChange);
    factionInput.addEventListener('input', handleFilterChange);

    // Add change event listeners to re-trigger the filter when input fields lose focus after being emptied
    territoryNameInput.addEventListener('change', handleFilterChange);
    factionInput.addEventListener('change', handleFilterChange);



    function showAllCards() {
        const cardsContainer = document.getElementById('cardsContainer');
        const cards = cardsContainer.getElementsByClassName('card');

        for (const card of cards) {
            card.style.display = 'block';
        }
    }

    function filterCards(territoryNameFilter, factionFilter) {
        const cardsContainer = document.getElementById('cardsContainer');
        const cards = cardsContainer.getElementsByClassName('card');

        for (const card of cards) {
            const territoryId = card.dataset.territoryId.toLowerCase();
            const assaultingFactionId = card.dataset.assaultingFactionId.toString().toLowerCase();
            const defendingFactionId = card.dataset.defendingFactionId.toString().toLowerCase();

            const isMatchingTerritory = territoryId.includes(territoryNameFilter);
            const isMatchingFaction =
                assaultingFactionId.includes(factionFilter) || defendingFactionId.includes(factionFilter);

            if (isMatchingTerritory && isMatchingFaction) {
                // Show the card if it matches both filters
                card.parentElement.classList.remove('hidden');
            } else {
                // Hide the card if it doesn't match both filters
                card.parentElement.classList.add('hidden');
            }
        }
    }




    function showTooltip(territoryId, territory, mouseX, mouseY) {
        const tooltip = document.querySelector('.tooltip');
        tooltip.innerHTML = `
            <strong>Name: ${territoryId}</strong><br>
            Sector: ${territory.sector}<br>
            Slots: ${territory.slots}<br>
            Neighbors: ${territory.neighbors.join(', ')}
        `;
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;
        tooltip.style.left = `${mouseX + scrollX + 10}px`;
        tooltip.style.top = `${mouseY + scrollY + 10}px`;
    }

    function hideTooltip() {
        const tooltip = document.querySelector('.tooltip');
        tooltip.style.opacity = '0';
    }

    function highlightNeighbors(neighbors) {
        for (const neighborId of neighbors) {
            const neighborGroup = document.getElementById(neighborId);
            neighborGroup.classList.add('neighbor-highlighted');
        }
    }

    function unhighlightNeighbors(neighbors) {
        for (const neighborId of neighbors) {
            const neighborGroup = document.getElementById(neighborId);
            neighborGroup.classList.remove('neighbor-highlighted');
        }
    }

    // Function to filter and display the territories based on the search input
    function filterTerritories(searchText) {
        for (const territoryId in territoriesData.territory) {
            const group = document.getElementById(territoryId); // Get the group for the territory
            const territory = territoriesData.territory[territoryId];

            // Check if the territoryId contains the search text
            if (territoryId.toLowerCase().includes(searchText)) {
                // Show the group if it matches the search
                group.style.display = 'inline';
            } else {
                // Hide the group if it doesn't match the search
                group.style.display = 'none';
            }
        }
    }

    function getColorForCircle(param) {
        const colorPalette = getComputedStyle(document.documentElement).getPropertyValue('--color-palette').split(',').map(color => color.trim());
        const clampedSize = Math.min(Math.max(1, param), colorPalette.length);
        return colorPalette[clampedSize - 1];
    }

    function addCardsWithData(cardsData) {
        const cardsContainer = document.getElementById('cardsContainer');

        for (const data of cardsData) {
            const card = createCardElement(data);
            card.dataset.territoryId = data.territoryId; // Add territoryId as a dataset attribute
            card.dataset.assaultingFactionId = data.assaultingFactionId; // Add assaulting faction as a dataset attribute
            card.dataset.defendingFactionId = data.defendingFactionId; // Add defending faction as a dataset attribute
            const col = document.createElement('div');
            col.classList.add('col-md-3', 'mb-3');
            col.appendChild(card);
            cardsContainer.appendChild(col);
        }
    }

    function createCardsData(territoryWars, territoriesData) {
        const cardsData = [];

        for (const territoryId in territoryWars) {
            const territory = territoriesData.territory[territoryId];
            const assaultingFactionId = territoryWars[territoryId].assaulting_faction;
            const defendingFactionId = territoryWars[territoryId].defending_faction;
            const assaultingFactionLink = `https://www.torn.com/factions.php?step=profile&ID=${assaultingFactionId}`;
            const defendingFactionLink = `https://www.torn.com/factions.php?step=profile&ID=${defendingFactionId}`;

            const startedTimestamp = territoryWars[territoryId].started;
            const endsTimestamp = territoryWars[territoryId].ends;

            const text = `
                        Sector: ${territory.sector}<br />
                        Slots: ${territory.slots}<br />
                        Attacking Faction: <a target="_blank" href="${assaultingFactionLink}">${territoryWars[territoryId].assaulting_faction}</a><br/>
                        Defending Faction: <a target="_blank" href="${defendingFactionLink}">${territoryWars[territoryId].defending_faction}</a><br/>
                        Started: ${formatDate(startedTimestamp)}<br />
                        Ends: ${formatRelativeTime(endsTimestamp)}<br />
                        Neighbors: ${territory.neighbors.join(', ')}<br />
`;

            const data = {
                territoryId: territoryId,
                assaultingFactionId: assaultingFactionId,
                defendingFactionId: defendingFactionId,
                header: `${assaultingFactionId} is assaulting ${defendingFactionId} on ${territoryId}`,
                title: `${territoryId}`, // Update the title to include the territoryId
                text: text,
                color: 'primary' // You can change this color as needed
            };
            cardsData.push(data);
        }

        cardsData.sort((a, b) => {
            const factionA = territoryWars[a.territoryId].assaulting_faction;
            const factionB = territoryWars[b.territoryId].assaulting_faction;
            return factionA - factionB;
        });

        return cardsData;
    }

    function formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        const hours = ('0' + date.getHours()).slice(-2);
        const minutes = ('0' + date.getMinutes()).slice(-2);
        const seconds = ('0' + date.getSeconds()).slice(-2);
        return `${year}-${day}-${month} ${hours}:${minutes}:${seconds}`;
    }

    function formatRelativeTime(timestamp) {
        const currentDate = new Date();
        const endDate = new Date(timestamp * 1000);

        const timeDiff = endDate.getTime() - currentDate.getTime();
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

        return (days > 0) ? `in ${days} days ${hours}h and ${minutes}min` : `${hours}h and ${minutes}min`;
    }

    function createCardElement(data) {
        const { territoryId, header, title, text, color } = data;
        const card = document.createElement('div');
        card.classList.add('card', `border-${color}`, 'mb-3');
        card.style.maxWidth = '20rem';

        const cardHeader = document.createElement('div');
        cardHeader.classList.add('card-header');
        cardHeader.textContent = header;
        card.appendChild(cardHeader);

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');
        card.appendChild(cardBody);

        const cardTitle = document.createElement('h4');
        cardTitle.classList.add('card-title');
        cardTitle.textContent = title;
        cardBody.appendChild(cardTitle);

        const cardText = document.createElement('p');
        cardText.classList.add('card-text');
        cardText.innerHTML = text;
        cardBody.appendChild(cardText);

        return card;
    }

    $('[data-toggle="tooltip"]').tooltip();

});
