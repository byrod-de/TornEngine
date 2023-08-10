document.addEventListener('DOMContentLoaded', function () {
    let territoriesData = getTerritories(); // Declare territoriesData at a higher scope
    let territoryWars = null; // Declare territoryWars at a higher scope
    let rackets = null; // Declare rackets at a higher scope

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

    drawMap();
    drawLegend();

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
            const response = await fetch(`https://api.torn.com/torn/?selections=territorywars,rackets&key=${apiKey}&comment=TornEngine`);
            const data = await response.json();
            territoryWars = data.territorywars;
            rackets = data.rackets;

            printAlert('Success', 'The API Call successful, find the results below the map.');

            //territoriesData = getTerritories();
            const cardsData = createCardsData(territoryWars, territoriesData); // Pass both territoryWars and territoriesData
            addCardsWithData(cardsData);
            highlightTerritories(territoryWars, rackets);
        } catch (error) {
            console.error('Error fetching territory data:', error);
            printAlert('Error', error);

        }
    }

    function highlightTerritories(territoryWars, rackets) {
        for (const territoryId in territoryWars) {
            const group = document.getElementById(territoryId);

            if (group) {
                group.classList.add('war-highlighted');
            }
        }

        for (const territoryId in rackets) {
            const group = document.getElementById(territoryId);

            if (group) {
                group.classList.add('racket-highlighted');
            }
        }
    }

    function drawLegend() {
        const legendData = [
            { name: "Sector 1", color: getColorForCircle(1) },
            { name: "Sector 2", color: getColorForCircle(2) },
            { name: "Sector 3", color: getColorForCircle(3) },
            { name: "Sector 4", color: getColorForCircle(4) },
            { name: "Sector 5", color: getColorForCircle(5) },
            { name: "Sector 6", color: getColorForCircle(6) },
            { name: "Sector 7", color: getColorForCircle(7) },
            { name: "Neighbour", color: getComputedStyle(document.documentElement).getPropertyValue('--neighbor-color').trim() },
            { name: "War", color: getComputedStyle(document.documentElement).getPropertyValue('--war-color').trim() },
            { name: "Racket", color: getComputedStyle(document.documentElement).getPropertyValue('--racket-color').trim() },
        ];
    
        const legendContainer = document.getElementById('legend');
    
        for (const entry of legendData) {
            const circle = document.createElement('span');
            circle.style.backgroundColor = entry.color;
            circle.style.width = '10px';
            circle.style.height = '10px';
            circle.style.borderRadius = '50%';
            circle.style.display = 'inline-block';
            circle.style.marginRight = '5px';
    
            const label = document.createElement('span');
            label.textContent = `${entry.name}`;
    
            const legendEntry = document.createElement('div');
            const smallText = document.createElement('small');
            smallText.textContent = label.textContent;

            legendEntry.appendChild(circle);
            legendEntry.appendChild(smallText);
            legendContainer.appendChild(legendEntry);
        }
    }

    function drawMap() {
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }

        const backgroundImage = document.createElementNS('http://www.w3.org/2000/svg', 'image');

        // Set the attributes for the image element
        backgroundImage.setAttribute('href', 'images/map.png');
        backgroundImage.setAttribute('width', '100%');
        backgroundImage.setAttribute('height', '100%');
        backgroundImage.setAttribute('class', 'map');

        // Append the image element to the SVG
        svg.appendChild(backgroundImage);

        for (const territoryId in territoriesData.territory) {
            const territory = territoriesData.territory[territoryId];
            const x = parseFloat(territory.coordinate_x) / 5;
            const y = parseFloat(territory.coordinate_y) / 5;
            const sector = territory.sector;
            const size = territory.size;
            const color = getColorForCircle(sector);

            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.id = territoryId;
            svg.appendChild(group);

            // Apply the highlighted classes to the group element
            if (group.classList.contains('war-highlighted')) {
                group.classList.add('war-highlighted');
            }

            if (group.classList.contains('racket-highlighted')) {
                group.classList.add('racket-highlighted');
            }

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', size * 1.2);

            // Apply the highlighted class to the circle element
            if (group.classList.contains('war-highlighted')) {
                circle.classList.add('war-highlighted');
            }
            if (group.classList.contains('racket-highlighted')) {
                circle.classList.add('racket-highlighted');
            }


            circle.setAttribute('fill', color);
            circle.setAttribute('data-toggle', 'tooltip');
            circle.setAttribute('data-html', 'true');
            group.appendChild(circle);

            group.addEventListener('mouseover', (event) => {
                const mouseX = event.clientX;
                const mouseY = event.clientY;
                const territoryData = territoryWars && territoryWars[territoryId] ? territoryWars[territoryId] : null;
                const racketData = rackets && rackets[territoryId] ? rackets[territoryId] : null;

                showTooltip(territoryId, territory, territoryData, racketData, mouseX, mouseY);
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




    function showTooltip(territoryId, territory, territoryData, racketData, mouseX, mouseY) {
        const tooltip = document.querySelector('.tooltip');
        let tooltipContent = `<strong>Name: ${territoryId}</strong><br>
                              Sector: ${territory.sector}<br>
                              Slots: ${territory.slots}<br>
                              Neighbors: ${territory.neighbors.join(', ')}<br>`;


        if (territoryData) {
            let score = territoryData.score;
            let score_required = territoryData.score_required;
            let slots = territory.slots;
            let best = (score_required - score) / slots * 1000;

            tooltipContent += `<strong class="text-danger">Attacking Faction: ${getFactions(territoryData.assaulting_faction)}</strong><br>
                                <strong class="text-success">Defending Faction: ${getFactions(territoryData.defending_faction)}</strong><br>
                                Score: ${score}/${score_required}<br>
                                Start: ${formatDate(territoryData.started)}<br>
                                End: ${formatRelativeTime(territoryData.ends)}<br>
                                Best Case: ${formatBestWallTime(best)}<br>`;
        }

        if (racketData) {
            tooltipContent += `Racket: ${racketData.name}<br>
                                                   Reward: ${racketData.reward}</strong><br>
                                                   Faction: ${getFactions(racketData.faction)}<br>`;
        }

        if (!racketData && !territoryData) {
            tooltipContent += '<i class="text-light">Additional data not available for this territory.</i><br>';
        }

        tooltip.innerHTML = tooltipContent;
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

            // Check if the territoryId contains the search text
            if (territoryId.toLowerCase().includes(searchText)) {
                // Show the group if it matches the search
                //group.style.display = 'inline';
                group.style.opacity = '1';

            } else {
                // Hide the group if it doesn't match the search
                //group.style.display = 'none';
                group.style.opacity = '0.2';
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

        while (cardsContainer.firstChild) {
            cardsContainer.removeChild(cardsContainer.firstChild);
        }

        for (const data of cardsData) {
            const card = createCardElement(data);
            card.dataset.territoryId = data.territoryId; // Add territoryId as a dataset attribute
            card.dataset.assaultingFactionId = data.assaultingFaction; // Add assaulting faction as a dataset attribute
            card.dataset.defendingFactionId = data.defendingFaction; // Add defending faction as a dataset attribute
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

            const score_required = territoryWars[territoryId].score_required;
            const score = territoryWars[territoryId].score;
            const slots = territoriesData.territory[territoryId].slots;
            const percentage = score / score_required * 100;

            const startedTimestamp = territoryWars[territoryId].started;
            const endsTimestamp = territoryWars[territoryId].ends;

            let best = (score_required - score) / slots * 1000;

            const text = `
                        Sector: ${territory.sector}<br />
                        Slots: ${territory.slots}<br />
                        <strong class="text-danger">Attacking Faction: <a target="_blank" href="${assaultingFactionLink}">${getFactions(assaultingFactionId)}</a></strong><br/>
                        <strong class="text-success">Defending Faction: <a target="_blank" href="${defendingFactionLink}">${getFactions(defendingFactionId)}</a></strong><br/>
                        Score: ${score}/${score_required}<br />
                        <div class="progress">
                           <div class="progress-bar bg-success" role="progressbar" style="width: ${percentage}%;" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
                           <div class="progress-bar bg-light progress-bar-striped" role="progressbar" style="width: ${100-percentage}%;" aria-valuenow="${100-percentage}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        Start: ${formatDate(startedTimestamp)}<br />
                        End: ${formatRelativeTime(endsTimestamp)}<br />
                        Best Case: ${formatBestWallTime(best)}<br />
                        Neighbors: ${territory.neighbors.join(', ')}<br />
`;

            const data = {
                territoryId: territoryId,
                assaultingFaction: `${getFactions(assaultingFactionId)} - ${assaultingFactionId}`,
                defendingFaction: `${getFactions(defendingFactionId)} - ${defendingFactionId}`,
                header: `${getFactions(assaultingFactionId)} is assaulting ${getFactions(defendingFactionId)} on ${territoryId}`,
                title: `Name: <a target="_blank" href="https://www.torn.com/city.php#terrName=${territoryId}">${territoryId}</a>`, // Update the title to include the territoryId
                text: text,
                color: 'primary' // You can change this color as needed
            };
            cardsData.push(data);
        }

        cardsData.sort((a, b) => {
            const endsTimestampA = territoryWars[a.territoryId].ends;
            const endsTimestampB = territoryWars[b.territoryId].ends;
            return endsTimestampA - endsTimestampB;
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

    function formatBestWallTime(bestWallTime) {
        const days = Math.floor(bestWallTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((bestWallTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((bestWallTime % (1000 * 60 * 60)) / (1000 * 60));

        return (days > 0) ? `in ${days} days ${hours}h and ${minutes}min` : `${hours}h and ${minutes}min`;
    }

    function createCardElement(data) {
        const { territoryId, header, title, text, color } = data;
        const card = document.createElement('div');
        card.classList.add('card', `border-${color}`, 'mb-4');
        card.style.maxWidth = '20rem';

        const cardHeader = document.createElement('div');
        cardHeader.classList.add('card-header');
        cardHeader.textContent = header;
        card.appendChild(cardHeader);

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');
        card.appendChild(cardBody);

        const cardTitle = document.createElement('strong');
        cardTitle.classList.add('card-title');
        cardTitle.innerHTML = title;
        cardBody.appendChild(cardTitle);

        const cardText = document.createElement('p');
        cardText.classList.add('card-text');
        cardText.innerHTML = text;
        cardBody.appendChild(cardText);

        return card;
    }

    $('[data-toggle="tooltip"]').tooltip();

});
