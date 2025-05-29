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

/**
 * Parses the details of a ranked war and renders a table of war details and a
 * table of member details into the specified HTML element.
 *
 * @param {Object} details - The data containing the ranked war details.
 * @param {string} elementId - The ID of the HTML element where the tables will
 *   be inserted.
 *
 * The first table displays the war details, including the faction names and
 * their respective scores. The second table displays the member details, including
 * the player name, faction name, number of attacks, and score.
 */
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

/**
 * Parses payout data from crimes and updates the specified HTML element with tables of payout details.
 *
 * @param {Object} crimeData - The data containing information about completed crimes.
 * @param {string} element - The ID of the HTML element where the tables will be inserted.
 * @param {Object} membersList - An object containing member information, used to map member IDs to names.
 *
 * This function generates HTML tables displaying details of political assassination crimes, 
 * including participants, crime type, results, money gained, and respect gained. It calculates 
 * total faction payouts and individual member results, formatted for display. The tables are 
 * inserted into the specified HTML element and summary section.
 */

function parsePayouts(crimeData, element, membersList) {

  var memberMoney = {};
  var memberSuccess = {};
  var memberFailed = {};
  var memberIds = {};
  var factionMoney = 0;
  var factionSuccess = 0;
  var factionFailed = 0;
  var totalRespect = 0;
  var totalMoney = 0;

  let badgeSuccess = 'badge-dark';
  let badgeFailed = 'badge-dark';

  const today = new Date();
  const currentMonth = today.getMonth();
  const PA_CRIME_ID = 8;

  var firstDayOfMonth, lastDayOfMonth;

  var selectedMonthValue = document.getElementById('monthSelect').value;
  var selectedMonthValue = document.getElementById('monthSelect').value;

  // Calculate the month offset based on selectedMonthValue
  var monthOffset = parseInt(selectedMonthValue);

  // Calculate timestamps using the offset
  var timestamps = calculateMonthTimestamps(today, currentMonth - monthOffset);
  var firstDayOfMonth = timestamps.firstDay;
  var lastDayOfMonth = timestamps.lastDay;

  var splitFactor = document.getElementById('range').value;
  var weightedPerRank = document.getElementById('weighted').checked;
  var paLeads = '';

  var selectElement = document.getElementById('monthSelect');
  var selectedOption = selectElement.options[selectElement.selectedIndex];
  var selectedMonthText = selectedOption.text;


  var table = `<div class="col-sm-12 badge-primary"><b>PA Details for ${selectedMonthText}</b> <input type="button" class="btn btn-outline-light btn-sm" value="select table content" onclick="selectElementContents(document.getElementById('totals'));"></div>`;
  table += '<br />';
  table += '<table class="table table-hover" id="totals"><thead><tr>'
    + '<th>Date</th>'
    + '<th>Participants</th>'
    + '<th>Crime Type</th>'
    + '<th>Result</th>'
    + '<th>Money Gained<br/>'
    + '<th>Respect Gained</th>'
    + '</tr></thead><tbody>';

  for (var id in crimeData) {
    var crime = crimeData[id];

    if (crime.crime_id === PA_CRIME_ID) {

      var ts = new Date(crime.time_completed * 1000);

      if (crime.initiated === 1 & crime.time_completed >= firstDayOfMonth && crime.time_completed <= lastDayOfMonth) {

        var crimeResult = '';
        var failed = 0;
        var success = 0;
        var participants = '';
        var countRank = 0;
        var prefix = '';

        if (crime.success === 0) {
          crimeResult = '<span class="badge badge-pill badge-danger">Failed</span>';
          failed = 1;
        } else {
          crimeResult = '<span class="badge badge-pill badge-success">Success</span>';
          success = 1;
        }

        crime.participants.forEach(obj => {
          Object.entries(obj).forEach(([key, value]) => {
            var memberID = `${key}`;
            countRank = countRank + 1;
            if (weightedPerRank) {
              prefix = countRank + '| ';
            }

            var memberName = '';
            if (membersList.hasOwnProperty(memberID)) {
              memberName = prefix + membersList[memberID].name;
              if (weightedPerRank && prefix === '1| ') {
                if (!paLeads.includes(memberName))
                  paLeads = memberName + ';' + paLeads;
              }
              if (memberName in memberMoney) {
                memberMoney[memberName] = memberMoney[memberName] + (crime.money_gain / splitFactor);
                memberSuccess[memberName] = memberSuccess[memberName] + success;
                memberFailed[memberName] = memberFailed[memberName] + failed;
                memberIds[memberName] = memberID;
              } else {
                memberMoney[memberName] = (crime.money_gain / splitFactor);
                memberSuccess[memberName] = success;
                memberFailed[memberName] = failed;
                memberIds[memberName] = memberID;
              }
            } else {
              memberName = memberID;

              if (memberName in memberMoney) {
                memberMoney[memberName] = memberMoney[memberName] + (crime.money_gain / splitFactor);
                memberSuccess[memberName] = memberSuccess[memberName] + success;
                memberFailed[memberName] = memberFailed[memberName] + failed;
              } else {
                memberMoney[memberName] = (crime.money_gain / splitFactor);
                memberSuccess[memberName] = success;
                memberFailed[memberName] = failed;
              }
            }

            if (participants === '') {
              let tmpName = memberName;
              if (!weightedPerRank) {
                tmpName = `<a href="https://www.torn.com/factions.php?step=your#/tab=controls&addMoneyTo=${memberID}&money=${memberMoney[memberName]}" target="_blank">${memberName} [${memberID}]</a>`;
              }
              participants = tmpName;
            } else {
              let tmpName = memberName;
              if (!weightedPerRank) {
                tmpName = `<a href="https://www.torn.com/factions.php?step=your#/tab=controls&addMoneyTo=${memberID}&money=${memberMoney[memberName]}" target="_blank">${memberName} [${memberID}]</a>`;
              }
              participants = participants + ', ' + tmpName;
            }
          });
        });

        if (weightedPerRank)
          factionMoney = factionMoney + (crime.money_gain)

        else {
          if (splitFactor == 5) { factionMoney = factionMoney + (crime.money_gain / splitFactor); }
          if (splitFactor == 4) { factionMoney = 0; }
        }

        factionSuccess = factionSuccess + success;
        factionFailed = factionFailed + failed;
        totalRespect = totalRespect + crime.respect_gain;
        totalMoney = totalMoney + crime.money_gain;

        var formatted_date = ts.toISOString().replace('T', ' ').replace('.000Z', '');

        table += '<tr>'
          + `<td>${formatted_date}</td>`
          + `<td>${participants}</td>`
          + `<td>${crime.crime_name}</td>`
          + `<td>${crimeResult}</td>`
          + `<td>$${crime.money_gain.toLocaleString('en-US')}</td>`
          + `<td>${crime.respect_gain}</td>`
          + `</tr>`;
      }
    }
  }

  if (factionFailed > 0) { badgeFailed = 'badge-danger'; }
  if (factionSuccess > 0) { badgeSuccess = 'badge-success'; }

  table += `</tbody><tfoot><tr class="table-dark">`
    + `<td>Totals</td>`
    + `<td></td>`
    + `<td></td>`
    + `<td>`
    + `<span class="badge badge-pill ${badgeFailed}">${factionFailed}</span>-`
    + `<span class="badge badge-pill ${badgeSuccess}">${factionSuccess}</span>`
    + `</td>`
    + `<td>$${totalMoney.toLocaleString('en-US')}</td>`
    + `<td>${totalRespect}</td>`
    + `</tr></tfoot>`;

  table = table + '</table>';
  document.getElementById(element).innerHTML = table;


  $(document).ready(function () {
    $('#totals').DataTable({
      "paging": false,
      "order": [[0, "asc"]],
      "info": false,
      "stateSave": true,
      "footer": true
    });
  });

  var multiplier = 0;
  var numberOfTeams = paLeads.split(';').length - 1;

  var summary = `<div class="col-sm-12 badge-primary" ><b>Individual results for ${selectedMonthText}</b> <input type="button" class="btn btn-outline-light btn-sm" value="select table content" onclick="selectElementContents( document.getElementById('individual') );"></div>`;
  summary += '<br />';
  summary += '<table class="table table-hover" id="individual"><thead><tr>'
    + '<th>Name</th>';

  if (weightedPerRank) {
    summary += '<th>Money earned (weighted per PA rank)</th>';
  } else {
    summary += `<th>Money earned (<sup>1</sup>/<sub>${splitFactor}</sub>th of result)</th>`;
  }

  summary += '<th>Fail</th>'
    + '<th>Success</th>'
    + '</tr></thead><tbody>';

  memberMoney = sortObj(memberMoney);

  for (var name in memberMoney) {
    if (memberFailed[name] > 0) { badgeFailed = 'badge-danger'; } else { badgeFailed = 'badge-dark'; }
    if (memberSuccess[name] > 0) { badgeSuccess = 'badge-success'; } else { badgeSuccess = 'badge-dark'; }

    if (name.startsWith('1|')) multiplier = 0.4 / numberOfTeams;
    if (name.startsWith('2|')) multiplier = 0.3 / numberOfTeams;
    if (name.startsWith('3|')) multiplier = 0.2 / numberOfTeams;
    if (name.startsWith('4|')) multiplier = 0.1 / numberOfTeams;

    summary = summary + '<tr>'
      + '<td>' + `<a href="https://www.torn.com/factions.php?step=your#/tab=controls&addMoneyTo=${memberIds[name]}&money=${memberMoney[name]}" target="_blank">${name}</a>` + '</td>';

    if (!weightedPerRank) {
      summary = summary + '<td>' + ' $' + memberMoney[name].toLocaleString('en-US') + '</td>';
    }
    else {
      summary = summary + '<td>' + ' $' + (factionMoney * multiplier).toLocaleString('en-US') + '</td>';
    }

    summary = summary + '<td><span class="badge badge-pill ' + badgeFailed + '">' + memberFailed[name] + '</span></td>'
      + '<td><span class="badge badge-pill ' + badgeSuccess + '">' + memberSuccess[name] + '</span></td>'
      + '</tr>';

  }
  badgeSuccess = 'badge-dark';
  badgeFailed = 'badge-dark';
  if (factionFailed > 0) { badgeFailed = 'badge-danger'; }
  if (factionSuccess > 0) { badgeSuccess = 'badge-success'; }
  summary = summary + '</tbody><tfoot><tr class="table-dark">'
    + '<td>Faction totals</td>'
    + '<td>' + ' $' + factionMoney.toLocaleString('en-US') + '</td>'
    + '<td><span class="badge badge-pill ' + badgeFailed + '">' + factionFailed + '</span></td>'
    + '<td><span class="badge badge-pill ' + badgeSuccess + '">' + factionSuccess + '</span></td>'
    + '</tr></tfoot>';
  summary = summary + '</table>';

  document.getElementById('summary').innerHTML = summary;

  $(document).ready(function () {
    $('#individual').DataTable({
      "paging": false,
      "order": [[0, "asc"]],
      "info": false,
      "stateSave": true
    });
  });


}

