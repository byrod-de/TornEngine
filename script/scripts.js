	function userSubmitPAPayouts() {
		var trustedApiKey = document.getElementById("trustedkey").value;
		
		sessionStorage.trustedApiKey = trustedApiKey;
		//document.getElementById("debug").innerHTML = '<small>Debug only: API key used (to be removed after release): ' + trustedApiKey + '</small>';
		if (trustedApiKey === '') {
			printAlert('Warning', 'You might want to enter your API key if you expect this to work...');
		} else {
			callTornAPI(trustedApiKey, 'faction', 'basic,crimes', 'pa_payouts');
		}
	}
	
	function userSubmitOCOverview() {
		var trustedApiKey = document.getElementById("trustedkey").value;
		
		sessionStorage.trustedApiKey = trustedApiKey;
		//document.getElementById("debug").innerHTML = '<small>Debug only: API key used (to be removed after release): ' + trustedApiKey + '</small>';
		if (trustedApiKey === '') {
			printAlert('Warning', 'You might want to enter your API key if you expect this to work...');
		} else {
			callTornAPI(trustedApiKey, 'faction', 'basic,crimes', 'oc_overview');
		}
	}
	
	function userSubmitReports() {
		var trustedApiKey = document.getElementById("trustedkey").value;
		
		sessionStorage.trustedApiKey = trustedApiKey;
		//document.getElementById("debug").innerHTML = '<small>Debug only: API key used (to be removed after release): ' + trustedApiKey + '</small>';

		if (trustedApiKey === '') {
			printAlert('Warning', 'You might want to enter your API key if you expect this to work...');
		} else {
			callTornAPI(trustedApiKey, 'user', 'basic,reports', 'reports');
		}
	}
	
	function factionSubmitAttacks() {
		var trustedApiKey = document.getElementById("trustedkey").value;
		
		sessionStorage.trustedApiKey = trustedApiKey;
		//document.getElementById("debug").innerHTML = '<small>Debug only: API key used (to be removed after release): ' + trustedApiKey + '</small>';

		if (trustedApiKey === '') {
			printAlert('Warning', 'You might want to enter your API key if you expect this to work...');
		} else {
			parseAttacks(trustedApiKey, 'faction', 'basic,attacks', 'attacks');
		}
	}
	
	function factionSubmitReports() {
		var trustedApiKey = document.getElementById("trustedkey").value;
		
		sessionStorage.trustedApiKey = trustedApiKey;
		//document.getElementById("debug").innerHTML = '<small>Debug only: API key used (to be removed after release): ' + trustedApiKey + '</small>';

		if (trustedApiKey === '') {
			printAlert('Warning', 'You might want to enter your API key if you expect this to work...');
		} else {
			callTornAPI(trustedApiKey, 'faction', 'basic,reports', 'reports');
		}
	}
	
	
	
	function factionSubmitStatus() {
		var trustedApiKey = document.getElementById("trustedkey").value;
		
		sessionStorage.trustedApiKey = trustedApiKey;
		//document.getElementById("debug").innerHTML = '<small>Debug only: API key used (to be removed after release): ' + trustedApiKey + '</small>';

		if (trustedApiKey === '') {
			printAlert('Warning', 'You might want to enter your API key if you expect this to work...');
		} else {


			callTornAPI(trustedApiKey, 'faction', 'basic', 'status');
		}
	}
	
	
	function factionSubmitNews() {
		var trustedApiKey = document.getElementById("trustedkey").value;
		
		sessionStorage.trustedApiKey = trustedApiKey;
		//document.getElementById("debug").innerHTML = '<small>Debug only: API key used (to be removed after release): ' + trustedApiKey + '</small>';

		if (trustedApiKey === '') {
			printAlert('Warning', 'You might want to enter your API key if you expect this to work...');
		} else {
			var selection = ''
			if (document.getElementById('armorynews').checked) {
				selection = 'armorynews';
			}
			if (document.getElementById('attacknews').checked) {
				selection = 'attacknews';
			}
			if (document.getElementById('crimenews').checked) {
				selection = 'crimenews';
			}
			if (document.getElementById('fundsnews').checked) {
				selection = 'fundsnews';
			}
			if (document.getElementById('membershipnews').checked) {
				selection = 'membershipnews';
			}
			if (document.getElementById('territorynews').checked) {
				selection = 'territorynews';
			}

			callTornAPI(trustedApiKey, 'faction', selection, 'news');
		}
	}
	
	
	function callTornAttacksWithTimestamp(key, part, selection, source, from, to, callBackMethod) {
		const request = new XMLHttpRequest();
		const url='https://api.torn.com/' + part + '/?selections=' + selection + '&from=' + from + '&key=' + key + '&comment=Foxy';
		request.open("GET", url, true);
		request.send();
		
		

		request.onreadystatechange = function() {

			// Waits for correct readyState && status
			if (request.readyState == 4 && request.status == 200) callBackMethod(JSON.parse(request.responseText)['attacks']);
		 };
	}
	
	function callTornAPI(key, part, selection, source) {
		var request = new XMLHttpRequest();

		request.open('GET', 'https://api.torn.com/' + part + '/?selections=' + selection + '&key=' + key + '&comment=Foxy', true);
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
					
					if (source === 'status') {
						printAlert('Success', 'The API Call successful, find the results below.');	
						parseStatus(jsonData[selection], selection, 'output', jsonData['members']);
					}
				}
				
			} else {
				printAlert('#chedded', 'Torn API is currently not available.');
			}
		}
		request.send();
	}
	
	function printAttacks(attacksData) {
		
		var table = '';
		for( var id in attacksData ){
			
			var attack = attacksData[id];
			var direction = 'Outgoing';
			var raid = '';
			var wall = '';
			var chain = '';
			
			var ts = new Date(attack.timestamp_started * 1000);
			var formatted_date =  ts.toISOString().replace('T',' ').replace('.000Z','');
			
			if (attack.defender_faction == '7835') {
				direction = 'Incoming';
			}
			
			if (direction == 'Outgoing') {
			if (attack.raid == 1) raid = '<span class="badge badge-pill badge-success">+</span>';
			if (attack.modifiers.war == 2) wall = '<span class="badge badge-pill badge-success">+</span>';
			if (attack.chain !== 0) chain = '<span class="badge badge-pill badge-success">+</span>';
			table = table + '<tr>'
							+'<td>' + formatted_date + '</td>'
							+'<td><a href="https://www.torn.com/profiles.php?XID=' + attack.attacker_id + '" target="_blank">' + attack.attacker_name + '</a></td>'
							+'<td><a href="https://www.torn.com/factions.php?step=profile&ID=' + attack.attacker_faction + '" target="_blank">' + attack.attacker_factionname + '</a></td>'
							+'<td><a href="https://www.torn.com/profiles.php?XID=' + attack.defender_id + '" target="_blank">' + attack.defender_name  + '</a></td>'
							+'<td><a href="https://www.torn.com/factions.php?step=profile&ID=' + attack.defender_faction + '" target="_blank">' + attack.defender_factionname + '</a></td>'
							+'<td>' + direction + '</td>'
							+'<td>' + attack.result + '</td>'
							+'<td>' + chain + '</td>'
							+'<td>' + wall + '</td>'
							+'<td>' + raid + '</td>'
							+'</tr>';
			}
			
			document.getElementById("startTime").value = attack.timestamp_started;
			
		}
		
		console.log("---------------------------------------");
		document.getElementById('body').innerHTML += table;
	}
	
	function parseAttacks (key, part, selection, source) {
		document.getElementById('summary').innerHTML = 'You are looking for attack logs.';
		
		var element = 'head';
		
		
		var table = '<tr>'
				  + '<th>Date</th>'
				  + '<th>Attacker</th>'
				  + '<th>Attacker Faction</th>'
				  + '<th>Defender</th>'
				  + '<th>Defender Faction</th>'
				  + '<th>Direction</th>'
				  + '<th>Result</th>'
				  + '<th>Chain hit</th>'
				  + '<th>Wall Hit</th>'
				  + '<th>Raid</th>';
				  
		table = table + '</tr>';
		
		callTornAttacksWithTimestamp(key, part, selection, source, document.getElementById("startTime").value, '', function(responseText) {
			printAttacks(responseText);
		});
		
		
		document.getElementById(element).innerHTML = table;
		
	}
	
	
	function parseStatus (statusData, selection, element, membersList) {
		
		document.getElementById('summary').innerHTML = 'You are looking for ' + selection + '.';

		var table = '<div class="col-sm-12 badge-primary" ><b>Offline Members in Hospital</b></div>';
		table = table + '<table class="table table-hover"><thead><tr>'
				  + '<th>Name</th>'
				  + '<th>Link</th>'
				  + '<th>Status</th>'
				  + '<th>Status</th>';
				  
		table = table + '</tr></thead><tbody>';
		//console.log(membersList)
		for( var id in membersList ){
			//console.log(id)
			var member = membersList[id];
			//if (news.type === type) {

				//var ts = new Date(news.timestamp * 1000);
				//var formatted_date =  ts.toISOString().replace('T',' ').replace('.000Z','');
				if (member.last_action.status == 'Offline' && !member.status.description.includes('hrs') && !member.status.description.includes('federal'))
				table = table + '<tr>'

							+'<td><a href="https://www.torn.com/profiles.php?XID=' + id + '" target="_blank">' + member.name + '</a></td>'
							+'<td>https://www.torn.com/profiles.php?XID=' + id +  '</td>'
							+'<td>' + member.status.description + '</td>'
							+'<td>' + member.last_action.status + '</td>';
				

				
				
				table = table + '</tr>';
			//}
		}	
		table = table + '</tbody></table>';
		document.getElementById(element).innerHTML = table;
		
	}
	
	function parseNews (newsData, selection, element, membersList) {
		
		document.getElementById('summary').innerHTML = 'You are looking for ' + selection + '.';

		var table = '<div class="col-sm-12 badge-primary" ><b> ' + selection + '</b></div>';
		table = table + '<table class="table table-hover"><thead><tr>'
				  + '<th>Date</th>'
				  + '<th>News</th>';
				  
		table = table + '</tr></thead><tbody>';
		
		for( var id in newsData ){

			var news = newsData[id];
			//if (news.type === type) {

				var ts = new Date(news.timestamp * 1000);
				var formatted_date =  ts.toISOString().replace('T',' ').replace('.000Z','');
				
				table = table + '<tr>'
							+'<td>' + formatted_date + '</td>'
							+'<td>' + news.news + '</td>';
				

				
				
				table = table + '</tr>';
			//}
		}	
		table = table + '</tbody></table>';
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
							//+'<td>' + header + '</td>'
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
			if (crime.crime_id === 8) { //8 = PA
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
			if (memberFailed[name] > 0) {badgeFailed = 'badge-danger';} else {badgeFailed = 'badge-dark';}
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
		//console.log(crimeList);
		
		var table = '<div class="col-sm-12 badge-primary" ><b>Organized Crime Overview for ' + monthToText(currentMonth) + '</b> <input type="button" class="btn btn-outline-light btn-sm" value="select table content" onclick="selectElementContents( document.getElementById(\'totals\') );"></div>';
		table = table + '<br />';
		//table = table + '<input type="button" class="btn btn-outline-light btn-sm" value="select table content" onclick="selectElementContents( document.getElementById(\'totals\') );">';
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
			
			//console.log(crime.crime_name);
			if (crimeList.includes(crime.crime_id)) {   //8 = Political Assassination
										//7 = Plane hijacking
										//6 = Take over a cruise liner
										//5 = Robbing of a money train
										//4 = Planned robbery
										//3 = Bomb Threat
										//2 = Kidnapping
										//1 = Blackmailing
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
					
					//if (split == 5) {factionMoney = factionMoney + (crime.money_gain / split);}
					//if (split == 4) {factionMoney = 0;}
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
		var alertClass;
		if (alertType === 'Error') { alertClass = 'alert-danger' };
		if (alertType === 'Success') { alertClass = 'alert-success' };
		if (alertType === 'Info') { alertClass = 'alert-info' };
		if (alertType === 'Warning') { alertClass = 'alert-warning' };
		if (alertType === '#chedded') { alertClass = 'alert-danger' };
		
		document.getElementById('alert').innerHTML = '<div class="alert ' + alertClass + '"><strong>' + alertType + ':</strong> ' + alertText + '</div>';
	}

	function sortObj(obj) {
	  return Object.keys(obj).sort().reduce(function (result, key) {
		result[key] = obj[key];
		return result;
	  }, {});
	}

	function monthToText(month) {
		
		const monthNames = ["January", "February", "March", "April", "May", "June",
	  "July", "August", "September", "October", "November", "December"];

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
	
	//document.getElementById('copyIndiv').innerHTML = '<input type="button" class="btn btn-outline-light btn-sm" value="copy" onclick="selectElementContents( document.getElementById(\'individual\') );">';
	//<input type="button" class="btn btn-outline-light btn-sm" value="select table content"
	//alert("Copied the text: " + range);
	//navigator.clipboard.writeText(range);

}

	function loadKeyFromSession() {
		if (typeof(Storage) !== "undefined") {
			if (sessionStorage.trustedApiKey) {
				document.getElementById("trustedkey").value = sessionStorage.trustedApiKey;
			}
		}
	}

	function disableElement(source, target) {
		document.getElementById(target).disabled = document.getElementById(source).checked;
	}