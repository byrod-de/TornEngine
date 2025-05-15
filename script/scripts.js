

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

function userSubmit(selection) {
  var trustedApiKey = getApiKey();

  if (trustedApiKey === '' || trustedApiKey == null || trustedApiKey == undefined || trustedApiKey == 'null') {
    printAlert('Warning', 'You might want to enter your API key if you expect this to work...');
  } else {

    if (selection == 'pa_planner') {
      callTornAPI(trustedApiKey, 'faction', 'basic,crimeexp', 'pa_planner');
    }

    if (selection == 'pa_payouts') {

      var today = new Date();
      var firstDayOfMonth, lastDayOfMonth;
      var selectedMonthValue = document.getElementById('monthSelect').value;

      // Calculate the month offset based on selectedMonthValue
      var monthOffset = parseInt(selectedMonthValue);

      // Calculate timestamps using the offset
      var currentMonth = today.getMonth();
      var timestamps = calculateMonthTimestamps(today, currentMonth - monthOffset, 192);

      var firstDayOfMonth = timestamps.firstDay;
      var lastDayOfMonth = timestamps.lastDay;
      callTornAPI(trustedApiKey, 'faction', 'basic,crimes', 'pa_payouts', firstDayOfMonth, lastDayOfMonth);
    }

    if (selection == 'oc_overview') {

      var today = new Date();
      var firstDayOfMonth, lastDayOfMonth;
      var selectedMonthValue = document.getElementById('monthSelect').value;

      // Calculate the month offset based on selectedMonthValue
      var monthOffset = parseInt(selectedMonthValue);

      // Calculate timestamps using the offset
      var currentMonth = today.getMonth();
      var timestamps = calculateMonthTimestamps(today, currentMonth - monthOffset, 192);

      var firstDayOfMonth = timestamps.firstDay;
      var lastDayOfMonth = timestamps.lastDay;
      callTornAPI(trustedApiKey, 'faction', 'basic,crimes', 'oc_overview', firstDayOfMonth, lastDayOfMonth);

    }

    if (selection == 'oc2_center') {
      const category = document.getElementsByName('categoryRadio');
      let selectedCategory = '';
      for (let radio of category) {
        if (radio.checked) selectedCategory = radio.value;
      }
      console.log(selectedCategory);
      callTornAPIv2(trustedApiKey, 'faction', 'basic,crimes,members', 'oc2_center', selectedCategory);
    }

    if (selection == 'reports') {
      callTornAPI(trustedApiKey, 'faction', 'basic,reports', 'reports');
    }

    if (selection == 'members') {
      callTornAPI(trustedApiKey, 'faction', 'basic', 'members');
    }

    if (selection == 'keycheck') {
      callTornAPI(trustedApiKey, 'key', 'info', 'keycheck');
    }

    if (selection == 'trailers') {
      callTornAPI(trustedApiKey, 'user', 'basic,properties', 'trailers');
    }

    if (selection == 'news') {
      var category = ''
      if (document.getElementById('armorynews').checked) {
        category = 'armorynews';
      }
      if (document.getElementById('attacknews').checked) {
        category = 'attacknews';
      }
      if (document.getElementById('crimenews').checked) {
        category = 'crimenews';
      }
      if (document.getElementById('fundsnews').checked) {
        category = 'fundsnews';
      }
      if (document.getElementById('mainnews').checked) {
        category = 'mainnews';
      }
      if (document.getElementById('membershipnews').checked) {
        category = 'membershipnews';
      }
      if (document.getElementById('territorynews').checked) {
        category = 'territorynews';
      }

      callTornAPI(trustedApiKey, 'faction', category, 'news');
    }

    if (selection == 'rankedwars') {
      callTornAPI(trustedApiKey, 'torn', 'rankedwars', 'rankedwars');
    }

    document.getElementById('submit').innerHTML = 'Refresh';
  }

}