/**
 * Parses the organized crime data and generates a table summarizing the member list by organized crime attempts.
 *
 * @param {array} crimeData - The array of organized crime IDs from the API.
 * @param {string} element - The ID of the HTML element where the table will be inserted.
 * @param {Object} membersList - An object containing the member information from the API.
 *
 * This function generates an HTML table displaying the member list sorted by organized crime attempts.
 * The table includes the organized crime attempt date, participants, crime type, result, money gained, and respect gained.
 * The table is inserted into the specified HTML element and formatted for display.
 */
function parseOCs(crimeData, element, membersList) {

  var memberStatus = {};
  var memberSuccess = {};
  var memberFailed = {};
  var factionSuccess = 0;
  var factionFailed = 0;
  var totalRespect = 0;
  var totalMoney = 0;

  var badgeSuccess = 'badge-dark';
  var badgeFailed = 'badge-dark';

  const today = new Date();
  const currentMonth = today.getMonth();

  var firstDayOfMonth, lastDayOfMonth;

  var selectedMonthValue = document.getElementById('monthSelect').value;
  var selectedMonthValue = document.getElementById('monthSelect').value;

  // Calculate the month offset based on selectedMonthValue
  var monthOffset = parseInt(selectedMonthValue);

  // Calculate timestamps using the offset
  var timestamps = calculateMonthTimestamps(today, currentMonth - monthOffset);
  var firstDayOfMonth = timestamps.firstDay;
  var lastDayOfMonth = timestamps.lastDay;

  var selectElement = document.getElementById('monthSelect');
  var selectedOption = selectElement.options[selectElement.selectedIndex];
  var selectedMonthText = selectedOption.text;

  var crimeList = '';
  if (document.getElementById('PoliticalAssassination').checked) {
    crimeList = document.getElementById('PoliticalAssassination').value + ',' + crimeList;
  }
  if (document.getElementById('PlaneHijacking').checked) {
    crimeList = document.getElementById('PlaneHijacking').value + ',' + crimeList;
  }
  if (document.getElementById('TakeOverACruiseLiner').checked) {
    crimeList = document.getElementById('TakeOverACruiseLiner').value + ',' + crimeList;
  }
  if (document.getElementById('RobbingOfAMoneyTrain').checked) {
    crimeList = document.getElementById('RobbingOfAMoneyTrain').value + ',' + crimeList;
  }
  if (document.getElementById('PlannedRobbery').checked) {
    crimeList = document.getElementById('PlannedRobbery').value + ',' + crimeList;
  }
  if (document.getElementById('BombThreat').checked) {
    crimeList = document.getElementById('BombThreat').value + ',' + crimeList;
  }
  if (document.getElementById('Kidnapping').checked) {
    crimeList = document.getElementById('Kidnapping').value + ',' + crimeList;
  }
  if (document.getElementById('Blackmailing').checked) {
    crimeList = document.getElementById('Blackmailing').value + ',' + crimeList;
  }

  var table = '<div class="col-sm-12 badge-primary" ><b>Organized Crime Overview for ' + selectedMonthText + '</b> <input type="button" class="btn btn-outline-light btn-sm" value="select table content" onclick="selectElementContents( document.getElementById(\'totals\') );"></div>';
  table = table + '<br />';

  table = table + '<table class="table table-hover" id="organizedcrimes"><thead><tr>'
    + '<th>Date</th>'
    + '<th>Participants</th>'
    + '<th>Crime Type</th>'
    + '<th>Result</th>'
    + '<th>Money Gained<br/>'
    + '<th>Respect Gained</th>'
    + '</tr></thead><tbody>';


  for (var id in crimeData) {
    var crime = crimeData[id];

    if (crimeList.includes(crime.crime_id)) {
      // 8 = Political Assassination
      // 7 = Plane hijacking
      // 6 = Take over a cruise liner
      // 5 = Robbing of a money train
      // 4 = Planned robbery
      // 3 = Bomb Threat
      // 2 = Kidnapping
      // 1 = Blackmailing
      var ts = new Date(crime.time_completed * 1000);


      if (crime.initiated === 1 & crime.time_completed >= firstDayOfMonth && crime.time_completed <= lastDayOfMonth) {

        var crimeResult = '';
        var failed = 0;
        var success = 0;
        var participants = '';
        var tmp = '';

        if (crime.success === 0) {
          crimeResult = '<span class="badge badge-pill badge-danger">Failed</span>';
          failed = 1;
        } else {
          crimeResult = '<span class="badge badge-pill badge-success">Success</span>';
          success = 1;
        }

        crime.participants.forEach(obj => {
          Object.entries(obj).forEach(([key, value]) => {
            var memberID = `${key}`;

            var memberName = '';
            if (membersList.hasOwnProperty(memberID)) {
              memberName = membersList[memberID].name;
              if (memberName in memberStatus) {
                memberStatus[memberName] = memberStatus[memberName] + 1;
                memberSuccess[memberName] = memberSuccess[memberName] + success;
                memberFailed[memberName] = memberFailed[memberName] + failed;
              } else {
                memberStatus[memberName] = 1;
                memberSuccess[memberName] = success;
                memberFailed[memberName] = failed;
              }
            } else {
              memberName = memberID;
            }

            if (participants === '') {
              participants = memberName;

            } else {
              participants = participants + ', ' + memberName;
            }
          });
        });

        factionSuccess = factionSuccess + success;
        factionFailed = factionFailed + failed;
        totalRespect = totalRespect + crime.respect_gain;
        totalMoney = totalMoney + crime.money_gain;

        var formatted_date = ts.toISOString().replace('T', ' ').replace('.000Z', '');

        table = table + '<tr>'
          + '<td>' + formatted_date + '</td>'
          + '<td>' + participants + '</td>'
          + '<td>' + crime.crime_name + '</td>'
          + '<td>' + crimeResult + '</td>'
          + '<td>$' + crime.money_gain.toLocaleString('en-US') + '</td>'
          + '<td>' + crime.respect_gain + '</td>'
          + '</tr>';
      }
    }
  }

  if (factionFailed > 0) { badgeFailed = 'badge-danger'; }
  if (factionSuccess > 0) { badgeSuccess = 'badge-success'; }

  table = table + '</tbody><tfoot><tr class="table-dark">'
    + '<td colspan="3">Totals</td>'
    + '<td>'
    + '<span class="badge badge-pill ' + badgeFailed + '">' + factionFailed + '</span>-'
    + '<span class="badge badge-pill ' + badgeSuccess + '">' + factionSuccess + '</span>'
    + '</td>'
    + '<td>$' + totalMoney.toLocaleString('en-US') + '</td>'
    + '<td>' + totalRespect + '</td>'
    + '</tr>';

  table = table + '</tfoot></table>';

  $(document).ready(function () {
    $('#organizedcrimes').DataTable({
      "paging": false,
      "order": [[1, "asc"]],
      "info": false,
      "stateSave": true
    });
  });

  document.getElementById(element).innerHTML = table;

}

