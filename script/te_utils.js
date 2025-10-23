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


        const statCell = document.getElementById('stats_' + id);
        if (statCell) {
          statCell.innerHTML =
            abbreviateNumber(result.total).toLocaleString('en-US')
            + '&nbsp;<span class="text-muted">' + stats + '</span>'
            + '<div class="text-secondary">' + ts.toISOString().substring(0, ts.toISOString().indexOf('T')) + '</div>';

          statCell.setAttribute('data-order', result.total);
        }
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
  if (selection === 'members') {
    const siteUrl = `${location.origin}${location.pathname}`;

    const statusList = [...document.getElementsByName('status')].filter(cb => cb.checked && cb.value !== "FilterActive").map(cb => cb.value).join(',');
    const detailsList = [...document.getElementsByName('details')].filter(cb => cb.checked).map(cb => cb.value).join(',');
    const activityValue = document.getElementById('FilterActive').checked ? document.getElementById('TimeActive').value : '';
    const revivableState = document.getElementById('revivableToggle')?.dataset.state ?? 'all';
    const earlyDischargeState = document.getElementById('edToggle')?.dataset.state ?? 'all';
    const onWallState = document.getElementById('onWallToggle')?.dataset.state ?? 'all';

    const factionID = document.getElementById('factionid').value;
    const levelRange = slider.noUiSlider.get();

    const params = new URLSearchParams();
    if (statusList) params.set('status', statusList);
    if (detailsList) params.set('details', detailsList);
    if (activityValue) params.set('lastactive', activityValue);
    if (factionID) params.set('factionID', factionID);
    if (levelRange) {
      params.set('levelMin', Math.round(levelRange[0]));
      params.set('levelMax', Math.round(levelRange[1]));
    }
    if (revivableState !== 'all') {
      params.set('revivable', revivableState);
    }

    if (earlyDischargeState !== 'all') {
      params.set('earlyDischarge', earlyDischargeState);
    }

    if (onWallState !== 'all') {
      params.set('onWall', onWallState);
    }

    const fullUrl = `${siteUrl}?${params.toString()}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      const btn = document.getElementById('copyLinkBtn');
      if (btn) {
        btn.classList.remove('btn-outline-primary');
        btn.classList.add('btn-success');
        btn.textContent = 'Copied!';
        setTimeout(() => {
          btn.classList.remove('btn-success');
          btn.classList.add('btn-outline-primary');
          btn.textContent = 'Copy\u00A0Filter\u00A0Link';
        }, 1500);
      }
    });
  }
}

function startHospitalCountdowns() {
  const updateCountdown = () => {
    const now = Math.floor(Date.now() / 1000);

    document.querySelectorAll('.hospital-timer').forEach(el => {
      const until = parseInt(el.dataset.hospitalUntil, 10);
      const diff = Math.max(0, until - now);

      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      const segments = [
        { val: days, label: 'd:' },
        { val: hours, label: 'h:' },
        { val: minutes, label: 'm:' },
        { val: seconds, label: 's' }
      ];

      let leading = true;
      const formatted = segments.map(({ val, label }) => {
        const str = val.toString().padStart(2, '0') + label;
        if (leading && val === 0) {
          return `<span class="text-secondary">${str}</span>`;
        } else {
          leading = false;
          return str;
        }
      }).join('');

      el.innerHTML = formatted;
    });
  };

  updateCountdown(); // Initial run
  setInterval(updateCountdown, 5000); // Update 5 seconds
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

function setPaginationButtons(metadata, batchSize = 0) {
  const prevUrl = metadata.links?.prev || null;
  const nextUrl = metadata.links?.next || null;
  let prevButton = '';
  if (prevUrl && batchSize === 0) {
    prevButton = `<button onclick="submitPagination('${prevUrl}')" class="btn btn-primary btn-sm" id="btnPrevPage">< Previous</button>`;
  }
  let nextButton = '';
  if (nextUrl && batchSize === 0) {
    nextButton = `<button onclick="submitPagination('${nextUrl}')" class="btn btn-primary btn-sm" id="btnNextPage">Next ></button>`;
  }
  
  if ((nextUrl || prevUrl) && batchSize > 0) {
    nextButton = `<button onclick="submitPagination('${nextUrl}', ${batchSize})" class="btn btn-danger btn-sm" id="btnShowMore">Show more</button>`;
  }

  const buttons = prevButton + ' ' + nextButton;

  return buttons.trim();
}

function delayRandomizer() {
  // Random delay between 1000ms and 1500ms
  const delay = Math.floor(Math.random() * 500) + 1000;
  return delay;
}