function callTornStatsAPI(apiKey, id, selection, cacheStats) {
  if (selection == 'user') {
    document.getElementById('statsModalLabel').innerHTML = 'Calling TornStats API';
    document.getElementById('statsModalBody').innerHTML = 'Please hold the line...';

    var request = new XMLHttpRequest();

    request.open('GET', 'https://www.tornstats.com/api/v2/' + apiKey + '/spy/user/' + id, true);

    request.onload = function () {

      var jsonData = JSON.parse(this.response);

      if (request.status >= 200 && request.status < 400) {

        if (jsonData.message.includes("ERROR")) {
          document.getElementById('statsModalLabel').innerHTML = 'Error Occurred';
          document.getElementById('statsModalBody').innerHTML = '<div class="alert alert-warning"><strong>Warning: </strong>Calling TornStats failed.</div>'
            + '<br />Please make sure to use the same API Key as confiured in <a href="https://beta.tornstats.com/settings/general" target="_blank">TornStats</a>.';
        } else {
          if (jsonData.spy.message.includes("Spy not found.")) {

            let statsModalBody = '';

            statsModalBody = '<div class="alert alert-info"><strong>Warning: </strong>Spy not found on Tornstats.</div>';

            var innerRequest = new XMLHttpRequest();

            innerRequest.open('GET', 'https://api.torn.com/user/' + id + '?selections=personalstats,profile&key=' + apiKey + '&comment=tornengine', true);

            innerRequest.onload = function () {

              var innerJsonData = JSON.parse(this.response);

              if (innerRequest.status >= 200 && innerRequest.status < 400) {
                document.getElementById('statsModalLabel').innerHTML = '<strong>Player:</strong> ' + innerJsonData.name + ' [' + innerJsonData.player_id + '] <a href="https://www.torn.com/loader.php?sid=attack&user2ID=' + innerJsonData.player_id + '" target="_blank"><img src="images/svg-icons/attack2.svg" height="25" alt="Attack" title="Attack" /></a>';


                statsModalBody = statsModalBody + '<div class="text-muted"><strong>Age:</strong> ' + innerJsonData.age.toLocaleString('en-US') + ' days </div>';


                for (var stat in innerJsonData.personalstats) {
                  if (stat === 'xantaken') statsModalBody = statsModalBody + '<div class="text-muted"><strong>Xanax Taken:</strong> ' + innerJsonData.personalstats[stat].toLocaleString('en-US') + '</div>';
                  if (stat === 'statenhancersused') statsModalBody = statsModalBody + '<div class="text-muted"><strong>SE Used:</strong> ' + innerJsonData.personalstats[stat].toLocaleString('en-US') + '</div>';
                  if (stat === 'consumablesused') statsModalBody = statsModalBody + '<div class="text-muted"><strong>Consumables Used:</strong> ' + innerJsonData.personalstats[stat].toLocaleString('en-US') + '</div>';
                  if (stat === 'refills') statsModalBody = statsModalBody + '<div class="text-muted"><strong>Refills:</strong> ' + innerJsonData.personalstats[stat].toLocaleString('en-US') + '</div>';
                }
              }
              document.getElementById('statsModalBody').innerHTML = statsModalBody;

            }
            innerRequest.send();

            document.getElementById('statsModalBody').innerHTML = statsModalBody;

          } else {

            var ts = new Date(jsonData.spy.timestamp * 1000);
            let statsModalBody = '';
            let compareList = 'Xanax Taken, Refills';

            document.getElementById('statsModalLabel').innerHTML = '<strong>Player:</strong> ' + jsonData.spy.player_name + ' [' + jsonData.spy.player_id + '] <a href="https://www.torn.com/loader.php?sid=attack&user2ID=' + jsonData.spy.player_id + '" target="_blank"><img src="images/svg-icons/attack2.svg" height="25" alt="Attack" title="Attack" /></a>';
            statsModalBody = '<div class="text-muted"><strong>Strength:</strong> ' + jsonData.spy.strength.toLocaleString('en-US') + '</div>'
              + '<div class="text-muted"><strong>Defense:</strong> ' + jsonData.spy.defense.toLocaleString('en-US') + '</div>'
              + '<div class="text-muted"><strong>Speed:</strong> ' + jsonData.spy.speed.toLocaleString('en-US') + '</div>'
              + '<div class="text-muted"><strong>Dexterity:</strong> ' + jsonData.spy.dexterity.toLocaleString('en-US') + '</div>'
              + '<div class="text-primary"><strong>Total:</strong> ' + jsonData.spy.total.toLocaleString('en-US') + '</div>'
              + '<br />'
              + '<div class="text-muted"><em>Update: ' + ts.toISOString().substring(0, ts.toISOString().indexOf('T')) + ' (' + jsonData.spy.type + ')</em></div>'
              + '<br />';

            for (var key in jsonData.compare.data) {
              if (compareList.includes(key)) statsModalBody = statsModalBody + '<div class="text-muted"><strong>' + key + ':</strong> ' + jsonData.compare.data[key].amount + '</div>'
            }

            document.getElementById('statsModalBody').innerHTML = statsModalBody;


          }
        }

      } else {
        printAlert('#chedded', 'Torn Stats API is currently not available.');
      }
    }
    request.send();
  }

  if (selection == 'faction') {

    var request = new XMLHttpRequest();

    request.open('GET', 'https://www.tornstats.com/api/v2/' + apiKey + '/spy/faction/' + id, true);

    printAlert('Info', 'Calling <a href="https://beta.tornstats.com/settings/general" target="_blank">TornStats</a>...');

    request.onload = function () {

      var jsonData = JSON.parse(this.response);

      if (request.status >= 200 && request.status < 400) {

        if (jsonData.message.includes("ERROR")) {
          printAlert('Error', 'Please make sure to use the same API Key as confiured in <a href="https://beta.tornstats.com/settings/general" target="_blank">TornStats</a>.');
        } else {
          parseFactionSpies(jsonData['faction'], cacheStats);

          printAlert('Success', 'Stats pulled from <a href="https://beta.tornstats.com/settings/general" target="_blank">TornStats</a>.');
        }
      }



    }
    request.send();


  }

}