/**
 * Parses organized crime data and displays a table of crimes, including crime type, start time, status, participants, rewards, and additional details.
 *
 * @param {Object} oc2Data - The data containing organized crime information.
 * @param {string} element - The ID of the HTML element where the table will be inserted.
 *
 * This function generates a Bootstrap card for each crime, displaying the crime type, start time, status, participants, rewards, and additional details.
 * The cards are inserted into the specified HTML element and formatted for display.
 */
function parseOC2(oc2Data, element) {
  const crimes = Object.values(oc2Data['crimes']).sort((a, b) => b.difficulty - a.difficulty);


  var basic = oc2Data['basic'];
  var members = oc2Data['members'];

  const cardsContainer = document.getElementById('cardsContainer');
  cardsContainer.innerHTML = '';

  const summaryData = {};

  for (const crimeData of crimes) {

    const name = crimeData.name;
    const pcs = crimeData.participants;
    const key = `${crimeData.difficulty} - ${name}`;

    if (!summaryData[key]) {
      summaryData[key] = {
        pc: pcs,
        completions: 0,
        successes: 0,
        failures: 0,
        income: 0
      };
    }

    summaryData[key].completions++;
    if (crimeData.status === 'Successful') {
      summaryData[key].successes++;
      summaryData[key].income += crimeData.rewards?.money || 0;
    } else if (crimeData.status === 'Failed') {
      summaryData[key].failures++;
    }

    const slots = crimeData.slots; //slots is an array of objects
    let slotsString = '';
    for (const slot of slots) {
      let badgeSuccessChance = 'badge-success';
      let badgeItemRequirement = 'badge-secondary';
      //members is an array of objects, the member id is in the element id
      const member = members.find(member => member.id === slot.user_id);
      let memberName = '';

      if (member !== undefined) memberName = '<a href="https://www.torn.com/profiles.php?XID=' + slot.user_id + '" target="_blank">' + member.name + ' [' + slot.user_id + ']</a>';
      if (member === undefined) memberName = '<span class="badge badge-pill badge-warning">no member assigned</span>';

      if (slot.success_chance >= 75) badgeSuccessChance = 'badge-success';
      if (slot.success_chance >= 50 && slot.success_chance < 75) badgeSuccessChance = 'badge-warning';
      if (slot.success_chance < 50) badgeSuccessChance = 'badge-danger';
      if (slot.user_id === null) badgeSuccessChance = 'badge-secondary';

      const succesIcon = '<span class="badge badge-pill ' + badgeSuccessChance + '">' + slot.success_chance + '</span>';

      let itemIconText = 'no item required';
      if (slot.item_requirement !== null) {
        if (slot.item_requirement.is_available === false) {
          badgeItemRequirement = 'badge-danger';
          itemIconText = 'item not available';
        }
        if (slot.item_requirement.is_available === true) {
          badgeItemRequirement = 'badge-success';
          itemIconText = 'item available';
        }
      }
      const itemIcon = '<span class="badge badge-pill ' + badgeItemRequirement + '">' + itemIconText + '</span>';
      let progressbar = '';
      let userDetails = '';
      if (slot.user !== null) {
        userDetails = `${succesIcon} | ${itemIcon}`;
        progressbar = '<div class="progress"><div class="progress-bar progress-bar-striped bg-info" role="progressbar" style="width: ' + slot.user.progress + '%" aria-valuenow="' + slot.user.progress + '" aria-valuemin="0" aria-valuemax="100">' + slot.user.progress + '</div></div>';
      }

      slotsString += `<b>${slot.position}</b> - ${memberName}<br />${userDetails}<br />${progressbar}<br />`;
    }

    let rewards = '';
    if (crimeData.status === 'Successful') {
      const money = crimeData.rewards.money;
      let items = crimeData.rewards.items.join(', ');
      if (items === '') items = '<i>no items</i>';
      const respect = crimeData.rewards.respect;
      rewards = '<span class="text-success">Rewards: $' + abbreviateNumber(money) + ', ' + items + ', ' + respect + ' respect</span><br />';
    }

    //create card for each crime
    const header = crimeData.difficulty + ' - ' + crimeData.name;
    let color = 'primary';
    switch (crimeData.status) {
      case 'Recruiting': color = 'primary'; break;
      case 'Planning': color = 'info'; break;
      case 'Successful': color = 'success'; break;
      case 'Failure': color = 'danger'; break;
      case 'Expired': color = 'secondary'; break;
      default: color = 'primary'; break;
    }

    let formatted_date = 'N/A';
    formatted_date = 'Created at ' + new Date(crimeData.created_at * 1000).toISOString().replace('T', ' ').replace('.000Z', '') + '<br />';

    if (crimeData.ready_at > 0 && crimeData.ready_at !== null) {
      formatted_date += 'Ready at ' + new Date(crimeData.ready_at * 1000).toISOString().replace('T', ' ').replace('.000Z', '');
    }
    const title = 'ID: ' + crimeData.id + ' - <span class="badge badge-pill badge-' + color + '">Status: ' + crimeData.status + '</span>';
    const text = rewards + formatted_date + '<br />' + slotsString;

    const card = document.createElement('div');
    card.classList.add('card', `border-${color}`, 'mb-4');
    card.style.maxWidth = '20rem';

    const cardHeader = document.createElement('div');
    cardHeader.classList.add('card-header', `bg-${color}`, 'text-white');
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

    const col = document.createElement('div');
    col.classList.add('col-md-3', 'mb-3');
    col.appendChild(card);
    cardsContainer.appendChild(col);
  }

  const category = document.getElementsByName('categoryRadio');
  let selectedCategory = '';
  for (let radio of category) {
    if (radio.checked) selectedCategory = radio.value;
  }
  if (selectedCategory === 'completed') {

    let summaryHTML = `<div class="col-sm-12 badge-primary"><b>Completed OC Overview</b></div><br>`;
    summaryHTML += `<table class="table table-sm table-hover text-center" id="oc2summary"><thead><tr>
  <th>Scenario</th>
  <th>Completions</th>
  <th>Successes</th>
  <th>Failures</th>
  <th>Success Rate</th>
  <th>Income</th>
</tr></thead><tbody>`;

    for (const key of Object.keys(summaryData).sort()) {
      const d = summaryData[key];
      const rate = d.completions > 0 ? `${((d.successes / d.completions) * 100).toFixed(2)}%` : '-';
      summaryHTML += `<tr>
    <td>${key}</td>
    <td>${d.completions}</td>
    <td>${d.successes}</td>
    <td>${d.failures}</td>
    <td>${rate}</td>
    <td>$${d.income.toLocaleString()}</td>
  </tr>`;
    }
    summaryHTML += `</tbody></table><br>`;
    document.getElementById(element).innerHTML = summaryHTML;
  }

}


