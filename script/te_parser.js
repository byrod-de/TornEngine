/**
 * Parses property information and updates the specified HTML element with a summary.
 *
 * @param {Object} data - The data containing property information of a player.
 * @param {string} selection - The key to access specific property data within the data object.
 * @param {string} elementId - The ID of the HTML element where the summary will be inserted.
 *
 * This function counts the number of trailers owned by a player and their spouse,
 * then generates an HTML snippet summarizing these counts and inserts it into the
 * specified HTML element. The summary includes a link to the player's profile.
 */

function parsePropertyInfo(data, selection, elementId) {
    let countOwn = 0;
    let countSpouse = 0;
  
    const name = data['name'];
    const player_id = data['player_id'];
    const properties = data[selection];
  
    for (const key in properties) {
      const property = properties[key].property;
      const status = properties[key].status;
      if (property === 'Trailer') {
        if (status === 'Owned by them') {
          countOwn++;
        }
        if (status === 'Owned by their spouse') {
          countSpouse++;
        }
      }
    }
  
    const html = `
      <div class="alert alert-secondary">
        <a class="alert-link" href="https://www.torn.com/profiles.php?XID=${player_id}" target="_blank">${name} [${player_id}]</a>:<br />
        There are <span class="badge badge-primary">${countOwn}</span> trailer(s) owned by them and
        <span class="badge badge-light">${countSpouse}</span> trailer(s) owned by their spouse.
      </div>
    `;
  
    document.getElementById(elementId).innerHTML = html;
  }
  

