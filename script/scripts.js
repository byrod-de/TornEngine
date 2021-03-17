	function userSubmit() {
		var x = document.getElementById("userForm");
		var outputDemo = document.getElementById("trustedkey").value;
		//document.getElementById("debug").innerHTML = '<small>Debug only: API key used (to be removed after release): ' + outputDemo + '</small>';
		callTornAPI(outputDemo, 'faction', 'basic,crimes');
	}
	
	function callTornAPI(key, part, selection) {
		var request = new XMLHttpRequest();

		request.open('GET', 'https://api.torn.com/' + part + '/1?selections=' + selection + '&key=' + key, true);
		request.onload = function () {

			var jsonData = JSON.parse(this.response);

			if (request.status >= 200 && request.status < 400) {

				if (jsonData.hasOwnProperty('error')){
					if (jsonData['error'].code === 7) {
						document.getElementById('summary').innerHTML = printAlert('Warning', 'Ask your faction leader for faction API permissions.');
					} else {
						document.getElementById('summary').innerHTML = printAlert('Error', jsonData['error'].error);
					}
				} else {
					
					if (jsonData.hasOwnProperty('crimes') && jsonData.hasOwnProperty('members')){
						document.getElementById('summary').innerHTML = printAlert('Success', 'API Call successful!');
						parseCrimes(jsonData['crimes'], 'output', jsonData['members']);
					} else {
						document.getElementById('summary').innerHTML = printAlert('Warning', 'Ask your faction leader for faction API permissions.');
					}
				}
				
			} else {
				document.getElementById('summary').innerHTML = printAlert('#chedded', 'Torn API not available.');
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

		
		return '<div class="alert ' + alertClass + '"><strong>' + alertType + ':</strong> ' + alertText + '</div>';
		
		
	}
	

	function parseCrimes (crimeData, element, membersList) {
		
		var table = '<table class="table table-condensed table-hover"><thead><tr>'
				  + '<th>Date</th>'
				  + '<th>Crime Type</th>'
				  + '<th>Participants</th>'
				  + '<th>Money Gained<br/>per member</th>'
				  + '<th>Respect Gained</th>'
				  + '</tr></thead><tbody>';
		
		for( var id in crimeData ){
			var crime = crimeData[id];
			if (crime.crime_id === 8) {
				if (crime.initiated === 1) {
					var ts = new Date(crime.time_completed * 1000);
					var crimeResult = 'default';
					var participants = '';

					if (crime.success === 1) {
						crimeResult = 'table-success';
					} else {
						crimeResult = 'table-danger';
					}
					
					crime.participants.forEach(obj => {
						Object.entries(obj).forEach(([key, value]) => {
							var memberID = `${key}`;

							var memberName =  '';
							if (JSON.stringify(membersList).indexOf(memberID) != -1) {
								memberName = membersList[memberID].name;
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
						
					
					table = table + '<tr class="'+crimeResult+'">'
							+'<td>' + ts.toISOString() + '</td>'
							+'<td>' + crime.crime_name + '</td>'
							+'<td>' + participants + '</td>'
							+'<td>' + crime.money_gain.toLocaleString('en-US') +'<br />'+ (crime.money_gain / 5).toLocaleString('en-US') + '</td>'
							+'<td>' + crime.respect_gain + '</td>'
							+'</tr>';
				}
			}
		}
		
		table = table + '</tbody></table>';
		document.getElementById(element).innerHTML = table;
	}