function callTornAPI(key, part, selection, source, fromTS = '', toTS = '') {

  var selectedID = '';
  let from = '', to = '';

  if (toTS > 0) to = `&to=${toTS}`;
  if (fromTS > 0) from = `&from=${fromTS}`;

  if (source == 'members') selectedID = document.getElementById("factionid").value;
  if (source == 'trailers') selectedID = document.getElementById("playerid").value;


  sessionStorage.factionid = selectedID;
  var url = 'https://api.torn.com/' + part + '/' + selectedID + '?selections=' + selection + from + to + '&key=' + key + '&comment=tornengine';

  var request = new XMLHttpRequest();

  request.open('GET', url, true);

  request.onload = function () {

    var jsonData = JSON.parse(this.response);

    if (request.status >= 200 && request.status < 400) {

      if (jsonData.hasOwnProperty('error')) {
        if (jsonData['error'].code === 7) {
          printAlert('Warning', 'You are trying to access sensible faction data, but are not allowed to. Ask your faction leader for faction API permissions.');
        } else if (jsonData['error'].code === 2) {
          printAlert('Error', 'You are using an incorrect API key.');
        } else {
          printAlert('Error', 'Torn API returned the following error: ' + jsonData['error'].error);
        }
      } else {

        if (selection === 'basic,crimeexp' && source === 'pa_planner') {
          if (jsonData.hasOwnProperty('crimeexp') && jsonData.hasOwnProperty('members')) {
            printAlert('Success', 'The API Call successful, find the results below.');

            parseCrimeexp(jsonData['crimeexp'], 'output', jsonData['members']);
          } else {
            printAlert('Warning', 'Ask your faction leader for faction API permissions.');
          }
        }

        if (selection === 'basic,crimes' && source === 'pa_payouts') {
          if (jsonData.hasOwnProperty('crimes') && jsonData.hasOwnProperty('members')) {
            printAlert('Success', 'The API Call successful, find the results below.');

            parsePayouts(jsonData['crimes'], 'output', jsonData['members']);
          } else {
            printAlert('Warning', 'Ask your faction leader for faction API permissions.');
          }
        }

        if (selection === 'basic,crimes' && source === 'oc_overview') {
          if (jsonData.hasOwnProperty('crimes') && jsonData.hasOwnProperty('members')) {
            printAlert('Success', 'The API Call successful, find the results below.');

            parseOCs(jsonData['crimes'], 'output', jsonData['members']);
          } else {
            printAlert('Warning', 'Ask your faction leader for faction API permissions.');
          }
        }

        if (selection === 'basic,reports' && source === 'reports') {
          if (jsonData.hasOwnProperty('reports') && jsonData.hasOwnProperty('members')) {
            printAlert('Success', 'The API Call successful, find the results below.');

            parseReports(jsonData['reports'], 'output', jsonData['members']);
          } else {
            printAlert('Warning', 'Ask your faction leader for faction API permissions.');
          }
        }

        if (selection === 'basic,reports' && source === 'reports') {
          if (jsonData.hasOwnProperty('reports')) {
            printAlert('Success', 'The API Call successful, find the results below.');
            parseReports(jsonData['reports'], 'output', jsonData.name);

          }
        }

        if (selection === 'basic,attacks' && source === 'attacks') {
          if (jsonData.hasOwnProperty('attacks')) {
            printAlert('Success', 'The API Call successful, find the results below.');
            parseAttacks(jsonData['attacks'], 'output', jsonData.name);

          }
        }

        if (source === 'news') {
          printAlert('Success', 'The API Call successful, find the results below.');
          parseNews(jsonData[selection], selection, 'output', jsonData.name);
        }

        if (source === 'members') {
          printAlert('Success', 'The API Call successful, find the results below.');
          parseMembers(jsonData, selection, 'output', jsonData['members'], jsonData['ranked_wars'], jsonData['raid_wars']);
        }

        if (source === 'keycheck') {
          printAlert('Success', 'The API Call successful, find the results below.');
          parseKeyInfo(jsonData, selection, 'output', jsonData['selections']);
        }

        if (source === 'trailers') {
          printAlert('Success', 'The API Call successful, find the results below.');
          parsePropertyInfo(jsonData, 'properties', 'output');
        }

        if (selection === 'rankedwars') {

          if (source === 'rankedwars') {
            printAlert('Success', 'The API Call successful, find the results below.');
            parseRankedWars(jsonData, selection, 'output', jsonData['rankedwars']);
          }
          if (source === 'getWarringFactions') {
            printAlert('Success', 'The API Call successful, faction list preloaded.');
            getWarringFactions(jsonData, selection, 'output', jsonData['rankedwars']);
          }
        }
      }

    } else {
      printAlert('#chedded', 'Torn API is currently not available.');
    }
  }
  request.send();
}

function callTornAPIv2(key, part, selection, source, category = '') {

  let cat = '';

  if (category !== '') cat = `&cat=${category}`;

  var url = 'https://api.torn.com/v2/' + part + '/' + selection +'?key=' + key + cat + '&comment=tornengine';
  console.log(url);

  var request = new XMLHttpRequest();

  request.open('GET', url, true);

  request.onload = function () {

    var jsonData = JSON.parse(this.response);

    if (request.status >= 200 && request.status < 400) {

      if (jsonData.hasOwnProperty('error')) {
        if (jsonData['error'].code === 7) {
          printAlert('Warning', 'You are trying to access sensible faction data, but are not allowed to. Ask your faction leader for faction API permissions.');
        } else if (jsonData['error'].code === 2) {
          printAlert('Error', 'You are using an incorrect API key.');
        } else {
          printAlert('Error', 'Torn API returned the following error: ' + jsonData['error'].error);
        }
      } else {

        if (selection === 'basic,crimes,members' && source === 'oc2_center') {
          if (jsonData.hasOwnProperty('crimes') && jsonData.hasOwnProperty('basic') && jsonData.hasOwnProperty('members')) {
            if (jsonData['crimes'][0]?.slots ?? undefined != undefined) {
              console.log('OC 2.0 detected');
              printAlert('Success', 'The API Call successful, find the results below.');
            } else {
              console.log('OC 1.0 detected');
              printAlert('ACHTUNG', 'Your selection did not return a valid OC 2.0 result, are you sure you migrated yet?');
            }

            parseOC2(jsonData, 'output');
          } else {
            printAlert('Warning', 'Ask your faction leader for faction API permissions.');
          }
        }
      }
    } else {
      printAlert('#chedded', 'Torn API is currently not available.');
    }
  }
  request.send();
}