/**
 * Parses the Organized Crime data and generates a list of members with missing items for each OC.
 *
 * @param {object} oc2Data - The Organized Crime data from the Torn API.
 * @param {string} element - The HTML element ID where the list will be inserted.
 *
 * This function will display a list of OCs with missing items. Each OC will have a link to the OC itself and
 * a list of members with missing items. Each member will have a link to their profile and the item they are
 * missing. The list will be sorted by OC name.
 */
async function parseMissingItems(oc2Data, element) {
  const container = document.getElementById(element);
  container.innerHTML = '';

  var crimes = oc2Data['crimes'];
  var basic = oc2Data['basic'];
  var members = oc2Data['members'];

  let issuesFound = 0;
  let html = `<div class="col-sm-12 badge-primary"><b>Missing Items in Active OCs</b></div><br />`;

  for (const crime of Object.values(crimes)) {
    const crimeLink = `https://www.torn.com/factions.php?step=your#/tab=crimes&crimeId=${crime.id}`;
    const slots = crime.slots || [];

    for (const slot of slots) {

      const memberId = slot.user?.id || 'empty';
      const member = members.find(member => member.id === memberId);
      const memberName = member ? member.name : 'empty';
      const position = slot.position;

      if (slot.item_requirement !== null && memberId !== 'empty') {
        if (slot.item_requirement.is_available === false) {
          issuesFound++;

          const memberId = slot.user?.id || 'N/A';
          const memberName = members.find(m => m.id === memberId)?.name || 'Unknown';
          const position = slot.position || 'Unknown';

          const itemId = slot.item_requirement.id;
          const itemName = slot.item_requirement.name || `Item ${itemId}`;
          const itemLink = `https://www.torn.com/page.php?sid=ItemMarket#/market/view=search&itemID=${itemId}`;

          html += `
          <div class="card border-warning mb-3">
            <div class="card-header bg-warning text-white">
              ${crime.name} (Level ${crime.difficulty})
            </div>
            <div class="card-body">
              <p class="card-text">
                <b>Member:</b> <a href="https://www.torn.com/profiles.php?XID=${memberId}" target="_blank">${memberName} [${memberId}]</a><br />
                <b>Position:</b> ${position}<br />
                <b>Missing Item:</b> <a href="${itemLink}" target="_blank">${itemName} [${itemId}]</a><br />
                <b>OC Link:</b> <a href="${crimeLink}" target="_blank">Go to OC</a>
              </p>
            </div>
          </div>
        `;
        }
      }
    }
  }

  if (issuesFound === 0) {
    html = `
      <div class="alert alert-success" role="alert">
        <b>All good!</b> No missing items detected.
      </div>
    `;
  }

  container.innerHTML = html;
}

