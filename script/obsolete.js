//TODO This might be useful in future
/*	function factionSubmitAttacks() {
		var trustedApiKey = document.getElementById("trustedkey").value;
		
		sessionStorage.trustedApiKey = trustedApiKey;

		if (trustedApiKey === '') {
			printAlert('Warning', 'You might want to enter your API key if you expect this to work...');
		} else {
			parseAttacks(trustedApiKey, 'faction', 'basic,attacks', 'attacks');
		}
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
	
	function callTornAttacksWithTimestamp(key, part, selection, source, from, to, callBackMethod) {
		const request = new XMLHttpRequest();
		const url='https://api.torn.com/' + part + '/?selections=' + selection + '&from=' + from + '&key=' + key + '&comment=Foxy';
		request.open("GET", url, true);
		request.send();	

		request.onreadystatechange = function() {
			if (request.readyState == 4 && request.status == 200) callBackMethod(JSON.parse(request.responseText)['attacks']);
		 };
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
*/

//@OBSOLETE
/*	function userSubmitPAPayouts() {
		var trustedApiKey = document.getElementById("trustedkey").value;
		
		sessionStorage.trustedApiKey = trustedApiKey;

		if (trustedApiKey === '') {
			printAlert('Warning', 'You might want to enter your API key if you expect this to work...');
		} else {
			callTornAPI(trustedApiKey, 'faction', 'basic,crimes', 'pa_payouts');
		}
	}

	function userSubmitOCOverview() {
		var trustedApiKey = document.getElementById("trustedkey").value;
		
		sessionStorage.trustedApiKey = trustedApiKey;

		if (trustedApiKey === '') {
			printAlert('Warning', 'You might want to enter your API key if you expect this to work...');
		} else {
			callTornAPI(trustedApiKey, 'faction', 'basic,crimes', 'oc_overview');
		}
	}
	
	function factionSubmitReports() {
		var trustedApiKey = document.getElementById("trustedkey").value;
		
		sessionStorage.trustedApiKey = trustedApiKey;

		if (trustedApiKey === '') {
			printAlert('Warning', 'You might want to enter your API key if you expect this to work...');
		} else {
			callTornAPI(trustedApiKey, 'faction', 'basic,reports', 'reports');
		}
	}
	
	function factionSubmitStatus() {
		var trustedApiKey = document.getElementById("trustedkey").value;
		
		sessionStorage.trustedApiKey = trustedApiKey;

		if (trustedApiKey === '') {
			printAlert('Warning', 'You might want to enter your API key if you expect this to work...');
		} else {
			callTornAPI(trustedApiKey, 'faction', 'basic', 'status');
		}
	}
	
		function factionSubmitNews() {
		var trustedApiKey = document.getElementById("trustedkey").value;
		
		sessionStorage.trustedApiKey = trustedApiKey;
		
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
	
	*/