function parseKeyInfo(keyInfoData, selection, element, keyInfo) {
  var trustedApiKey = document.getElementById("trustedkey").value;

  var accessLevelInformation = keyInfoData.access_level + ': ' + keyInfoData.access_type;
  var accessClass = '';

  switch (keyInfoData.access_level) {
    case 1: accessClass = 'badge-light'; break;
    case 2: accessClass = 'badge-success'; break;
    case 3: accessClass = 'badge-warning'; break;
    case 4: accessClass = 'badge-danger'; break;
    case 0: accessClass = 'badge-info'; break;
  }

  var table = '<div class="col-sm-12 ' + accessClass + '" >Your key has the following access level - '
    + accessLevelInformation
    + '</div>';


  table = table + '<br /><table class="table table-hover" id="selections"><thead><tr>'
    + '<th>Selection</th>'
    + '<th>Element</th>'
    + '<th>Access Level</th>';

  table = table + '</tr></thead><tbody>';

  var accessLevel = '';
  var tableClass = '';

  for (var selectionsEntry in keyInfo) {
    var selectionData = keyInfo[selectionsEntry];

    for (var selectionName in selectionData) {

      switch (selectionsEntry) {
        case 'torn': tableClass = 'table-dark'; accessLevel = 'Public';
          break;
        case 'market': tableClass = 'table-dark'; accessLevel = 'Public';
          break;
        case 'properties': tableClass = 'table-success'; accessLevel = 'Minimal Access';
          break;
        case 'property': tableClass = 'table-dark'; accessLevel = 'Public';
          break;
        case 'key': tableClass = 'table-dark'; accessLevel = 'Public';
          break;
        case 'company': switch (selectionData[selectionName]) {
          case 'profile': tableClass = 'table-dark'; accessLevel = 'Public';
            break;
          case 'timestamp': tableClass = 'table-dark'; accessLevel = 'Public';
            break;
          case 'lookup': tableClass = 'table-dark'; accessLevel = 'Public';
            break;
          default: tableClass = 'table-warning'; accessLevel = 'Limited Access';

        }
          break;
        case 'faction': switch (selectionData[selectionName]) {
          case 'attacknews': tableClass = 'table-warning'; accessLevel = 'Limited Access';
            break;
          case 'attacks': tableClass = 'table-warning'; accessLevel = 'Limited Access';
            break;
          case 'attacksfull': tableClass = 'table-warning'; accessLevel = 'Limited Access';
            break;
          case 'basic': tableClass = 'table-dark'; accessLevel = 'Public';
            break;
          case 'cesium': tableClass = 'table-warning'; accessLevel = 'Limited Access';
            break;
          case 'chain': tableClass = 'table-warning'; accessLevel = 'Limited Access';
            break;
          case 'contributors': tableClass = 'table-warning'; accessLevel = 'Limited Access';
            break;
          case 'currency': tableClass = 'table-warning'; accessLevel = 'Limited Access';
            break;
          case 'donations': tableClass = 'table-warning'; accessLevel = 'Limited Access';
            break;
          case 'reports': tableClass = 'table-warning'; accessLevel = 'Limited Access';
            break;
          case 'fundsnews': tableClass = 'table-warning'; accessLevel = 'Limited Access';
            break;
          case 'timestamp': tableClass = 'table-dark'; accessLevel = 'Public';
            break;
          case 'lookup': tableClass = 'table-dark'; accessLevel = 'Public';
            break;
          default: tableClass = 'table-success'; accessLevel = 'Minimal Access';

        }
          break;
        case 'user': switch (selectionData[selectionName]) {
          case 'attacks': tableClass = 'table-warning'; accessLevel = 'Limited Access';
            break;
          case 'attacksfull': tableClass = 'table-warning'; accessLevel = 'Limited Access';
            break;
          case 'basic': tableClass = 'table-dark'; accessLevel = 'Public';
            break;
          case 'battlestats': tableClass = 'table-warning'; accessLevel = 'Limited Access';
            break;
          case 'bazaar': tableClass = 'table-dark'; accessLevel = 'Public';
            break;
          case 'crimes': tableClass = 'table-dark'; accessLevel = 'Public';
            break;
          case 'discord': tableClass = 'table-dark'; accessLevel = 'Public';
            break;
          case 'display': tableClass = 'table-dark'; accessLevel = 'Public';
            break;
          case 'events': tableClass = 'table-warning'; accessLevel = 'Limited Access';
            break;
          case 'hof': tableClass = 'table-warning'; accessLevel = 'Limited Access';
            break;
          case 'log': tableClass = 'table-danger'; accessLevel = 'Full Access';
            break;
          case 'messages': tableClass = 'table-warning'; accessLevel = 'Limited Access';
            break;
          case 'money': tableClass = 'table-warning'; accessLevel = 'Limited Access';
            break;
          case 'networth': tableClass = 'table-warning'; accessLevel = 'Limited Access';
            break;
          case 'personalstats': tableClass = 'table-dark'; accessLevel = 'Public';
            break;
          case 'profile': tableClass = 'table-dark'; accessLevel = 'Public';
            break;
          case 'receivedevents': tableClass = 'table-warning'; accessLevel = 'Limited Access';
            break;
          case 'reports': tableClass = 'table-warning'; accessLevel = 'Limited Access';
            break;
          case 'stocks': tableClass = 'table-warning'; accessLevel = 'Limited Access';
            break;
          case 'timestamp': tableClass = 'table-dark'; accessLevel = 'Public';
            break;
          case 'lookup': tableClass = 'table-dark'; accessLevel = 'Public';
            break;
          default: tableClass = 'table-success'; accessLevel = 'Minimal Access';
        }
          break;
        default: tableClass = ''; accessLevel = '';

      }

      table = table + '<tr class="' + tableClass + '">'
        + '<td>' + selectionsEntry + '</td>'
        + '<td>' + selectionData[selectionName] + '</td>'
        + '<td>' + accessLevel + '</td>'
        + '</tr>';
    }
    //}
  }

  table = table + '</tbody></table>';

  $(document).ready(function () {
    $('#selections').DataTable({
      "paging": false,
      "order": [[0, "asc"], [1, "asc"]],
      "info": false,
      "stateSave": true
    });
  });

  document.getElementById(element).innerHTML = table;
}

