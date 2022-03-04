function userSubmit(selection) {
	var trustedApiKey = document.getElementById("trustedkey").value;

	sessionStorage.trustedApiKey = trustedApiKey;

	if (trustedApiKey === '') {
		printAlert('Warning', 'You might want to enter your API key if you expect this to work...');
	} else {
		if (selection == 'pa_payouts')  {
			callTornAPI(trustedApiKey, 'faction', 'basic,crimes', 'pa_payouts');
		}

		if (selection == 'oc_overview') {
			callTornAPI(trustedApiKey, 'faction', 'basic,crimes', 'oc_overview'); 
		}

		if (selection == 'reports')     {
			callTornAPI(trustedApiKey, 'faction', 'basic,reports', 'reports'); 
		}

		if (selection == 'members')     {
			callTornAPI(trustedApiKey, 'faction', 'basic', 'members');
		}

		if (selection == 'news')        {
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
		
		document.getElementById('submit').innerHTML = 'Refresh';
	}

}

function callTornStatsAPI(key, id) {
	document.getElementById('statsModalLabel').innerHTML = 'Calling TornStats API';
	document.getElementById('statsModalBody').innerHTML =  'Please hold the line...';

	var request = new XMLHttpRequest();

	request.open('GET', 'https://www.tornstats.com/api/v2/' + key + '/spy/user/' + id, true);

	request.onload = function () {

		var jsonData = JSON.parse(this.response);

		if (request.status >= 200 && request.status < 400) {

			if (jsonData.message.includes("ERROR")) {
				document.getElementById('statsModalLabel').innerHTML = 'Error Occurred';
				document.getElementById('statsModalBody').innerHTML = '<div class="alert alert-warning"><strong>Warning: </strong>Calling TornStats failed.</div>'
																		+ '<br />Please make sure to use the same API Key as confiured in <a href="https://beta.tornstats.com/settings/general" target="_blank">TornStats</a>.';
			} else {
				if (jsonData.spy.message.includes("Spy not found.")) {
					document.getElementById('statsModalLabel').innerHTML = 'Spy not found';
					document.getElementById('statsModalBody').innerHTML = '<div class="alert alert-info"><strong>Warning: </strong>Spy not found.</div>';
					
				} else {
			
			var ts = new Date(jsonData.spy.timestamp * 1000);
			var formatted_date =  ts.toISOString().replace('T',' ').replace('.000Z','');
			
			
			document.getElementById('statsModalLabel').innerHTML = '<strong>Player:</strong> ' + jsonData.spy.player_name + ' [' + jsonData.spy.player_id + ']';
			document.getElementById('statsModalBody').innerHTML = '<div class="text-muted"><strong>Strength:</strong> ' + jsonData.spy.strength.toLocaleString('en-US') + '</div>'
					+ '<div class="text-muted"><strong>Defense:</strong> ' + jsonData.spy.defense.toLocaleString('en-US') + '</div>'
					+ '<div class="text-muted"><strong>Speed:</strong> ' + jsonData.spy.speed.toLocaleString('en-US') + '</div>'
					+ '<div class="text-muted"><strong>Dexterity:</strong> ' + jsonData.spy.dexterity.toLocaleString('en-US') + '</div>'
					+ '<div class="text-primary"><strong>Total:</strong> ' + jsonData.spy.total.toLocaleString('en-US') + '</div>'
					+ '<div class="text-muted"><strong>Date of spy:</strong> ' + formatted_date + '</div>'
					+ '<div class="text-muted"><strong>Type:</strong> ' + jsonData.spy.type + '</div>'
					+ '<br /><br /><a href="https://www.torn.com/loader.php?sid=attack&user2ID=' + jsonData.spy.player_id + '" target="_blank">https://www.torn.com/loader.php?sid=attack&user2ID=' + jsonData.spy.player_id +  '</a>';
			}
			}

		} else {
			printAlert('#chedded', 'Torn Stats API is currently not available.');
		}
	}
	request.send();
}

function callTornAPI(key, part, selection, source) {

	var factionid = '';

	if (source == 'members') factionid = document.getElementById("factionid").value;
	
	sessionStorage.factionid = factionid;

	var request = new XMLHttpRequest();

	request.open('GET', 'https://api.torn.com/' + part + '/' + factionid +'?selections=' + selection + '&key=' + key + '&comment=tornengine', true);

	request.onload = function () {

		var jsonData = JSON.parse(this.response);

		if (request.status >= 200 && request.status < 400) {
			
			if (jsonData.hasOwnProperty('error')){
				if (jsonData['error'].code === 7) {
					printAlert('Warning', 'You are trying to access sensible faction data, but are not allowed to. Ask your faction leader for faction API permissions.');
				} else if (jsonData['error'].code === 2) {
					printAlert('Error', 'You are using an incorrect API key.');
				} else {
					printAlert('Error', 'Torn API returned the following error: ' + jsonData['error'].error);
				}
			} else {

				if (selection === 'basic,crimes' && source === 'pa_payouts') {
					if (jsonData.hasOwnProperty('crimes') && jsonData.hasOwnProperty('members')){
						printAlert('Success', 'The API Call successful, find the results below.');

						parsePayouts(jsonData['crimes'], 'output', jsonData['members']);
					} else {
						printAlert('Warning', 'Ask your faction leader for faction API permissions.');
					}
				}

				if (selection === 'basic,crimes' && source === 'oc_overview') {
					if (jsonData.hasOwnProperty('crimes') && jsonData.hasOwnProperty('members')){
						printAlert('Success', 'The API Call successful, find the results below.');

						parseOCs(jsonData['crimes'], 'output', jsonData['members']);
					} else {
						printAlert('Warning', 'Ask your faction leader for faction API permissions.');
					}
				}

				if (selection === 'basic,reports' && source === 'reports') {
					if (jsonData.hasOwnProperty('reports') && jsonData.hasOwnProperty('members')){
						printAlert('Success', 'The API Call successful, find the results below.');
						
						parseReports(jsonData['reports'], 'output', jsonData['members']);
					} else {
						printAlert('Warning', 'Ask your faction leader for faction API permissions.');
					}
				}

				if (selection === 'basic,reports' && source === 'reports') {
					if (jsonData.hasOwnProperty('reports')){
						printAlert('Success', 'The API Call successful, find the results below.');
						parseReports(jsonData['reports'], 'output', jsonData.name);

					}
				}

				if (selection === 'basic,attacks' && source === 'attacks') {
					if (jsonData.hasOwnProperty('attacks')){
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
					parseMembers(jsonData, selection, 'output', jsonData['members']);
				}
			}

		} else {
			printAlert('#chedded', 'Torn API is currently not available.');
		}
	}
	request.send();
}	

function parseMembers (statusData, selection, element, membersList) {
	
	var trustedApiKey = document.getElementById("trustedkey").value;

	var statusList = '';
	if (document.getElementById('Online').checked) {
		statusList = document.getElementById('Online').value + ', ' + statusList;
	}
	if (document.getElementById('Idle').checked) {
		statusList = document.getElementById('Idle').value + ', ' + statusList;
	}
	if (document.getElementById('Offline').checked) {
		statusList = document.getElementById('Offline').value + ', ' + statusList;
	}

	var detailsList = '';
	if (document.getElementById('Hospital').checked) {
		detailsList = document.getElementById('Hospital').value + ', ' + detailsList;
	}
	if (document.getElementById('Okay').checked) {
		detailsList = document.getElementById('Okay').value + ', ' + detailsList;
	}
	if (document.getElementById('Jail').checked) {
		detailsList = document.getElementById('Jail').value + ', ' + detailsList;
	}
	if (document.getElementById('Traveling').checked) {
		detailsList = document.getElementById('Traveling').value + ', ' + detailsList;
	}
	if (document.getElementById('Abroad').checked) {
		detailsList = document.getElementById('Abroad').value + ', ' + detailsList;
	}

	var filterMinutes = false;
	if (document.getElementById('Minutes').checked) {
		filterMinutes = true;
	}
	
	var printEntry = false;

	var table = '<div class="col-sm-12 badge-primary" ><b>Members Status of <img src="https://factiontags.torn.com/'
		+ statusData.tag_image + '"> '
		+ statusData.name 
		+ ' [' + statusData.ID + ']'
		+ '</b> <input type="button" class="btn btn-outline-light btn-sm" value="select table content" onclick="selectElementContents( document.getElementById(\'members\') );"></div>';
	
	
	table = table + '<br /><table class="table table-hover" id="members"><thead><tr>'
	+ '<th>Name</th>'
	+ '<th>Link</th>'
	+ '<th>Status</th>'
	+ '<th>Details</th>'
	+ '<th>Description</th>'
	+ '<th>Last Action</th>'
	+ '<th>Level</th>'
	+ '<th>Stats</th>';

	table = table + '</tr></thead><tbody>';

	var statusFormat = '';
	var detailFormat = '';
	var countMembers = 0;
	var filteredMembers = 0;
	var statusDescriptionText = '';
	
	
	var timeStamp = Math.floor(Date.now() / 1000);
	var timeDifference = 0;

	for( var id in membersList ){
		
		printEntry = false;
		statusDescriptionText = '';
		
		var member = membersList[id];

		if (member.last_action.status == 'Online')	statusFormat = 'badge-success';
		if (member.last_action.status == 'Idle')	statusFormat = 'badge-warning';
		if (member.last_action.status == 'Offline') statusFormat = 'badge-dark';

		if (member.status.state == 'Hospital') 	detailFormat = 'badge-danger';
		if (member.status.state == 'Okay') 		detailFormat = 'badge-success';
		if (member.status.state == 'Jail') 		detailFormat = 'badge-warning';
		if (member.status.state == 'Traveling') detailFormat = 'badge-info';
		if (member.status.state == 'Abroad')    detailFormat = 'badge-info';
		
		if ((filterMinutes && member.status.state == 'Hospital')
		     || (!filterMinutes && member.status.state == 'Hospital')
		     || (member.status.state !== 'Hospital')) {
			
			if (filterMinutes && member.status.state == 'Hospital') {
				timeDifference = (member.status.until - timeStamp) / 60;
				if (timeDifference < 15) {
					printEntry = true;
				}
			} else {
				printEntry = true;
			}
		}
		
		if (member.status.state == 'Hospital') {
			
			timeDifference = (member.status.until - timeStamp);
			
			dateObj = new Date(timeDifference * 1000);
			hours = dateObj.getUTCHours();
			minutes = dateObj.getUTCMinutes();
			seconds = dateObj.getSeconds();

			timeString = hours.toString().padStart(2, '0') + ' hrs ' + 
			    minutes.toString().padStart(2, '0') + ' min ' + 
			    seconds.toString().padStart(2, '0') + ' sec';
			statusDescriptionText = 'In hospital for ' + timeString;
			
			
			
		} else {
			statusDescriptionText = member.status.description;
		}

		if (statusList.includes(member.last_action.status)
				&& detailsList.includes(member.status.state)
				&& printEntry) {
			

			table = table + '<tr>'

			+'<td><a href="https://www.torn.com/profiles.php?XID=' + id + '" target="_blank">' + member.name + ' [' + id + ']</a></td>'
			+'<td><a href="https://www.torn.com/loader.php?sid=attack&user2ID=' + id + '" target="_blank">https://www.torn.com/loader.php?sid=attack&user2ID=' + id +  '</a></td>'
			+'<td>' + '<span class="badge badge-pill ' + statusFormat + '">' + member.last_action.status + '</span>' + '</td>'
			+'<td>' + '<span class="badge badge-pill ' + detailFormat + '">' + member.status.state + '</span>' + '</td>'
			+'<td>' + statusDescriptionText + '</td>'
			+'<td>' + member.last_action.relative + '</td>'
			+'<td>' + member.level + '</td>'
			+'<td>' 
			+'<button type="button" onclick="callTornStatsAPI(\'' + trustedApiKey + '\', ' + id + ')" class="btn btn-secondary" data-toggle="modal" data-target="#statsModal">Show Stats</button>'
			+'</td>'
			;
			filteredMembers++;
		}

		table = table + '</tr>';
		countMembers++;
	}	
	table = table + '</tbody></table>';
	
	$(document).ready(function() {
	    $('#members').DataTable( {
	        "paging":   false,
	        "order": [[ 4, "asc" ]],
	        "info":     false
	    } );
	} );
	
	document.getElementById(element).innerHTML = table;
	
	document.getElementById('summary').innerHTML = filteredMembers  + ' members out of ' + countMembers + ' total members filtered.';

}

function parseNews (newsData, selection, element, membersList) {

	document.getElementById('summary').innerHTML = 'You are looking for ' + selection + '.';

	var table = '<div class="col-sm-12 badge-primary" ><b> ' + selection + '</b></div>';
	table = table + '<br /><table class="table table-hover" id="news"><thead><tr>'
	+ '<th>Date</th>'
	+ '<th>News</th>';

	table = table + '</tr></thead><tbody>';

	for( var id in newsData ){

		var news = newsData[id];
		var ts = new Date(news.timestamp * 1000);
		var formatted_date =  ts.toISOString().replace('T',' ').replace('.000Z','');

		table = table + '<tr>'
		+'<td>' + formatted_date + '</td>'
		+'<td>' + news.news + '</td>';

		table = table + '</tr>';

	}	
	table = table + '</tbody></table>';
	
	$(document).ready(function() {
	    $('#news').DataTable( {
	        "paging":   false,
	        "order": [[ 0, "desc" ]],
	        "info":     false
	    } );
	} );
	document.getElementById(element).innerHTML = table;

}

function parseReports (reportData, element, membersList) {

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
		table = table +'<th>Money</th>';
	}

	if (type === 'stats') {
		table = table +'<th>Total</th>';
		table = table +'<th>Str</th>';
		table = table +'<th>Def</th>';
		table = table +'<th>Spd</th>';
		table = table +'<th>Dex</th>';

	}

	table = table + '</tr></thead><tbody>';


	for( var id in reportData ){
		var report = reportData[id];
		if (report.type === type) {

			var ts = new Date(report.timestamp * 1000);
			var formatted_date =  ts.toISOString().replace('T',' ').replace('.000Z','');

			table = table + '<tr>'
			+'<td>' + formatted_date + '</td>'
			+'<td><a href="https://www.torn.com/profiles.php?XID=' + report.user_id + '" target="_blank">' + membersList[report.user_id].name + '</a></td>'
			+'<td>' + header + '</td>'
			+'<td><a href="https://www.torn.com/profiles.php?XID=' + report.target + '" target="_blank">' + report.target + '</a></td>';

			if (type === 'money') {
				table = table +'<td>$' + report.report.money.toLocaleString('en-US') + '</td>'
			}

			if (type === 'stats') {
				if (report.report.hasOwnProperty('total_battlestats')) {
					table = table +'<td>' + report.report.total_battlestats.toLocaleString('en-US') + '</td>';
				} else {
					table = table +'<td>N/A</td>';
				}

				if (report.hasOwnProperty('strength')) {
					table = table +'<td>' + report.report.strength.toLocaleString('en-US') + '</td>';
				} else {
					table = table +'<td>N/A</td>';
				}

				if (report.hasOwnProperty('defense')) {
					table = table +'<td>' + report.report.defense.toLocaleString('en-US') + '</td>';
				} else {
					table = table +'<td>N/A</td>';
				}

				if (report.hasOwnProperty('speed')) {
					table = table +'<td>' + report.report.speed.toLocaleString('en-US') + '</td>';
				} else {
					table = table +'<td>N/A</td>';
				}

				if (report.hasOwnProperty('dexterity')) {
					table = table +'<td>' + report.report.dexterity.toLocaleString('en-US') + '</td>';
				} else {
					table = table +'<td>N/A</td>';
				}
			}


			table = table + '</tr>';
		}
	}	
	table = table + '</tbody></table>';
	document.getElementById(element).innerHTML = table;

}

function parsePayouts (crimeData, element, membersList) {

	var memberMoney = {};
	var memberSuccess = {};
	var memberFailed = {};
	var factionMoney = 0;
	var factionSuccess = 0;
	var factionFailed = 0;
	var totalRespect = 0;
	var totalMoney = 0;
	var today = new Date();
	var badgeSuccess = 'badge-dark';
	var badgeFailed = 'badge-dark';

	if (document.getElementById('current').checked) {
		var currentMonth = today.getMonth() + 1;
		if (currentMonth > 11) { currentMonth = 0; }
	}
	if (document.getElementById('last').checked) {
		var currentMonth = today.getMonth();
		if (currentMonth == 0) { currentMonth = 12; }
	}
	if (document.getElementById('before').checked) {
		var currentMonth = today.getMonth() - 1;
		if (currentMonth == 0) { currentMonth = 12; }
		if (currentMonth < 0) { currentMonth = 11; }
	}

	var split = document.getElementById('range').value;
	var weighted = document.getElementById('weighted').checked;
	var paLeads = '';


	var table = '<div class="col-sm-12 badge-primary" ><b>PA Details for ' + monthToText(currentMonth) + '</b> <input type="button" class="btn btn-outline-light btn-sm" value="select table content" onclick="selectElementContents( document.getElementById(\'totals\') );"></div>';
	table = table + '<br />';
	table = table + '<table class="table table-hover" id="totals"><thead><tr>'
	+ '<th>Date</th>'
	+ '<th>Participants</th>'
	+ '<th>Crime Type</th>'
	+ '<th>Result</th>'
	+ '<th>Money Gained<br/>'
	+ '<th>Respect Gained</th>'
	+ '</tr></thead><tbody>';

	for( var id in crimeData ){
		var crime = crimeData[id];
		// 8 = PA
		if (crime.crime_id === 8) { 
			var ts = new Date(crime.time_completed * 1000);

			if (crime.initiated === 1 && ts.getMonth()+1 === currentMonth) {

				var crimeResult = '';
				var failed = 0;
				var success = 0;
				var participants = '';
				var tmp = '';
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
						if (weighted) {
							prefix = countRank  + '| ';
						}

						var memberName =  '';
						if (JSON.stringify(membersList).indexOf(memberID) != -1) {
							memberName = prefix + membersList[memberID].name ;
							if (weighted && prefix === '1| '){
								if (!paLeads.includes(memberName))
									paLeads = memberName + ';' + paLeads;
							}
							if (memberName in memberMoney) {
								memberMoney[memberName] = memberMoney[memberName] + (crime.money_gain / split);
								memberSuccess[memberName] = memberSuccess[memberName] +success;
								memberFailed[memberName] = memberFailed[memberName] + failed;
							} else {
								memberMoney[memberName] = (crime.money_gain / split);
								memberSuccess[memberName] = success;
								memberFailed[memberName] = failed;
							}
						} else {
							memberName = memberID;
							
							if (memberName in memberMoney) {
								memberMoney[memberName] = memberMoney[memberName] + (crime.money_gain / split);
								memberSuccess[memberName] = memberSuccess[memberName] +success;
								memberFailed[memberName] = memberFailed[memberName] + failed;
							} else {
								memberMoney[memberName] = (crime.money_gain / split);
								memberSuccess[memberName] = success;
								memberFailed[memberName] = failed;
							}
						}

						if (participants === '') {
							participants = memberName;

						} else {
							participants = participants + ', ' + memberName;
						}
					});
				});

				if (weighted)
					factionMoney = factionMoney + (crime.money_gain)

					else {
						if (split == 5) {factionMoney = factionMoney + (crime.money_gain / split);}
						if (split == 4) {factionMoney = 0;}
					}

				factionSuccess = factionSuccess + success;
				factionFailed = factionFailed + failed;
				totalRespect = totalRespect + crime.respect_gain;
				totalMoney = totalMoney + crime.money_gain;

				var formatted_date =  ts.toISOString().replace('T',' ').replace('.000Z','');

				table = table + '<tr>'
				+'<td>' + formatted_date + '</td>'
				+'<td>' + participants + '</td>'
				+'<td>' + crime.crime_name + '</td>'
				+'<td>' + crimeResult + '</td>'
				+'<td>$' + crime.money_gain.toLocaleString('en-US') + '</td>'
				+'<td>' + crime.respect_gain + '</td>'
				+'</tr>';
			}
		}
	}

	if (factionFailed > 0) {badgeFailed = 'badge-danger';}
	if (factionSuccess > 0) {badgeSuccess = 'badge-success';}

	table = table + '<tr class="table-dark">' 
	+'<td colspan = "3">Totals</td>'
	+'<td>' 
	+ '<span class="badge badge-pill '+badgeFailed+'">'+ factionFailed + '</span>-'
	+ '<span class="badge badge-pill '+badgeSuccess+'">'+ factionSuccess + '</span>'
	+'</td>'
	+'<td>$' + totalMoney.toLocaleString('en-US') + '</td>'
	+'<td>' + totalRespect + '</td>'
	+'</tr>';

	table = table + '</tbody></table>';
	document.getElementById(element).innerHTML = table;

	var multiplier = 0;
	var numberOfTeams = paLeads.split(';').length-1;

	var summary = '<div class="col-sm-12 badge-primary" ><b>Individual results for ' + monthToText(currentMonth) + '</b> <input type="button" class="btn btn-outline-light btn-sm" value="select table content" onclick="selectElementContents( document.getElementById(\'individual\') );"></div>';
	summary = summary + '<br />';
	summary = summary + '<table class="table table-hover" id="individual"><thead><tr>'
	+ '<th>Name</th>';

	if (weighted) {
		summary = summary + '<th>Money earned (weighted per PA rank)</th>';
	} else {
		summary = summary + '<th>Money earned (<sup>1</sup>/<sub>' + split + '</sub>th of result)</th>';
	}

	summary = summary + '<th>Fail</th>'
	+ '<th>Success</th>'
	+ '</tr></thead><tbody>';

	memberMoney = sortObj(memberMoney);

	for (var name in memberMoney) {
		if (memberFailed[name] > 0)  {badgeFailed  = 'badge-danger';  } else {badgeFailed  = 'badge-dark';}
		if (memberSuccess[name] > 0) {badgeSuccess = 'badge-success';} else {badgeSuccess = 'badge-dark';}

		if (name.startsWith('1|')) multiplier = 0.4 / numberOfTeams;
		if (name.startsWith('2|')) multiplier = 0.3 / numberOfTeams;
		if (name.startsWith('3|')) multiplier = 0.2 / numberOfTeams;
		if (name.startsWith('4|')) multiplier = 0.1 / numberOfTeams;

		summary = summary + '<tr>' 
		+'<td>' + name + '</td>';

		if (!weighted) {
			summary = summary + '<td>' +' $' + memberMoney[name].toLocaleString('en-US') + '</td>';
		}
		else {
			summary = summary + '<td>' +' $' + (factionMoney * multiplier).toLocaleString('en-US') + '</td>';
		}

		summary = summary +'<td><span class="badge badge-pill '+badgeFailed+'">'+ memberFailed[name] + '</span></td>'
		+'<td><span class="badge badge-pill '+badgeSuccess+'">' + memberSuccess[name] + '</span></td>'
		+'</tr>';

	}
	badgeSuccess = 'badge-dark';
	badgeFailed = 'badge-dark';
	if (factionFailed > 0) {badgeFailed = 'badge-danger';}
	if (factionSuccess > 0) {badgeSuccess = 'badge-success';}
	summary = summary + '<tr class="table-dark">' 
	+'<td>Faction totals</td>'
	+'<td>' +' $' + factionMoney.toLocaleString('en-US') + '</td>'
	+'<td><span class="badge badge-pill '+badgeFailed+'">'+ factionFailed + '</span></td>'
	+'<td><span class="badge badge-pill '+badgeSuccess+'">'+ factionSuccess + '</span></td>'
	+'</tr>';
	summary = summary + '</tbody></table>';
	


	document.getElementById('summary').innerHTML = summary;

}

