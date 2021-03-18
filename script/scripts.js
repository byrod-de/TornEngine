	function userSubmit() {
		var x = document.getElementById("userForm");
		var outputDemo = document.getElementById("trustedkey").value;
		//document.getElementById("debug").innerHTML = '<small>Debug only: API key used (to be removed after release): ' + outputDemo + '</small>';
		callTornAPI(outputDemo, 'faction', 'basic,crimes');
	}
	
	function callTornAPI(key, part, selection) {
		var request = new XMLHttpRequest();

		request.open('GET', 'https://api.torn.com/' + part + '/?selections=' + selection + '&key=' + key, true);
		request.onload = function () {

			var jsonData = JSON.parse(this.response);

			if (request.status >= 200 && request.status < 400) {

				if (jsonData.hasOwnProperty('error')){
					if (jsonData['error'].code === 7) {
						printAlert('Warning', 'You are trying to access sensible faction data, but are not allowed to. Ask your faction leader for faction API permissions.');
					} else {
						printAlert('Error', jsonData['error'].error);
					}
				} else {
					
					if (jsonData.hasOwnProperty('crimes') && jsonData.hasOwnProperty('members')){
						printAlert('Success', 'The API Call successful, find the results below.');
						parseCrimes(jsonData['crimes'], 'output', jsonData['members']);
					} else {
						printAlert('Warning', 'Ask your faction leader for faction API permissions.');
					}
				}
				
			} else {
				printAlert('#chedded', 'Torn API is currently not available.');
			}
		}
		request.send();
	}
	
	function parseCrimes (crimeData, element, membersList) {
		
		var table = '<div class="col-sm-12 badge-primary" ><b>Crime Details</b></div>';
		table = table + '<table class="table table-hover"><thead><tr>'
				  + '<th>Date</th>'
				  + '<th>Participants</th>'
				  + '<th>Crime Type</th>'
				  + '<th>Result</th>'
				  + '<th>Money Gained<br/>'
				  + '<th>Respect Gained</th>'
				  + '</tr></thead><tbody>';
				  
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
		}
		if (document.getElementById('before').checked) {
			var currentMonth = today.getMonth() - 1;
			if (currentMonth < 0) { currentMonth = 11; }
		}
		
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
								if (memberName in memberMoney) {
									memberMoney[memberName] = memberMoney[memberName] + (crime.money_gain / 5);
									memberSuccess[memberName] = memberSuccess[memberName] +success;
									memberFailed[memberName] = memberFailed[memberName] + failed;
								} else {
									memberMoney[memberName] = (crime.money_gain / 5);
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
					
					factionMoney = factionMoney + (crime.money_gain / 5);
					factionSuccess = factionSuccess + success;
					factionFailed = factionFailed + failed;
					totalRespect = totalRespect + crime.respect_gain;
					totalMoney = totalMoney + crime.money_gain;
					
					var formatted_date = ts.getFullYear() + "-" + (ts.getMonth() + 1) + "-" + ts.getDate() + " " + ts.getHours() + ":" + ts.getMinutes() + ":" + ts.getSeconds()
					
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
						+'<td colspan = "3">Faction totals</td>'
						+'<td>' 
							+ '<span class="badge badge-pill '+badgeFailed+'">'+ factionFailed + '</span>-'
							+ '<span class="badge badge-pill '+badgeSuccess+'">'+ factionSuccess + '</span>'
						+'</td>'
						+'<td>$' + totalMoney.toLocaleString('en-US') + '</td>'
						+'<td>' + totalRespect + '</td>'
						+'</tr>';
		
		table = table + '</tbody></table>';
		document.getElementById(element).innerHTML = table;
		
		
		var summary = '<div class="col-sm-12 badge-primary" ><b>Results for ' + monthToText(currentMonth) + '</b></div>';
		summary = summary + '<table class="table table-hover"><thead><tr>'
				  + '<th>Name</th>'
				  + '<th>Money earned (<sup>1</sup>/<sub>5</sub>th of result)</th>'
				  + '<th>Success Rate</th>'
				  + '</tr></thead><tbody>';
				  
		memberMoney = sortObj(memberMoney);
		
		for (var name in memberMoney) {
			if (memberFailed[name] > 0) {badgeFailed = 'badge-danger';} else {badgeFailed = 'badge-dark';}
			if (memberSuccess[name] > 0) {badgeSuccess = 'badge-success';} else {badgeSuccess = 'badge-dark';}
			summary = summary + '<tr>' 
						+'<td>' + name + '</td>'
						+'<td>' +' $' + memberMoney[name].toLocaleString('en-US') + '</td>'
						+'<td>' 
							+ '<span class="badge badge-pill '+badgeFailed+'">'+ memberFailed[name] + '</span>-'
							+ '<span class="badge badge-pill '+badgeSuccess+'">' + memberSuccess[name] + '</span>'
						+ '</td>'
						+'</tr>';
			
		}
		badgeSuccess = 'badge-dark';
		badgeFailed = 'badge-dark';
		if (factionFailed > 0) {badgeFailed = 'badge-danger';}
		if (factionSuccess > 0) {badgeSuccess = 'badge-success';}
		summary = summary + '<tr class="table-dark">' 
						+'<td>Faction totals</td>'
						+'<td>' +' $' + factionMoney.toLocaleString('en-US') + '</td>'
						+'<td>' 
							+ '<span class="badge badge-pill '+badgeFailed+'">'+ factionFailed + '</span>-'
							+ '<span class="badge badge-pill '+badgeSuccess+'">'+ factionSuccess + '</span>'
						+ '</td>'
						+'</tr>';
		summary = summary + '</tbody></table>';
		
		document.getElementById('summary').innerHTML = summary;
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
	  
	  return monthNames[month - 1];

	}