function parseMembers(statusData, selection, element, membersList, ranked_wars, raid_wars) {

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

  const territory_wars = statusData['territory_wars'];
  let membersOnDefendingWall = ['WallMembers'];
  let membersOnAssaultingWall = ['WallMembers'];

  for (let i = 0; i < territory_wars.length; i++) {
    let territory_war = territory_wars[i];
    if (territory_war.assaulting_faction === statusData.ID)
      membersOnAssaultingWall = membersOnAssaultingWall.concat(territory_war.assaulters);
    if (territory_war.defending_faction === statusData.ID)
      membersOnDefendingWall = membersOnDefendingWall.concat(territory_war.defenders);
  }

  var levelRange = slider.noUiSlider.get();

  var printEntry = false;

  var table = '<div class="col-sm-12 badge-primary" >  <b>Members Status of <img src="https://factiontags.torn.com/'
    + statusData.tag_image + '"> '
    + statusData.name
    + ' [' + statusData.ID + ']'
    + '';
  table = table + '</div></b>';
  table += '<div class="col-sm-12 badge-secondary" ><img alt="Reload" title="Reload" src="images/svg-icons/refresh.svg" height="25" onclick="userSubmit(\'members\')">'
    + '&nbsp;<img alt="select table content" title="select table content" src="images/svg-icons/text-selection.svg" height="25" onclick="selectElementContents(document.getElementById(\'members\'));">';

  if (integrateFactionStats) table += '&nbsp;<img alt="Get Faction Stats" title="Get Faction Stats from TornStats" src="images/svg-icons/stats.svg" height="25" onclick="callTornStatsAPI(\'' + trustedApiKey + '\', ' + statusData.ID + ', \'faction\', ' + cacheStats + ')"';

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
  if (integrateFactionStats) table = table + '<th>Torn Stats&nbsp;&nbsp;</th>';
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

  for (var id in membersList) {

    printEntry = false;
    statusDescriptionText = '';

    var member = membersList[id];
    var memberStatusState = member.status.state;
    var hospitalTime = '';
    var isOnAssaultingWall = membersOnAssaultingWall.includes(parseInt(id));
    var isOnDefendingngWall = membersOnDefendingWall.includes(parseInt(id));

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

    if (memberStatusState == 'Hospital') {
      timeDifference = (member.status.until - timeStamp);

      dateObj = new Date(timeDifference * 1000);
      hours = dateObj.getUTCHours();
      minutes = dateObj.getUTCMinutes();
      seconds = dateObj.getSeconds();

      //timeString = hours.toString().padStart(2, '0') + ' hrs ' +
      //    minutes.toString().padStart(2, '0') + ' min ' +
      //    seconds.toString().padStart(2, '0') + ' sec';
      if (hours.toString() == 0) {
        hours = hours.toString().padStart(2, '0') + ' hrs ';
      } else {
        hours = hours.toString().padStart(2, '0') + ' hrs ';
      }

      if (minutes.toString() == 0) {
        minutes = minutes.toString().padStart(2, '0') + ' min ';
      } else {
        minutes = minutes.toString().padStart(2, '0') + ' min ';
      }

      if (seconds.toString() == 0) {
        seconds = seconds.toString().padStart(2, '0') + ' sec ';
      } else {
        seconds = seconds.toString().padStart(2, '0') + ' sec ';
      }
      timeString = hours + minutes + seconds;


      statusDescriptionText = 'In hospital for ' + timeString;
      hospitalTime = ' out in ' + timeString;


    } else {
      statusDescriptionText = member.status.description.replace('to Torn ', '');
    }

    var memberLastActionTimestamp = (timeStamp - member.last_action.timestamp);
    var memberLastAction = '';

    if (filterMinutesAction > memberLastActionTimestamp / 60) {
      printEntry = false;
    }


    dateObj = new Date(memberLastActionTimestamp * 1000);
    hours = dateObj.getUTCHours();
    minutes = dateObj.getUTCMinutes();
    seconds = dateObj.getSeconds();

    if (member.last_action.relative.includes('day')) {
      memberLastAction = 'Days ago: ' + member.last_action.relative.split(" ")[0];
    } else {
      if (hours.toString() == 0) {
        hours = '<span class="text-secondary">' + hours.toString().padStart(2, '0') + ' hrs </span>';
      } else {
        hours = hours.toString().padStart(2, '0') + ' hrs ';
      }

      if (minutes.toString() == 0) {
        minutes = '<span class="text-secondary">' + minutes.toString().padStart(2, '0') + ' min </span>';
      } else {
        minutes = minutes.toString().padStart(2, '0') + ' min ';
      }

      if (seconds.toString() == 0) {
        seconds = '<span class="text-secondary">' + seconds.toString().padStart(2, '0') + ' sec </span>';
      } else {
        seconds = seconds.toString().padStart(2, '0') + ' sec ';
      }
      memberLastAction = hours + minutes + seconds;
    }

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
    if (isOnAssaultingWall) {
      icon = icon + '<img src="images/icon_wall_assault.png" alt="On Wall" title="On Wall" width="20" height="20"/>&nbsp;';
    }
    if (isOnDefendingngWall) {
      icon = icon + '<img src="images/icon_wall_defend.png" alt="On Wall" title="On Wall" width="20" height="20"/>&nbsp;';
    }

    if (statusList.includes(member.last_action.status)
      && detailsList.includes(memberStatusState)
      && printEntry
      && (!document.getElementById(member.position) || document.getElementById(member.position).checked)
      && (member.level >= levelRange[0] && member.level <= levelRange[1])) {

      var copyableText = ' >> ' + member.name + ' << ' + hospitalTime.replace(' hrs ', ':').replace(' min ', ':').replace(' sec ', '') + ' || https://www.torn.com/loader.php?sid=attack&user2ID=' + id;

      table = table + '<tr>'

        + '<td class="align-middle"><a href="https://www.torn.com/profiles.php?XID=' + id + '" target="_blank">' + member.name + '<br/>[' + id + ']</a><br/></td>'
        + '<td class="align-middle">' + icon + '</td>'
        + '<td class="align-middle">'
        + '<div class="link-group" role="group">'
        + '<a class="btn btn-link btn-sm" role="button" href="https://www.torn.com/loader.php?sid=attack&user2ID=' + id + '" target="_blank"><img alt="Attack" title="Attack" src="images/svg-icons/attack2.svg" height="25"></a>&nbsp;'
        //+ '<button type="button" onclick="copyButton(' + id + ')" class="btn btn-secondary btn-sm" id="copy-button' + id + '" data-toggle="tooltip" data-placement="button" title="Copy for Faction Chat">'
        + '<img alt="Copy" title="Copy" src="images/svg-icons/copy.svg" height="25" onclick="copyButton(' + id + ')">'
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
        table = table + '<td class="align-middle" id="stats_' + id + '" >' + stat + '</td>';
      }

      table = table + '<td class="align-middle">'
        + '<img alt="Show Stats" title="Show Stats" src="images/svg-icons/stats.svg" height="25" onclick="callTornStatsAPI(\'' + trustedApiKey + '\', ' + id + ', \'user\', false)" data-toggle="modal" data-target="#statsModal">'
        //+ '<button type="button" onclick="callTornStatsAPI(\'' + trustedApiKey + '\', ' + id + ', \'user\', false)" class="btn btn-secondary btn-sm" data-toggle="modal" data-target="#statsModal">Show Stats</button>'
        + '</td>'

      filteredMembers++;
    }

    table = table + '</tr>';
    countMembers++;
  }
  table = table + '</tbody></table>';

  $(document).ready(function () {
    $('#members').DataTable({
      "paging": false,
      "order": [[5, "asc"]],
      "info": false,
      "stateSave": true
    });
  });

  if (!document.getElementById(member.position)) generatePositionCheckboxes(uniquePositions);

  document.getElementById(element).innerHTML = table;

  var ts = new Date(timeStamp * 1000);
  var formatted_date = ts.toISOString().replace('T', ' ').replace('.000Z', '');

  const summary = `<span class="text-primary">${filteredMembers} members out of ${countMembers} total members filtered.</span> <span class="text-muted">Last refreshed: ${formatted_date}</span><div class="war-info"></div>`;
  document.getElementById('summary').innerHTML = summary;

  let war_info = '';
  const rankedWar = Object.values(ranked_wars)[0];
  if (rankedWar) {
    const factionIDs = Object.keys(rankedWar.factions);
    const faction1ID = factionIDs[0];
    const faction2ID = factionIDs[1];
    console.log(faction1ID, faction2ID, statusData.ID);

    if (faction1ID != statusData.ID.toString()) war_info += `<div>Ranked war opponent: <a href="members.html?factionID=${faction1ID}">${rankedWar.factions[faction1ID].name} [${faction1ID}]</a></div>`;
    if (faction2ID != statusData.ID.toString()) war_info += `<div>Ranked war opponent: <a href="members.html?factionID=${faction2ID}">${rankedWar.factions[faction2ID].name} [${faction2ID}]</a></div>`;
  }

  if (Array.isArray(raid_wars) && raid_wars.length > 0) {

    for (const raidWar of raid_wars) {
      console.log(raidWar['raiding_faction'], statusData.ID);
      if (raidWar['raiding_faction'] === statusData.ID) {
        war_info += `<div>Raid war opponent: <a href="members.html?factionID=${raidWar['defending_faction']}">${raidWar['defending_faction']}</a></div>`
      }
      if (raidWar['defending_faction'] === statusData.ID) {
        war_info += `<div>Raid war opponent: <a href="members.html?factionID=${raidWar['raiding_faction']}">${raidWar['raiding_faction']}</a></div>`
      }
    }
  }
  if (war_info.length > 0) {
    const button = `<button onclick="hideElementByID('war-details')" class="btn btn-outline-secondary btn-sm" id="btnHideWarDetails">Hide&nbsp;Details</button>`;
    document.getElementById('war-info').innerHTML = '<div class="war-details" id="war-details">' + war_info + '</div>' + button;
  }
}

