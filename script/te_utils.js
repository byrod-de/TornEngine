function checkIndexedDBSupport() {
  if (!window.indexedDB) {
    console.log(`Your browser doesn't support IndexedDB`);
    return false;
  } else {
    //console.log(`Your browser does support IndexedDB`);
    return true;
  }
}

function openIndexedDB(dbName, version) {
  var idbRequest = indexedDB.open(dbName, version);
  return idbRequest;
}

function initializeIndexedDB(request, object) {
  // create the object store and indexes
  request.onupgradeneeded = (event) => {
    let db = event.target.result;

    // create the object store 
    // with auto-increment id
    let store = db.createObjectStore(object, {
      autoIncrement: true
    });

    // create an index on the playerID property
    let index = store.createIndex('playerID', 'playerID', {
      unique: true
    });
  };
}

function insertPlayer(request, object, player) {
  request.onsuccess = (event) => {
    const db = event.target.result;

    // create a new transaction
    const txn = db.transaction(object, 'readwrite');

    // get the player object store
    const store = txn.objectStore(object);
    //
    let query = store.put(player);

    // handle success case
    query.onsuccess = function (event) {
      console.log(event);
    };

    // handle the error case
    query.onerror = function (event) {
      console.log(event.target.errorCode);
    }

    // close the database once the 
    // transaction completes
    txn.oncomplete = function () {
      db.close();
    };
  }

}


function getPlayerById(request, object, id) {
  request.onsuccess = (event) => {
    const db = event.target.result;
    const txn = db.transaction(object, 'readonly');
    const store = txn.objectStore(object);

    let player = store.index("playerID");

    let query = player.get(id);

    query.onsuccess = (event) => {
      if (!event.target.result) {
        //console.log(`The ${object} with ${id} not found`);
      } else {
        let result = event.target.result


        var ts = new Date(result.timestamp * 1000);

        var stats = '&nbsp;Dex:&nbsp;' + abbreviateNumber(result.dexterity).toLocaleString('en-US')
          + ',&nbsp;Def:&nbsp;' + abbreviateNumber(result.defense).toLocaleString('en-US')
          + ',&nbsp;Str:&nbsp;' + abbreviateNumber(result.strength).toLocaleString('en-US')
          + ',&nbsp;Spd:&nbsp;' + abbreviateNumber(result.speed).toLocaleString('en-US');


        document.getElementById('stats_' + id).innerHTML =
          abbreviateNumber(result.total).toLocaleString('en-US')
          + '&nbsp;<span class="text-muted">' + stats + '</div>'
          + '<div class="text-secondary">' + ts.toISOString().substring(0, ts.toISOString().indexOf('T')) + '</div>'
          ;

      }
    };

    query.onerror = (event) => {
      console.log(event.target.errorCode);
    }

    txn.oncomplete = function () {
      db.close();
    };
  };
}

function copyFilterAsURL(selection) {

  if (selection == 'members') {
    var siteUrl = "https://tornengine.netlify.app/members.html";

    const markedCheckboxStatus = document.getElementsByName('status');
    const markedCheckboxDetails = document.getElementsByName('details');
    const markedCheckboxAdvanced = document.getElementsByName('advanced');
    const activityCheckbox = document.getElementById('FilterActive');
    const factionIDInput = document.getElementById('factionid').value;


    var statusList = "";
    var detailsList = "";
    var activityFilter = "";
    var advancedFilter = "";
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

    for (var checkbox of markedCheckboxAdvanced) {
      if (checkbox.checked) {
        advancedFilter = advancedFilter + checkbox.value + ",";
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

    if (advancedFilter != "") {
      advancedFilter = "&advanced=" + advancedFilter.substring(0, advancedFilter.length - 1);
    } else {
      advancedFilter = "&advanced=";
    }

    if (activityFilter != "") {
      activityFilter = "&lastactive=" + activityFilter;
    }

    if (factionIDInput != "") {
      factonID = "&factionID=" + factionIDInput;
    }

    siteUrl = replaceFirstAmpersandWithQuestionMark(siteUrl + statusList + detailsList + activityFilter + advancedFilter + factonID);

    console.log(siteUrl);

    setTimeout(function () {
      navigator.clipboard.writeText(siteUrl);
    }, 1000);

  }
}