/**
 * Parses the Faction Members data and generates a list of members with a filterable table.
 *
 * @param {object} factionData - The Faction data from the Torn API.
 * @param {string} element - The HTML element ID where the list will be inserted.
 *
 * This function will display a list of members with filter options for their status, level, and position.
 * The list will be sorted by level in ascending order. The function will also generate a summary at the top
 * of the page with the total number of members and the number of members filtered. The summary will also
 * include a link to the faction's ranked war opponent, if applicable.
 */
function parseMembers(factionData, element) {

  getMembersFilters();

  const factionWars = factionData['wars'];
  const membersList = factionData['members'];
  const basicData = factionData['basic'];

  const ranked_wars = factionWars['ranked'];
  const raid_wars = factionWars['raid'];

  var trustedApiKey = document.getElementById("trustedkey").value;

  var statusList = '';
  var markedCheckboxStatus = document.getElementsByName('status');
  for (var checkbox of markedCheckboxStatus) {
    if (checkbox.checked) statusList = statusList + checkbox.value + ',';
  }

  var detailsList = '';
  var markedCheckboxDetails = document.getElementsByName('details');
  for (var checkbox of markedCheckboxDetails) {
    if (checkbox.checked) detailsList = detailsList + checkbox.value + ',';
  }

  const revivableFilter = document.getElementById('revivableToggle')?.dataset.state || 'all';
  const earlyDischargeFilter = document.getElementById('edToggle')?.dataset.state || 'all';
  const onWallFilter = document.getElementById('onWallToggle')?.dataset.state || 'all';

  var filterMinutesHosp = false;
  if (document.getElementById('MinutesHosp').checked) {
    filterMinutesHosp = true;
  }

  var filterMinutesAction = 0;
  if (document.getElementById('FilterActive').checked) {
    filterMinutesAction = document.getElementById('TimeActive').value;
  }

  var integrateFactionStats = false;
  if (document.getElementById('FactionStats').checked) {
    integrateFactionStats = document.getElementById('FactionStats').checked;
  }

  var cacheStats = false;
  if (integrateFactionStats) {
    cacheStats = checkIndexedDBSupport();
  }

  var levelRange = slider.noUiSlider.get();

  var printEntry = false;
  const currentFactionId = basicData.id;

  var table = '<div class="col-sm-12 badge-primary" >  <b>Members Status of <img src="https://factiontags.torn.com/'
    + basicData.tag_image + '"> '
    + basicData.name
    + ' [' + currentFactionId + ']'
    + '';
  table = table + '</div></b>';
  table += '<div class="col-sm-12 badge-secondary" ><img alt="Reload" title="Reload" src="images/svg-icons/refresh.svg" height="25" onclick="document.getElementById(\'submit\')?.click()"><img alt="select table content" title="select table content" src="images/svg-icons/text-selection.svg" height="25" onclick="selectElementContents(document.getElementById(\'members\'));">';

  if (integrateFactionStats) table += '&nbsp;<img alt="Get Faction Stats" title="Get Faction Stats from TornStats" src="images/svg-icons/stats.svg" height="25" onclick="callTornStatsAPI(\'' + trustedApiKey + '\', \'spy\', ' + currentFactionId + ',  \'faction\', ' + cacheStats + ')"';

  table += '</div></div>';

  //if (integrateFactionStats) table = table + '<div class="float-right"><button type="button" onclick="callTornStatsAPI(\'' + trustedApiKey + '\', ' + statusData.ID + ', \'faction\', ' + cacheStats + ')" class="btn btn-primary btn-sm">Get Faction Stats</button></div>';



  table = table + '<br /><table class="table table-hover" id="members"><thead><tr>'
    + '<th>Name&nbsp;&nbsp;</th>'
    + '<th>Icons&nbsp;&nbsp;</th>'
    + '<th>Attack Link&nbsp;&nbsp;</th>'
    + '<th>Status&nbsp;&nbsp;</th>'
    + '<th>Details&nbsp;&nbsp;</th>'
    + '<th>Description&nbsp;&nbsp;</th>'
    + '<th>Last Action&nbsp;&nbsp;</th>'
    + '<th>Level&nbsp;&nbsp;</th>'
    + '<th>Position&nbsp;&nbsp;</th>';
  if (integrateFactionStats) table = table + '<th class="stat-column">Torn Stats&nbsp;&nbsp;</th>';
  table = table + '<th>Stats Popup&nbsp;&nbsp;</th>'

  table = table + '</tr></thead><tbody>';

  var statusFormat = '';
  var detailFormat = '';
  var countMembers = 0;
  var filteredMembers = 0;
  var statusDescriptionText = '';
  var uniquePositions = new Set();

  var timeStamp = Math.floor(Date.now() / 1000);
  var timeDifference = 0;

  for (var entryId in membersList) {

    printEntry = false;
    statusDescriptionText = '';

    var member = membersList[entryId];
    const id = member.id;
    var memberStatusState = member.status.state;
    var hospitalTime = '';

    uniquePositions.add(member.position);

    if ((filterMinutesHosp && memberStatusState == 'Hospital')
      || (!filterMinutesHosp && memberStatusState == 'Hospital')
      || (member.status.state !== 'Hospital')) {

      if (filterMinutesHosp && memberStatusState == 'Hospital') {
        timeDifference = (member.status.until - timeStamp) / 60;
        if (timeDifference < 15) {
          printEntry = true;
        }
      } else {
        printEntry = true;
      }
    }

    if (memberStatusState === 'Hospital') {
      const rawTimestamp = member.status.until;

      // Initially blank — will be filled by the countdown updater
      const timePlaceholder = `<span class="hospital-timer" data-hospital-until="${rawTimestamp}"></span>`;

      statusDescriptionText = `Out of hospital in ${timePlaceholder}`;
      hospitalTime = ` out in ${timePlaceholder}`;
    }


    else {
      statusDescriptionText = member.status.description.replace('to Torn ', '');
    }

    var memberLastActionTimestamp = (timeStamp - member.last_action.timestamp);
    var memberLastAction = '';

    if (filterMinutesAction > memberLastActionTimestamp / 60) {
      printEntry = false;
    }



    const time = memberLastActionTimestamp;

    const days = Math.floor(time / 86400);
    const hours = Math.floor((time % 86400) / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    const segments = [
      { val: days, label: 'd:' },
      { val: hours, label: 'h:' },
      { val: minutes, label: 'm:' },
      { val: seconds, label: 's' }
    ];

    let leading = true;
    memberLastAction = segments.map(({ val, label }) => {
      const str = val.toString().padStart(2, '0') + label;
      if (leading && val === 0) {
        return `<span class="text-secondary">${str}</span>`;
      } else {
        leading = false;
        return str;
      }
    }).join('');



    var icon = '';
    var detail = '';
    if (member.last_action.status == 'Online') statusFormat = 'badge-success';
    if (member.last_action.status == 'Idle') statusFormat = 'badge-warning';
    if (member.last_action.status == 'Offline') statusFormat = 'badge-dark';

    if (memberStatusState == 'Hospital') {
      detailFormat = 'badge-danger';
      icon = icon + '<img src="images/icon_hosp.png" alt="Hospital" title="Hospital" width="20" height="20"/>&nbsp;';
      detail = '<span class="badge badge-pill ' + detailFormat + '">' + memberStatusState + '</span>';
      if (member.status.description.includes('In a')) {
        memberStatusState = 'Abroad';
      }
    }
    if (memberStatusState == 'Okay') {
      detailFormat = 'badge-success';
      detail = '<span class="badge badge-pill ' + detailFormat + '">' + memberStatusState + '</span>';
    }
    if (memberStatusState == 'Jail') {
      detailFormat = 'badge-warning';
      icon = icon + '<img src="images/icon_jail.png" alt="Jail" title="Jail" width="20" height="20"/>&nbsp;';
      detail = '<span class="badge badge-pill ' + detailFormat + '">' + memberStatusState + '</span>';
    }
    if (memberStatusState == 'Traveling') {
      detailFormat = 'badge-dark';
      icon = icon + '<img src="images/icon_travel.png" alt="Traveling" title="Traveling" width="20" height="20"/>&nbsp;';
      detail = '<span class="badge badge-pill ' + detailFormat + '">' + memberStatusState + '</span>';
    }
    if (memberStatusState == 'Abroad') {
      detailFormat = 'badge-info';
      icon = icon + '<img src="images/icon_abroad.png" alt="Abroad" title="Abroad" width="20" height="20"/>&nbsp;';
      detail = detail + '<span class="badge badge-pill ' + detailFormat + '">' + memberStatusState + '</span>';
    }

    if (member.is_revivable) {
      detail = detail + '<span class="badge badge-pill badge-primary">Revivable</span>';
    }
    if (member.has_early_discharge) {
      detail = detail + '<span class="badge badge-pill badge-warning">Early Discharge</span>';
    }
    if (member.is_on_wall) {
      detail = detail + '<span class="badge badge-pill badge-info">On Wall</span>';
    }

    if (revivableFilter === 'only' && !member.is_revivable) printEntry = false;
    if (revivableFilter === 'hide' && member.is_revivable) printEntry = false;

    if (earlyDischargeFilter === 'only' && !member.has_early_discharge) printEntry = false;
    if (earlyDischargeFilter === 'hide' && member.has_early_discharge) printEntry = false;

    if (onWallFilter === 'only' && !member.is_on_wall) printEntry = false;
    if (onWallFilter === 'hide' && member.is_on_wall) printEntry = false;

    if (statusList.includes(member.last_action.status)
      && detailsList.includes(memberStatusState)
      && printEntry
      && (!document.getElementById(member.position) || document.getElementById(member.position).checked)
      && (member.level >= levelRange[0] && member.level <= levelRange[1])) {

      var copyableText = ' >> ' + member.name + ' << https://www.torn.com/loader.php?sid=attack&user2ID=' + id;

      table = table + '<tr>'

        + '<td class="align-middle"><a href="https://www.torn.com/profiles.php?XID=' + id + '" target="_blank">' + member.name + '<br/>[' + id + ']</a><br/></td>'
        + '<td class="align-middle">' + icon + '</td>'
        + '<td class="align-middle">'
        + '<div class="link-group" role="group">'
        + '<a class="btn btn-link btn-sm" role="button" href="https://www.torn.com/loader.php?sid=attack&user2ID=' + id + '" target="_blank"><img alt="Attack" title="Attack" src="images/svg-icons/attack2.svg" height="25"></a>&nbsp;'
        //+ '<button type="button" onclick="copyButton(' + id + ')" class="btn btn-secondary btn-sm" id="copy-button' + id + '" data-toggle="tooltip" data-placement="button" title="Copy for Faction Chat">'
        + '</div>'
        + '<input type="hidden" class="form-control" value="' + copyableText + '" placeholder="..." id="copy-input-' + id + '">'
        //+ 'Copy</button>'
        + '</td>'
        + '<td class="align-middle">' + '<span class="badge badge-pill ' + statusFormat + '">' + member.last_action.status + '</span>' + '</td>'
        + '<td class="align-middle">' + detail + '</td>'
        + '<td class="align-middle">' + statusDescriptionText + '</td>'
        + '<td class="align-middle">' + memberLastAction + '</td>'
        + '<td class="align-middle">' + member.level + '</td>'
        + '<td class="align-middle"><pre>' + member.position + '</pre></td>'


      if (integrateFactionStats) {
        var stat = '';
        if (cacheStats) {
          indexedDBRequest = openIndexedDB('TornEngine_pst', 1);

          initializeIndexedDB(indexedDBRequest, 'Stats');
          stat = getPlayerById(indexedDBRequest, 'Stats', id);
        }
        table = table + `<td class="align-middle" id="stats_${id}" data-order="0"></td>`;
      }

      table = table + '<td class="align-middle">'
        + '<img alt="Show Stats" title="Show Stats" src="images/svg-icons/stats.svg" height="25" onclick="callTornStatsAPI(\'' + trustedApiKey + '\', \'spy\',' + id + ', \'user\')" data-toggle="modal" data-target="#statsModal">'
        //+ '<button type="button" onclick="callTornStatsAPI(\'' + trustedApiKey + '\', ' + id + ', \'user\', false)" class="btn btn-secondary btn-sm" data-toggle="modal" data-target="#statsModal">Show Stats</button>'
        + '</td>'

      filteredMembers++;
    }

    table = table + '</tr>';
    countMembers++;
  }
  table = table + '</tbody></table>';

  if (!document.getElementById(member.position)) generatePositionCheckboxes(uniquePositions);

  document.getElementById(element).innerHTML = table;

  var ts = new Date(timeStamp * 1000);
  var formatted_date = ts.toISOString().replace('T', ' ').replace('.000Z', '');

  const summary = `<span class="text-primary">${filteredMembers} members out of ${countMembers} total members filtered.</span> <span class="text-muted">Last refreshed: ${formatted_date}</span><div class="war-info"></div>`;
  document.getElementById('summary').innerHTML = summary;

  let war_info = '';
  if (ranked_wars) {
    const factions = ranked_wars.factions;
    const faction1ID = factions[0].id;
    const faction2ID = factions[1].id;
    const faction1Name = factions[0].name;
    const faction2Name = factions[1].name;

    if (faction1ID != currentFactionId) war_info += `<div>Ranked war opponent: <a href="members.html?factionID=${faction1ID}">${faction1Name} [${faction1ID}]</a></div>`;
    if (faction2ID != currentFactionId) war_info += `<div>Ranked war opponent: <a href="members.html?factionID=${faction2ID}">${faction2Name} [${faction2ID}]</a></div>`;
  }

  if (war_info.length > 0) {
    const button = `<button onclick="hideElementByID('war-details')" class="btn btn-outline-secondary btn-sm" id="btnHideWarDetails">Hide&nbsp;Details</button>`;
    document.getElementById('war-info').innerHTML = '<div class="war-details" id="war-details">' + war_info + '</div>' + button;
  }

  startHospitalCountdowns();

  $('#members').DataTable({
    paging: false,
    order: [[5, 'asc']],
    info: false,
    stateSave: true,
    columnDefs: [
      {
        targets: 'stat-column', // Add this class to your <th>
        orderDataType: 'dom-data-order'
      }
    ]
  });

  if (!$.fn.dataTable.ext.order['dom-data-order']) {
    $.fn.dataTable.ext.order['dom-data-order'] = function (settings, col) {
      return this.api().column(col, { order: 'index' }).nodes().map(td =>
        $(td).data('order') || 0
      );
    };
  }
}


/**
 * Parses spy data from TornStats and updates the specified HTML element with a table of user details.
 *
 * @param {Object} data - The data containing spy information.
 * @param {string} element - The ID of the HTML element where the table will be inserted.
 *
 * This function generates an HTML table displaying details of a user, including name, ID, strength,
 * defense, speed, dexterity, total stats, and additional details. The table is inserted into the
 * specified HTML element and formatted for display.
 */
function parseUserSpy(data, element) {
  const spyData = data.spy || data.spyData;
  const compareData = data.compare || null;

  console.log('Spy Data:', spyData);
  console.log('Compare Data:', compareData);

  if (!spyData || !spyData.player_id) {
    document.getElementById('statsModalLabel').innerHTML = 'Spy Not Found';
    document.getElementById('statsModalBody').innerHTML = '<div class="alert alert-info">No spy data available for this user.</div>';
    return;
  }

  const { player_name, player_id, strength, defense, speed, dexterity, total, timestamp, type } = spyData;
  const ts = new Date(timestamp * 1000);

  let modalBody = '';
  document.getElementById('statsModalLabel').innerHTML = `Player: ${player_name} [${player_id}] <a href="https://www.torn.com/loader.php?sid=attack&user2ID=${player_id}" target="_blank"><img src="images/svg-icons/attack2.svg" height="25" alt="Attack" title="Attack" /></a>`;

  modalBody += `<div class="text-muted"><strong>Strength:</strong> ${strength.toLocaleString()}</div>`;
  modalBody += `<div class="text-muted"><strong>Defense:</strong> ${defense.toLocaleString()}</div>`;
  modalBody += `<div class="text-muted"><strong>Speed:</strong> ${speed.toLocaleString()}</div>`;
  modalBody += `<div class="text-muted"><strong>Dexterity:</strong> ${dexterity.toLocaleString()}</div>`;
  modalBody += `<div class="text-primary"><strong>Total:</strong> ${total.toLocaleString()}</div><br/>`;
  modalBody += `<div class="text-muted"><em>Update: ${ts.toISOString().split('T')[0]} (${type})</em></div><br/>`;

  if (compareData && compareData.data) {
    const relevant = ['Xanax Taken', 'Refills'];
    for (const key of relevant) {
      if (compareData.data[key]) {
        modalBody += `<div class="text-muted"><strong>${key}:</strong> ${compareData.data[key].amount}</div>`;
      }
    }
  }

  document.getElementById('statsModalBody').innerHTML = modalBody;
}


/**
 * Parses faction spy data and updates member statistics or caches them in IndexedDB.
 *
 * @param {Object} data - The data containing faction spy information.
 * @param {boolean} [cacheStats=false] - Determines if stats should be cached in IndexedDB.
 *
 * This function processes spy data for each member in the faction, extracting their
 * stats such as strength, defense, speed, and dexterity. If `cacheStats` is true, it
 * stores the stats in the IndexedDB under the 'Stats' object store. Otherwise, it
 * updates the HTML content for each member's stats on the page. The function logs
 * errors if the data is invalid or missing.
 */
function parseFactionSpy(data, cacheStats = false) {

  factionData = data.faction || null;
  if (!factionData || typeof factionData !== 'object') {
    printAlert('Error', 'Invalid faction data from TornStats.');
    return;
  }

  const membersList = factionData.members || {};

  for (const id in membersList) {
    const entry = membersList[id];
    console.log('Entry:', entry);
    if (!entry || !entry.id || !entry.spy) continue;



    const player = {
      playerID: entry.id,
      strength: entry.spy.strength,
      defense: entry.spy.defense,
      speed: entry.spy.speed,
      dexterity: entry.spy.dexterity,
      total: entry.spy.total,
      timestamp: entry.spy.timestamp
    };

    console.log('Player Data:', player);
    console.log('Cache Stats:', cacheStats);

    if (cacheStats) {
      const request = openIndexedDB('TornEngine_pst', 1);
      initializeIndexedDB(request, 'Stats');
      insertPlayer(request, 'Stats', player);
    } else {
      const ts = new Date(player.timestamp * 1000);
      const stats = `Dex: ${abbreviateNumber(player.dexterity)}, Def: ${abbreviateNumber(player.defense)}, Str: ${abbreviateNumber(player.strength)}, Spd: ${abbreviateNumber(player.speed)}`;

      const statText = `${abbreviateNumber(player.total)} <span class="text-muted">${stats}</span><div class="text-secondary">${ts.toISOString().split('T')[0]}</div>`;
      const elementId = `stats_${player.playerID}`;

      const el = document.getElementById(elementId);
      if (el) el.innerHTML = statText;
    }
  }
}