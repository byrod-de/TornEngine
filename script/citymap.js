document.addEventListener('DOMContentLoaded', function () {

    var territoriesData = getTerritories();
    const svg = document.getElementById('mapSVG');
    const tooltip = document.createElement('div');
    tooltip.classList.add('tooltip');
    document.body.appendChild(tooltip);

    const territoryForm = document.getElementById('userForm');
    territoryForm.addEventListener('submit', handleFormSubmit);

    function handleFormSubmit(event) {
        console.log('TEST');
        event.preventDefault();
        const apiKey = getApiKey();
        fetchTerritoryData(apiKey);
    }

    async function fetchTerritoryData(apiKey) {
        try {
            const response = await fetch(`https://api.torn.com/torn/?selections=territorywars&key=${apiKey}&comment=TornEngine`);
            const data = await response.json();
            const territoryWars = data.territorywars;
            highlightTerritories(territoryWars);
        } catch (error) {
            console.error('Error fetching territory data:', error);
        }
    }

    function highlightTerritories(territoryWars) {
        const color = '#d9534f'; // Red

        for (const territoryId in territoryWars) {
            const group = document.getElementById(territoryId);

            if (group) {
                group.classList.add('highlighted');
                group.querySelector('circle').setAttribute('fill', color);
            }
        }
    }


    for (const territoryId in territoriesData.territory) {
        const territory = territoriesData.territory[territoryId];
        const x = parseFloat(territory.coordinate_x) / 5;
        const y = parseFloat(territory.coordinate_y) / 5;
        const sector = territory.sector;
        const size = territory.size;
        const color = getColorForSize(sector);

        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.id = territoryId;
        svg.appendChild(group);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', size * 1.2);
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



    // Highlighted change: Function to highlight the neighboring territories
    function highlightNeighbors(neighbors) {
        for (const neighborId of neighbors) {
            const neighborTerritory = territoriesData.territory[neighborId];
            const neighborGroup = document.getElementById(neighborId);
            neighborGroup.classList.add('highlighted');
            // Optionally, you can change the neighbor's color on mouseover
            neighborGroup.querySelector('circle').setAttribute('fill', '#E20074');
        }
    }

    // Highlighted change: Function to remove highlight from neighboring territories
    function unhighlightNeighbors(neighbors) {
        for (const neighborId of neighbors) {
            const neighborTerritory = territoriesData.territory[neighborId];
            const neighborGroup = document.getElementById(neighborId);
            neighborGroup.classList.remove('highlighted');
            // Optionally, you can revert the neighbor's color on mouseout
            neighborGroup.querySelector('circle').setAttribute('fill', getColorForSize(neighborTerritory.sector));
        }
    }

    // Highlighted change: Add event listener to handle search input changes
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
        const searchText = searchInput.value.trim().toLowerCase();
        filterTerritories(searchText);
    });

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

    function getColorForSize(size) {
        // Define the color palette
        const colorPalette = [
            '#df691a', // Light yellow
            '#2b3e50', // Light blue 
            '#5cb85c', // Light pink
            '#5bc0de', // Light green
            '#f0ad4e', // Light purple
            '#6f42c1', // Light red
            '#abb6c2', // Light orange
        ];
        // Clamp the size to be within the color palette range
        const clampedSize = Math.min(Math.max(1, size), colorPalette.length);

        // Return the color based on the size
        return colorPalette[clampedSize - 1];
    }

    $('[data-toggle="tooltip"]').tooltip();

});