function parseOCs (crimeData, element, membersList) {

	var memberStatus = {};
	var memberSuccess = {};
	var memberFailed = {};
	var factionMoney = 0;
	var factionSuccess = 0;
	var factionFailed = 0;
	var totalRespect = 0;
	var totalMoney = 0;
	var today = new Date();
	var badgeSuccess = 'badge-dark';
	var badgeFailed = 'badge-dark';

	if (document.getElementById('current').checked) {
		var currentMonth = today.getMonth() + 1;
		if (currentMonth > 11) { currentMonth = 0; }
	}
	if (document.getElementById('last').checked) {
		var currentMonth = today.getMonth();
		if (currentMonth == 0) { currentMonth = 12; }
	}
	if (document.getElementById('before').checked) {
		var currentMonth = today.getMonth() - 1;
		if (currentMonth == 0) { currentMonth = 12; }
		if (currentMonth < 0) { currentMonth = 11; }
	}

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

	var table = '<div class="col-sm-12 badge-primary" ><b>Organized Crime Overview for ' + monthToText(currentMonth) + '</b> <input type="button" class="btn btn-outline-light btn-sm" value="select table content" onclick="selectElementContents( document.getElementById(\'totals\') );"></div>';
	table = table + '<br />';

	table = table + '<table class="table table-hover" id="members"><thead><tr>'
	+ '<th>Date</th>'
	+ '<th>Participants</th>'
	+ '<th>Crime Type</th>'
	+ '<th>Result</th>'
	+ '<th>Money Gained<br/>'
	+ '<th>Respect Gained</th>'
	+ '</tr></thead><tbody>';


	for( var id in crimeData ){
		var crime = crimeData[id];

		// console.log(crime.crime_name);
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

			if (crime.initiated === 1 && ts.getMonth()+1 === currentMonth) {

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

						var memberName =  '';
						if (JSON.stringify(membersList).indexOf(memberID) != -1) {
							memberName = membersList[memberID].name;
							if (memberName in memberStatus) {
								memberStatus[memberName] = memberStatus[memberName] + 1;
								memberSuccess[memberName] = memberSuccess[memberName] +success;
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

				var formatted_date =  ts.toISOString().replace('T',' ').replace('.000Z','');

				table = table + '<tr>'
				+'<td>' + formatted_date + '</td>'
				+'<td>' + participants + '</td>'
				+'<td>' + crime.crime_name + '</td>'
				+'<td>' + crimeResult + '</td>'
				+'<td>$' + crime.money_gain.toLocaleString('en-US') + '</td>'
				+'<td>' + crime.respect_gain + '</td>'
				+'</tr>';
			}
		}
	}

	if (factionFailed > 0) {badgeFailed = 'badge-danger';}
	if (factionSuccess > 0) {badgeSuccess = 'badge-success';}

	table = table + '<tr class="table-dark">' 
	+'<td colspan = "3">Totals</td>'
	+'<td>' 
	+ '<span class="badge badge-pill '+badgeFailed+'">'+ factionFailed + '</span>-'
	+ '<span class="badge badge-pill '+badgeSuccess+'">'+ factionSuccess + '</span>'
	+'</td>'
	+'<td>$' + totalMoney.toLocaleString('en-US') + '</td>'
	+'<td>' + totalRespect + '</td>'
	+'</tr>';

	table = table + '</tbody></table>';
	
	document.getElementById(element).innerHTML = table;
	

}

function printAlert(alertType, alertText) {
	var alertClass, apiKeyForm;
	if (alertType === 'Error')    { alertClass = 'alert-danger'; apiKeyForm = 'form-control is-invalid'; };
	if (alertType === 'Success')  { alertClass = 'alert-success'; apiKeyForm = 'form-control is-valid';  };
	if (alertType === 'Info')     { alertClass = 'alert-info'; apiKeyForm = 'form-control is-valid';  };
	if (alertType === 'Warning')  { alertClass = 'alert-warning'; apiKeyForm = 'form-control is-invalid';  };
	if (alertType === '#chedded') { alertClass = 'alert-danger'; apiKeyForm = 'form-control is-invalid';  };

	document.getElementById('alert').innerHTML = '<div class="alert ' + alertClass + '"><strong>' + alertType + ':</strong> ' + alertText + '</div>';
	document.getElementById('trustedkey').className  = apiKeyForm;
}

function sortObj(obj) {
	return Object.keys(obj).sort().reduce(function (result, key) {
		result[key] = obj[key];
		return result;
	}, {});
}

function monthToText(month) {
	const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	return monthNames[month-1];
}

function selectElementContents(el) {
	var body = document.body, range, sel;
	if (document.createRange && window.getSelection) {
		range = document.createRange();
		sel = window.getSelection();
		sel.removeAllRanges();
		try {
			range.selectNodeContents(el);
			sel.addRange(range);
		} catch (e) {
			range.selectNode(el);
			sel.addRange(range);
		}
	} else if (body.createTextRange) {
		range = body.createTextRange();
		range.moveToElementText(el);
		range.select();
	}
}

function loadKeyFromSession() {
	if (typeof(Storage) !== "undefined") {
		if (sessionStorage.factionid) {
			document.getElementById("factionid").value = sessionStorage.factionid;
		}
		if (sessionStorage.trustedApiKey) {
			document.getElementById("trustedkey").value = sessionStorage.trustedApiKey;
		}
	}
}

function disableElement(source, target) {
	document.getElementById(target).disabled = !document.getElementById(source).checked;
}