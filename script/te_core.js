/**
 * Replaces the first ampersand (&) in the given input string with a question mark (?)
 * @param {string} inputString - The string to be modified
 * @return {string} The modified string with the first ampersand replaced with a question mark, or the original string if no ampersand is found
 */
function replaceFirstAmpersandWithQuestionMark(inputString) {
    var firstAmpersandIndex = inputString.indexOf('&');
    if (firstAmpersandIndex !== -1) {
        var modifiedString = inputString.substring(0, firstAmpersandIndex) + '?' + inputString.substring(firstAmpersandIndex + 1);
        return modifiedString;
    }
    return inputString;
}


function abbreviateNumber(value) {
    var newValue = value;
    if (value >= 1000) {
        var suffixes = ["", "k", "m", "b", "t", "wtf"];
        var suffixNum = Math.floor(("" + value).length / 3);
        var shortValue = '';
        for (var precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(precision));
            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
            if (dotLessShortValue.length <= 2) { break; }
        }
        if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
        newValue = shortValue + suffixes[suffixNum];
    }
    return newValue;
}


/**
 * Toggles the disabled state of a target element based on the checked state of a source element.
 * @param {string} source - The ID of the source element whose checked state is used.
 * @param {string} target - The ID of the target element to be enabled/disabled.
 */
function disableElement(source, target) {
    document.getElementById(target).disabled = !document.getElementById(source).checked;
}


/**
 * Selects the contents of an element, using the correct method depending on the browser.
 * @param {Element} el - The element to select the contents of.
 */
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


/**
 * Toggles the visibility of an element based on the label of the button that should
 * trigger this action. If the button label is 'Hide <label>', the element is hidden
 * and the button label is changed to 'Show <label>'. If the button label is 'Show <label>',
 * the element is shown and the button label is changed to 'Hide <label>'.
 * @param {string} element - The ID of the element to be shown/hidden.
 */
function hideElementByID(element) {
    let buttonId = 'btnHideFilter';
    let label = 'Filter';
    if (element === 'war-details') {
        buttonId = 'btnHideWarDetails';
        label = 'Details';
    }
    if (document.getElementById(buttonId).innerHTML == `Hide&nbsp;${label}`) {
        document.getElementById(buttonId).innerHTML = `Show&nbsp;${label}`;
        document.getElementById(element).hidden = true;
    } else {
        document.getElementById(buttonId).innerHTML = `Hide&nbsp;${label}`;
        document.getElementById(element).hidden = false;
    }
}


/**
 * Displays an alert message on the webpage with a specific style based on the alert type.
 * Updates the HTML content of an element with ID 'alert' to show the alert message.
 * Also updates the class of an element with ID 'trustedkey' to reflect the alert type.
 *
 * @param {string} alertType - The type of alert, which determines the styling. 
 *                             Valid types are: 'Error', 'Success', 'Info', 
 *                             'Warning', 'ACHTUNG', '#chedded'.
 * @param {string} alertText - The text of the alert message to be displayed.
 */
function printAlert(alertType, alertText) {
    var alertClass, apiKeyForm;
    if (alertType === 'Error') { alertClass = 'alert-danger'; apiKeyForm = 'form-control is-invalid'; }
    if (alertType === 'Success') { alertClass = 'alert-success'; apiKeyForm = 'form-control is-valid'; }
    if (alertType === 'Info') { alertClass = 'alert-info'; apiKeyForm = 'form-control is-valid'; }
    if (alertType === 'Warning') { alertClass = 'alert-warning'; apiKeyForm = 'form-control is-invalid'; }
    if (alertType === 'ACHTUNG') { alertClass = 'alert-warning'; apiKeyForm = 'form-control is-invalid'; }
    if (alertType === '#chedded') { alertClass = 'alert-danger'; apiKeyForm = 'form-control is-invalid'; }

    document.getElementById('alert').innerHTML = '<div class="alert alert-dismissible ' + alertClass + '"><button type="button" class="close" data-dismiss="alert">&times;</button><strong>' + alertType + ':</strong> ' + alertText + '</div>';
    document.getElementById('trustedkey').className = apiKeyForm;
}


/**
 * Parses URL parameters from the current window's location and returns them as an object.
 * 
 * @return {Object} An object containing key-value pairs of URL parameters.
 */
function getUrlVars() {
    const vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}