function generatePositionCheckboxes(uniquePositions) {
  var additionalFiltersDiv = document.getElementById('additionalFilters');
  var positionCheckboxes = '';

  positionCheckboxes += '<legend>Positions</legend>';
  positionCheckboxes += '<fieldset class="form-group">';

  uniquePositions.forEach(function (position) {
    positionCheckboxes += '<div class="form-check">';
    positionCheckboxes += '<input class="form-check-input" type="checkbox" value="' + position + '" name="position" id="' + position + '" checked />';
    positionCheckboxes += '<label class="form-check-label" for="' + position + '">' + position + '</label>';
    positionCheckboxes += '</div>';
  });

  positionCheckboxes += '</fieldset>';

  additionalFiltersDiv.innerHTML = positionCheckboxes;
}


function parseNews(newsData, selection, element, membersList) {

  document.getElementById('summary').innerHTML = `You are looking for ${selection}.`;

  var table = '<div class="col-sm-12 badge-primary" ><b> ' + selection + '</b></div>';
  table = table + '<br /><table class="table table-hover" id="news"><thead><tr>'
    + '<th>Date</th>'
    + '<th>News</th>';

  table = table + '</tr></thead><tbody>';

  for (var id in newsData) {

    var news = newsData[id];
    var ts = new Date(news.timestamp * 1000);
    var formatted_date = ts.toISOString().replace('T', ' ').replace('.000Z', '');

    table = table + '<tr>'
      + '<td>' + formatted_date + '</td>'
      + '<td>' + news.news + '</td>';

    table = table + '</tr>';

  }
  table = table + '</tbody></table>';

  $(document).ready(function () {
    $('#news').DataTable({
      "paging": false,
      "order": [[0, "desc"]],
      "info": false,
      "stateSave": true
    });
  });
  document.getElementById(element).innerHTML = table;

}