/**
 * Parses ranked war data and updates the specified HTML element with a table of war details.
 *
 * @param {Object} rankedWarData - The data containing ranked war information.
 * @param {string} selection - The selection criteria for filtering the ranked war data.
 * @param {string} element - The ID of the HTML element where the table will be inserted.
 * @param {Object} rankedWars - An object containing details of multiple ranked wars.
 *
 * This function generates an HTML table displaying details of ranked wars, including
 * start time, status, target, lead, factions involved, scores, and additional details.
 * The table is inserted into the specified HTML element and formatted for display.
 */

  function parseRankedWars(rankedWarData, element) {
 
    var trustedApiKey = document.getElementById("trustedkey").value;
  
    var warStatusList = '';
  
    var markedCheckbox = document.getElementsByName('warStatus');
    for (var checkbox of markedCheckbox) {
      if (checkbox.checked)
        warStatusList = warStatusList + checkbox.value + ',';
    }
  
  
  
    var table = '<div class="col-sm-12 badge-primary" ><b> Ranked War Details </b></div>';
    table = table + '<br /><table class="table table-hover text-center" id="wars"><thead><tr>'
      + '<th class="align-middle">Start Time</th>'
      // + '<th>Duration</th>'
      + '<th class="align-middle">Status<br />Progress</th>'
      + '<th class="align-middle">Target</th>'
      // + '<th>Progress</th>'
      + '<th class="align-middle">Lead</th>'
      + '<th class="align-middle">Faction 1<br />(Member Status)</th>'
      + '<th class="align-middle">Score #1</th>'
      + '<th class="align-middle">Score #2</th>'
      + '<th class="align-middle">Faction 2<br />(Member Status)</th>'
      + '<th class="align-middle">Details</th>'
  
      ;
  
    table = table + '</tr></thead><tbody>';

    const rankedWars = rankedWarData.rankedwars;
  
    for (var id in rankedWars) {
  
      var rankedWar = rankedWars[id];
      var ts = new Date(rankedWar.war.start * 1000);
      var formatted_date = ts.toISOString().replace('T', ' ').replace('.000Z', '');
      var faction1Name = '', faction2Name = '';
      var faction1ID = '', faction2ID = '';
      var faction1Score = '', faction2Score = '';
      var faction1StyleClass = '', faction2StyleClass = '';
      var counter = 0;
      var warStatus = '', warStatusStyleClass = '', duration = 0, durationString = '', progressBarStyleClass, detailsButton = '';
      var currentTimeStamp = Math.floor(Date.now() / 1000);
  
      if (rankedWar.war.end == 0) {
        if (currentTimeStamp < rankedWar.war.start) {
          warStatusStyleClass = '<span class="badge badge-pill badge-info">Scheduled</span>';
          warStatus = 'scheduled';
          progressBarStyleClass = 'class="progress-bar progress-bar-striped progress-bar-animated bg-info"';
        } else {
          warStatusStyleClass = '<span class="badge badge-pill badge-primary">Ongoing</span>';
          warStatus = 'ongoing';
          progressBarStyleClass = 'class="progress-bar progress-bar-striped progress-bar-animated bg-primary"';
          duration = currentTimeStamp - rankedWar.war.start;
        }
      } else {
        warStatusStyleClass = '<span class="badge badge-pill badge-success">Ended</span>';
        warStatus = 'ended';
        progressBarStyleClass = 'class="progress-bar bg-success"';
        detailsButton = '<button type="button" onclick="callRankedWarDetails(\'' + trustedApiKey + '\', ' + id + ')" class="btn btn-secondary" data-toggle="modal" data-target="#rankedWarModal">Show Details</button>';
        duration = rankedWar.war.end - rankedWar.war.start;
      }
  
      dateObj = new Date(duration * 1000);
  
      hours = dateObj.getUTCHours();
      minutes = dateObj.getUTCMinutes();
      seconds = dateObj.getSeconds();
  
      durationString = hours.toString().padStart(2, '0') + ':' +
        minutes.toString().padStart(2, '0') + ':' +
        seconds.toString().padStart(2, '0');
  
      if (warStatusList.includes(warStatus)) {
  
        for (var factionID in rankedWar.factions) {
  
          var faction = rankedWar.factions[factionID];
  
          if (counter == 0) {
            faction1Name = faction.name;
            faction1Score = faction.score;
            faction1ID = factionID;
            counter = 1;
          } else {
            faction2Name = faction.name;
            faction2Score = faction.score;
            faction2ID = factionID;
          }
        }
  
  
        if ((faction1ID === rankedWar.war.winner) || (faction1Score > faction2Score)) {
          faction1StyleClass = ' class="text-success"';
          faction2StyleClass = ' class="text-danger"';
        }
        if ((faction2ID === rankedWar.war.winner) || (faction1Score < faction2Score)) {
          faction1StyleClass = ' class="text-danger"';
          faction2StyleClass = ' class="text-success"';
        }
  
        var percentage = Math.abs(faction1Score - faction2Score) / rankedWar.war.target * 100;
  
        table = table + '<tr>'
          + '<td class="align-middle">' + formatted_date + '</td>'
          + '<td class="align-middle">' + warStatusStyleClass + ''
          + '<br /><div class="progress"><div ' + progressBarStyleClass + ' role="progressbar" aria-valuenow="' + percentage + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + percentage + '%;"></div></div></td>'
  
          + '<td class="align-middle">' + rankedWar.war.target + '</td>'
          + '<td class="align-middle">' + Math.abs(faction1Score - faction2Score) + '</td>'
          + '<td class="align-middle"><a href="https://www.torn.com/factions.php?step=profile&ID=' + faction1ID + '" target="_blank" ' + faction1StyleClass + '>' + faction1Name + '</a>'
          + '<br /><a href="members.html?factionID=' + faction1ID + '"><button type="button" class="btn btn-secondary btn-sm">Show Members</button></a></td>'
          + '<td class="align-middle">' + faction1Score + '</td>'
          + '<td class="align-middle">' + faction2Score + '</td>'
          + '<td class="align-middle"><a href="https://www.torn.com/factions.php?step=profile&ID=' + faction2ID + '" target="_blank" ' + faction2StyleClass + '>' + faction2Name + '</a>'
          + '<br /><a href="members.html?factionID=' + faction2ID + '"><button type="button" class="btn btn-secondary btn-sm">Show Members</button></a></td>'
          + '<td class="align-middle">' + detailsButton + '</td>'
  
          ;
  
        table = table + '</tr>';
  
      }
    }
    table = table + '</tbody></table>';
  
    $(document).ready(function () {
      $('#wars').DataTable({
        "paging": false,
        "order": [[0, "desc"]],
        "info": false,
        "stateSave": true
      });
    });
  
    document.getElementById(element).innerHTML = table;
  
  
  
  }

  function parseRankedWarDetails(details, elementId) {
    const output = document.getElementById(elementId);
    if (!output || !details.factions) return;
  
    const [f1ID, f1Data] = Object.entries(details.factions)[0];
    const [f2ID, f2Data] = Object.entries(details.factions)[1];
  
    const f1Score = f1Data.score ?? 0;
    const f2Score = f2Data.score ?? 0;
  
    const f1Class = f1Score >= f2Score ? 'text-success' : 'text-danger';
    const f2Class = f2Score >= f1Score ? 'text-success' : 'text-danger';
  
    let html = `
      <table class="table table-hover text-center" id="warfactions">
        <thead>
          <tr>
            <th colspan="2"><a href="https://www.torn.com/factions.php?step=profile&ID=${f1ID}" target="_blank" class="${f1Class}">${f1Data.name}</a></th>
            <th>${f1Score}</th>
            <th>${f2Score}</th>
            <th colspan="2"><a href="https://www.torn.com/factions.php?step=profile&ID=${f2ID}" target="_blank" class="${f2Class}">${f2Data.name}</a></th>
          </tr>
        </thead>
      </table>
      <br />
      <table class="table table-hover text-center" id="wardetails">
        <thead>
          <tr>
            <th>Name</th>
            <th>Faction</th>
            <th>Hits</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
    `;
  
    for (const [factionID, faction] of Object.entries(details.factions)) {
      const factionName = faction.name;
      const factionClass = factionID === f1ID ? f1Class : f2Class;
      const members = faction.members ?? {};
  
      for (const [playerID, member] of Object.entries(members)) {
        html += `
          <tr>
            <td><a href="https://www.torn.com/profiles.php?XID=${playerID}" target="_blank">${member.name} [${playerID}]</a></td>
            <td><a href="https://www.torn.com/factions.php?step=profile&ID=${factionID}" target="_blank" class="${factionClass}">${factionName}</a></td>
            <td>${member.attacks}</td>
            <td>${member.score}</td>
          </tr>
        `;
      }
    }
  
    html += `
        </tbody>
      </table>
    `;
  
    output.innerHTML = html;
  
    $(document).ready(() => {
      $('#wardetails').DataTable({
        paging: false,
        order: [[3, 'desc']],
        info: false,
        stateSave: true
      });
    });
  
    document.getElementById('rankedWarModalLabel').textContent = 'War Details';
  }
  
  /**
   * Parses the crime experience data and generates a table summarizing the member list by crime experience.
   *
   * @param {array} crimeexp - The array of crime experience IDs from the API.
   * @param {string} element - The ID of the HTML element where the table will be inserted.
   * @param {Object} membersList - An object containing the member information from the API.
   *
   * This function generates an HTML table displaying the member list sorted by crime experience rank.
   * The table includes the crime experience rank, member name, and PA team name (if applicable).
   * The table is inserted into the specified HTML element and formatted for display.
   */
  function parseCrimeexp(crimeexp, element, membersList) {

    var numberOfTeams = document.getElementById('numberOfTeams').innerHTML;
    var carriedTeams = document.getElementById('carriedTeams').innerHTML;
  
    function groupEntries(ids, numGroups, carriedTeam) {
      const groups = [];
      const numEntries = numGroups * 4;
    
      for (let i = 0; i < carriedTeam; i++) {
        const carriedGroup = [];
        carriedGroup.push(ids[0], ids[numEntries - 3 - i * 4], ids[numEntries - 2 - i * 4], ids[numEntries - 1 - i * 4]);
        groups.push(carriedGroup);
        ids = ids.slice(1);
      }
    
      for (let i = 0; i < numGroups - carriedTeam; i++) {
        const group = [];
        const start = i;
    
        group.push(ids[start]); // first element
        group.push(ids[(numGroups - carriedTeam) * 4 - 1 - i]); // last element
        group.push(ids[Math.floor(((numGroups - carriedTeam) * 4) / 2) - 1 - i]); // middle element (before)
        group.push(ids[Math.floor(((numGroups - carriedTeam) * 4) / 2) + i]); // middle element (after)
    
        groups.push(group);
      }
    
      return groups;
    }
  
    // Function to generate a color scale
    function getColorScale(numColors) {
      const colors = [];
      const colorScheme = [
        '#df691a', '#ff9900', '#ffcc00', '#ffff00',
        '#ccff00', '#99ff00', '#66ff00', '#33ff00',
        '#00ff33', '#00ff66', '#00ff99', '#00ffcc',
        '#00ffff', '#00ccff', '#0099ff', '#0066ff',
        '#0033ff', '#3300ff', '#6600ff', '#9900ff',
        '#cc00ff', '#ff00ff', '#ff00cc', '#ff0099',
        '#ff0066', '#ff0033'
      ];
    
      for (let i = 0; i < numColors; i++) {
        const color = colorScheme[i % colorScheme.length];
        colors.push(color);
      }
    
      return colors;
    }
  
    const groupedEntries = groupEntries(crimeexp, numberOfTeams, carriedTeams);	
  
  
    // Get the number of groups
    const numGroups = groupedEntries.length;
  
    // Generate the color scale
    const colorScale = getColorScale(numGroups);
  
    var table = `<div class="col-sm-12 badge-primary"><b>Member List by Crime Experience</b> <input type="button" class="btn btn-outline-light btn-sm" value="select table content" onclick="selectElementContents(document.getElementById('members'));"></div>`;
    table += '<br />';
    table += '<table class="table table-hover" id="members"><thead><tr>'
      + '<th>CE Rank</th>'
      + '<th>Member</th>'
      + '<th>PA Team</th>'
      + '</tr></thead><tbody>';
  
  
    for (let i = 0; i < crimeexp.length; i++) {
      const rank = i + 1;
      const member = membersList[crimeexp[i]].name;
      const groupIndex = groupedEntries.findIndex((group) => group.includes(crimeexp[i]));
  
      let paTeamName = '';
      if (groupIndex >= 0) {
        paTeamName = `PA Team ${groupIndex + 1}`;
      } else {
        paTeamName = '<span class="text-secondary">No PA Team</span>';
      }
      const color = colorScale[groupIndex];
  
      let entry = `<tr><td>${rank}</td><td><a href="https://www.torn.com/profiles.php?XID=${crimeexp[i]}" target="_blank">${member} [${crimeexp[i]}]</a></td><td style="color: ${color}">${paTeamName}</td></tr>`;
      table += entry;
    }
  
    table = table + '</tbody></table>';
  
    $(document).ready(function () {
      $('#members').DataTable({
        "paging": false,
        "order": [[0, "asc"]],
        "info": false,
        "stateSave": false
      });
    });
  
    document.getElementById(element).innerHTML = table;
  }