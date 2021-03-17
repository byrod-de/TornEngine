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
						printAlert('Success', 'API Call successful!');
						parseCrimes(jsonData['crimes'], 'output', jsonData['members']);
					} else {
						printAlert('Warning', 'Ask your faction leader for faction API permissions.');
					}
				}
				
			} else {
				printAlert('#chedded', 'Torn API not available.');
			}
		}
		request.send();
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
	

	function parseCrimes (crimeData, element, membersList) {
		
		var table = '<div class="col-sm-12 badge-secondary" ><b>Crime Details</b></div>';
		table = table + '<table class="table table-hover"><thead><tr>'
				  + '<th>Result</th>'
				  + '<th>Date</th>'
				  + '<th>Crime Type</th>'
				  + '<th>Participants</th>'
				  + '<th>Money Gained<br/>per member</th>'
				  + '<th>Respect Gained</th>'
				  + '</tr></thead><tbody>';
				  
		var memberMap = {};
		var today = new Date();
		
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
		console.log(currentMonth);
		for( var id in crimeData ){
			var crime = crimeData[id];
			if (crime.crime_id === 8) { //8 = PA
				var ts = new Date(crime.time_completed * 1000);
				
				if (crime.initiated === 1 && ts.getMonth()+1 === currentMonth) {
					
					var crimeResult = '';
					var participants = '';
					var tmp = '';

					if (crime.success === 0) {
						crimeResult = '<span class="badge badge-pill badge-danger">Failed</span>';
					} else {
						crimeResult = '<span class="badge badge-pill badge-success">Success</span>';
					}
					
					crime.participants.forEach(obj => {
						Object.entries(obj).forEach(([key, value]) => {
							var memberID = `${key}`;

							var memberName =  '';
							if (JSON.stringify(membersList).indexOf(memberID) != -1) {
								memberName = membersList[memberID].name;
								if (memberName in memberMap) {
									memberMap[memberName] = memberMap[memberName] + (crime.money_gain / 5);
								} else {
									memberMap[memberName] = (crime.money_gain / 5);
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
						
					
					table = table + '<tr>'
							+'<td>' + crimeResult + '</td>'
							+'<td>' + ts.toISOString() + '</td>'
							+'<td>' + crime.crime_name + '</td>'
							+'<td>' + participants + '</td>'
							+'<td>$' + crime.money_gain.toLocaleString('en-US') + '</td>'
							+'<td>' + crime.respect_gain + '</td>'
							+'</tr>';
				}
			}
		}
		
		table = table + '</tbody></table>';
		document.getElementById(element).innerHTML = table;
		
		
		var summary = '<div class="col-sm-12 badge-secondary" ><b>Results for ' + monthToText(currentMonth) + '</b></div>';
		summary = summary + '<table class="table table-hover" style="max-width: 50%;"><thead><tr>'
				  + '<th>Name</th>'
				  + '<th>Money earned</th>'
				  + '</tr></thead><tbody>';
				  
		memberMap = sortObj(memberMap);
		for (var name in memberMap) {
			summary = summary + '<tr>' 
						+'<td>' + name + '</td>'
						+'<td>' +' $' + memberMap[name].toLocaleString('en-US') + '</td>'
						+'</tr>';
			
		}
		summary = summary + '</tbody></table>';
		
		document.getElementById('summary').innerHTML = summary;
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