function getWarringFactions(rankedWarData, selection, element, rankedWars) {

  var datalist = '';

  for (var id in rankedWars) {

    var rankedWar = rankedWars[id];

    for (var factionID in rankedWar.factions) {

      var faction = rankedWar.factions[factionID];

      if (!datalist.includes(faction.name)) {
        datalist = datalist + '<option value="' + factionID + '">' + faction.name + '</option>';
      }


    }
  }

  document.getElementById("hint2").innerHTML = 'Factions in a ranked war can be searched for.';
  document.getElementById("factions").innerHTML = datalist;


}

function parseReports(reportData, element, membersList) {

  var type = '';
  var header = '';

  if (document.getElementById('money').checked) {
    type = 'money';
    header = 'Money Reports'
  }
  if (document.getElementById('stats').checked) {
    type = 'stats';
    header = 'Stat Spies'
  }
  if (document.getElementById('friendorfoe').checked) {
    type = 'friendorfoe';
    header = 'Friend or Foe Reports'
  }

  document.getElementById('summary').innerHTML = 'You are looking for ' + header + '.';

  var table = '<div class="col-sm-12 badge-primary" ><b> ' + header + '</b></div>';
  table = table + '<table class="table table-hover"><thead><tr>'
    + '<th>Date</th>'
    + '<th>Member</th>'
    + '<th>Type</th>'
    + '<th>Target</th>';

  if (type === 'money') {
    table = table + '<th>Money</th>';
  }

  if (type === 'stats') {
    table = table + '<th>Total</th>';
    table = table + '<th>Str</th>';
    table = table + '<th>Def</th>';
    table = table + '<th>Spd</th>';
    table = table + '<th>Dex</th>';

  }

  table = table + '</tr></thead><tbody>';


  for (var id in reportData) {
    var report = reportData[id];
    if (report.type === type) {

      var ts = new Date(report.timestamp * 1000);
      var formatted_date = ts.toISOString().replace('T', ' ').replace('.000Z', '');

      table = table + '<tr>'
        + '<td>' + formatted_date + '</td>'
        + '<td><a href="https://www.torn.com/profiles.php?XID=' + report.user_id + '" target="_blank">' + membersList[report.user_id].name + '</a></td>'
        + '<td>' + header + '</td>'
        + '<td><a href="https://www.torn.com/profiles.php?XID=' + report.target + '" target="_blank">' + report.target + '</a></td>';

      if (type === 'money') {
        table = table + '<td>$' + report.report.money.toLocaleString('en-US') + '</td>'
      }

      if (type === 'stats') {
        if (report.report.hasOwnProperty('total_battlestats')) {
          table = table + '<td>' + report.report.total_battlestats.toLocaleString('en-US') + '</td>';
        } else {
          table = table + '<td>N/A</td>';
        }

        if (report.hasOwnProperty('strength')) {
          table = table + '<td>' + report.report.strength.toLocaleString('en-US') + '</td>';
        } else {
          table = table + '<td>N/A</td>';
        }

        if (report.hasOwnProperty('defense')) {
          table = table + '<td>' + report.report.defense.toLocaleString('en-US') + '</td>';
        } else {
          table = table + '<td>N/A</td>';
        }

        if (report.hasOwnProperty('speed')) {
          table = table + '<td>' + report.report.speed.toLocaleString('en-US') + '</td>';
        } else {
          table = table + '<td>N/A</td>';
        }

        if (report.hasOwnProperty('dexterity')) {
          table = table + '<td>' + report.report.dexterity.toLocaleString('en-US') + '</td>';
        } else {
          table = table + '<td>N/A</td>';
        }
      }


      table = table + '</tr>';
    }
  }
  table = table + '</tbody></table>';
  document.getElementById(element).innerHTML = table;

}