/**
 * Retrieves a URL parameter from the current window's location.
 * If the parameter is not present, a default value is returned.
 * 
 * @param {string} parameter - The name of the URL parameter to retrieve.
 * @param {string} defaultvalue - The value to return if the parameter is not present.
 * @return {string} The value of the specified URL parameter, or the default value if not present.
 */
function getUrlParam(parameter, defaultvalue) {
    let urlparameter = defaultvalue;
    if (window.location.href.indexOf(parameter) > -1) {
        urlparameter = getUrlVars()[parameter];
    }
    return urlparameter;
}

/**
 * Converts a numerical month representation to its corresponding textual name.
 *
 * @param {number} month - The month number (1-12).
 * @return {string} The name of the month corresponding to the given number.
 */
function monthToText(month) {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[month - 1];
  }
  

/**
 * Calculates Unix timestamps for the first and last day of a selected month.
 *
 * @param {Date} today - The current date.
 * @param {number} selectedMonth - The selected month (1-12).
 * @param {number} [offsetInHours=0] - An optional offset in hours to adjust the timestamps.
 * @return {Object} An object containing the Unix timestamps of the first and last day of the selected month.
 */
  function calculateMonthTimestamps(today, selectedMonth, offsetInHours = 0) {
    var currentYear = today.getFullYear();
  
    var firstDayOfMonth = new Date(currentYear, selectedMonth, 1).getTime() / 1000;
    var lastDayOfMonth = new Date(currentYear, selectedMonth + 1, 0, 23, 59, 59).getTime() / 1000;
  
    if (offsetInHours > 0) {
      firstDayOfMonth -= (offsetInHours + 36) * 60 * 60;
      lastDayOfMonth -= offsetInHours * 60 * 60;
    }
  
    return { firstDay: firstDayOfMonth, lastDay: lastDayOfMonth };
  }
  
/**
 * Generates an array of objects representing the last 12 months as options.
 * Each object contains a label in "YYYY-MM" format and a value representing the
 * number of months ago from the current month.
 *
 * @return {Array} An array of objects, each containing a label and value for the month options.
 */

  function generateLast12MonthsOptions() {
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    var currentMonth = currentDate.getMonth() + 1;
  
    var referenceDate = new Date(currentYear, currentMonth - 1, 1);
    var monthOptions = [];
  
    for (var i = 0; i < 12; i++) {
      var year = referenceDate.getFullYear();
      var month = referenceDate.getMonth() + 1;
      var optionLabel = year + '-' + (month < 10 ? '0' : '') + month;
      monthOptions.push({ label: optionLabel, value: i });
      referenceDate.setMonth(referenceDate.getMonth() - 1);
    }
  
    return monthOptions.reverse();
  }
  
/**
 * Loads API key, faction ID, and player ID from session storage and URL parameters.
 * If URL parameters exist, overwrites session storage.
 * Sets input fields for the API key, faction ID, and player ID if they exist.
 *
 * @param {string} source - The source of the page load, which determines which input fields to set.
 *                          Valid values are 'members', 'trailers', or any other value.
 */
  function loadKeyFromSession(source) {
    const trustedKey = sessionStorage.getItem('trustedApiKey') || '';
    const factionId = sessionStorage.getItem('factionid') || '';
    const playerId = sessionStorage.getItem('playerid') || '';
  
    const paramFactionID = getUrlParam('factionID', '');
    const paramPlayerID = getUrlParam('playerID', '');
  
    // If URL parameters exist, overwrite sessionStorage
    if (paramFactionID) {
      sessionStorage.setItem('factionid', paramFactionID);
    }
  
    if (paramPlayerID) {
      sessionStorage.setItem('playerid', paramPlayerID);
    }
  
    // Set input fields if they exist
    const apiKeyInput = document.getElementById('trustedkey');
    if (apiKeyInput) {
      apiKeyInput.value = trustedKey;
    }
  
    if (source === 'members') {
      const factionIdInput = document.getElementById('factionid');
      if (factionIdInput) {
        factionIdInput.value = sessionStorage.getItem('factionid') || '';
      }
    }
  
    if (source === 'trailers') {
      const playerIdInput = document.getElementById('playerid');
      if (playerIdInput) {
        playerIdInput.value = sessionStorage.getItem('playerid') || '';
      }
    }
  }
  