function checkAPIKey() {
  var trustedApiKey = document.getElementById("trustedkey").value;

  if (trustedApiKey.length == 16) {

    callTornAPI(trustedApiKey, 'torn', 'rankedwars', 'getWarringFactions');

  }
}

function loadKeyFromLocalStorage() {
  if (storageAvailable('localStorage') && typeof (Storage) !== "undefined") {
    let localStorageApiKey = localStorage.getItem('api_key') || "";
    if (sessionStorage.trustedApiKey === '' || !sessionStorage.trustedApiKey) {
      sessionStorage.trustedApiKey = localStorageApiKey;
    }
  }
}


function loadFiltersFromLocalStorage() {
  if (storageAvailable('localStorage') && typeof (Storage) !== "undefined") {
    let localStorageDetailsList = localStorage.getItem('detailsList') || "";
    if (sessionStorage.detailsList === '' || !sessionStorage.detailsList) {
      sessionStorage.detailsList = localStorageDetailsList;
    }

    let localStorageStatusList = localStorage.getItem('statusList') || "";
    if (sessionStorage.statusList === '' || !sessionStorage.statusList) {
      sessionStorage.statusList = localStorageStatusList;
    }
  }
}






function copyFilterAsURL(selection) {

  if (selection == 'members') {
    var siteUrl = "https://tornengine.netlify.app/members.html";

    const markedCheckboxStatus = document.getElementsByName('status');
    const markedCheckboxDetails = document.getElementsByName('details');
    const activityCheckbox = document.getElementById('FilterActive');
    const factionIDInput = document.getElementById('factionid').value;


    var statusList = "";
    var detailsList = "";
    var activityFilter = "";
    var factonID = "";

    for (var checkbox of markedCheckboxStatus) {
      if (checkbox.checked && checkbox.value != "FilterActive") {
        statusList = statusList + checkbox.value + ",";
      }
    }

    for (var checkbox of markedCheckboxDetails) {
      if (checkbox.checked) {
        detailsList = detailsList + checkbox.value + ",";
      }
    }

    if (activityCheckbox.checked) {
      activityFilter = document.getElementById('TimeActive').value;
    }

    if (statusList != "") {
      statusList = "&status=" + statusList.substring(0, statusList.length - 1);
    }
    if (detailsList != "") {
      detailsList = "&details=" + detailsList.substring(0, detailsList.length - 1);
    }

    if (activityFilter != "") {
      activityFilter = "&lastactive=" + activityFilter;
    }

    if (factionIDInput != "") {
      factonID = "&factionID=" + factionIDInput;
    }

    siteUrl = replaceFirstAmpersandWithQuestionMark(siteUrl + statusList + detailsList + activityFilter + factonID);

    console.log(siteUrl);

    setTimeout(function () {
      navigator.clipboard.writeText(siteUrl);
    }, 1000);

  }
}


function copyButton(memberID, factionID = '') {

  var statsElement = document.getElementById('stats_a_' + memberID);
  var stats = '';

  if (statsElement) {
    stats = document.getElementById('stats_a_' + memberID).innerHTML.replaceAll(',', '');
    stats = ' || ' + abbreviateNumber(stats);
  }


  userSubmit('members');

  setTimeout(function () {
    var copyText = document.getElementById('copy-input-' + memberID);
    navigator.clipboard.writeText(copyText.value + stats);
  }, 1000);
}



(function () {
  loadKeyFromSession();
})();

