const menuData = [
  {
    category: "OC 1.0 Tools",
    items: [
      { name: "PA Payouts", icon: "pa_payouts", href: "pa_payouts.html", badge: "Deprecated" },
      { name: "OC Overview", icon: "oc_overview", href: "oc_overview.html", badge: "Deprecated" },
      { name: "PA Planner", icon: "pa_planner", href: "pa_planner.html", badge: "Deprecated" },
    ]
  },
  {
    category: "OC 2.0 Tools",
    items: [
      { name: "OC 2.0", icon: "oc2", href: "oc2_center.html", badge: "Alpha" },
      { name: "Missing Items", icon: "missing_items", href: "missing_items.html", badge: "Alpha" }
    ]
  },
  {
    category: "Warring Tools",
    items: [
      { name: "Member Status", icon: "members", href: "members.html" },
      { name: "Ranked Wars", icon: "rankedwars", href: "rankedwars.html" },
      { name: "City Map", icon: "citymap", href: "citymap.html" }
    ]
  },
  {
    category: "Helpful Tools",
    items: [
      { name: "User Lists", icon: "user_lists", href: "user_lists.html" },
      { name: "Discord Time", icon: "discord", href: "discord.html" },
      { name: "Trailers!", icon: "trailers", href: "trailers.html" }
    ]
  },
    {
    category: "Contact",
    items: [
      { name: "Contact byrod", icon: "coffee", href: "https://www.torn.com/messages.php#/p=compose&XID=1132772" },
      { name: "Forum Post", icon: "forum", href: "https://www.torn.com/forums.php#/p=threads&f=67&t=16379783" }
    ]
  }
];

/**
 * Builds the menu bar of the application, given the active page.
 *
 * @param {string} activePage The active page, which determines which menu item is marked as active.
 */
function buildMenu(activePage) {

  const nav = document.createElement('ul');
  nav.className = 'navbar-nav mr-auto';

  menuData.forEach(section => {
    const li = document.createElement('li');
    li.className = 'nav-item dropdown show';

    const toggle = document.createElement('a');
    toggle.className = 'nav-link dropdown-toggle';
    toggle.href = '#';
    toggle.setAttribute('data-toggle', 'dropdown');
    toggle.innerText = section.category;

    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown-menu';

    section.items.forEach(item => {
      const link = document.createElement('a');
      let isActive = item.href === activePage;
      link.className = 'dropdown-item';
      if (isActive) {
        link.classList.add('active');
      }
      link.href = item.href;

      const img = document.createElement('img');
      img.alt = item.name;
      if (isActive) {
        img.src = `images/svg-icons/${item.icon}_active.svg`;
      } else {
        img.src = `images/svg-icons/${item.icon}.svg`;
      }
      img.height = 20;

      link.appendChild(img);

      link.append(' ' + item.name);

      if (item.badge) {
        const badge = document.createElement('sup');
        let badgeClass = 'badge badge-pill badge-info';
        if (item.badge === 'Deprecated') {
          badgeClass = 'badge badge-pill badge-primary';
        }
        badge.className = badgeClass;
        badge.innerText = item.badge;
        link.append(' ');
        link.appendChild(badge);
      }


      dropdown.appendChild(link);
    });

    li.appendChild(toggle);
    li.appendChild(dropdown);
    nav.appendChild(li);
  });

  document.getElementById('navbarColor01').appendChild(nav);

  // Add hidden UwU
  const uwu = document.createElement('span');
  uwu.innerText = 'UwU';
  uwu.setAttribute('title', 'You found the UwU!');
  uwu.setAttribute('style', 'position:absolute;bottom:0;right:0;font-size:12px;opacity:0.05;');
  document.getElementById('navbarColor01').appendChild(uwu);

}


/**
 * Builds the cards in the #cardContainer div. The cards are displayed in
 * columns, with each column containing all the items of a menu section.
 */
function buildCards() {

  const container = document.getElementById('cardContainer');
  if (!container) {
    console.error('No #cardContainer found!');
    return;
  }

  menuData.forEach(section => {
    const colDiv = document.createElement('div');
    colDiv.className = 'col-auto';

    section.items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card border-secondary mb-3';
      card.style.maxWidth = '10rem';

      const link = document.createElement('a');
      link.href = item.href;
      link.className = 'card-link link-alternative';

      const cardBody = document.createElement('div');
      cardBody.className = 'card-body text-center';

      const img = document.createElement('img');
      img.alt = item.name;
      img.src = `images/svg-icons/${item.icon}.svg`;
      img.height = 60;

      const divText = document.createElement('div');
      divText.innerText = item.name;

      cardBody.appendChild(img);
      cardBody.appendChild(divText);

      if (item.badge) {
        const badge = document.createElement('sup');
        let badgeClass = 'badge badge-pill badge-info';
        if (item.badge === 'Deprecated') {
          badgeClass = 'badge badge-pill badge-primary';
        }
        badge.className = badgeClass;
        badge.innerText = item.badge;
        cardBody.append(' ');
        //cardBody.appendChild(badge);
      }
      link.appendChild(cardBody);
      card.appendChild(link);
      colDiv.appendChild(card);
    });

    container.appendChild(colDiv);
  });
}

/**
 * Builds the header with the Torn Engine logo and a page title.
 * @param {string} activePage The href of the currently active page.
 */
function buildHeader(activePage) {
  const container = document.getElementById('headerContainer');
  if (!container) {
    console.error('No #headerContainer found!');
    return;
  }

  // --- Find the current page title from menuData ---
  let pageTitle = "A collection of more or less useful things"; // fallback
  menuData.forEach(section => {
    section.items.forEach(item => {
      if (item.href === activePage) {
        pageTitle = 'Something about ' + item.name;
      }
    });
  });

  // --- HEADER Rows ---
  const row1 = document.createElement('div');
  row1.className = 'row';
  row1.innerHTML = `
      <div class="col-sm-2">
        <br><br>
        <h1>Torn Engine <small></small></h1>
      </div>
      <div class="col-sm-2">
        <img alt="Logo" src="images/logo-100x100.png">
      </div>
    `;

  const row2 = document.createElement('div');
  row2.className = 'row';
  row2.innerHTML = `
      <div class="col-sm-4 badge-primary">
        <b>Torn Engine</b>
      </div>
      <div class="col-sm-8 badge-secondary">
        ${pageTitle}
      </div>
    `;

  container.appendChild(row1);
  container.appendChild(document.createElement('br'));
  container.appendChild(row2);
  container.appendChild(document.createElement('br'));
}

/**
 * Builds the footer section of the webpage. This function creates a fineprint card
 * with contact information and a disclaimer about the usage of API keys and player IDs.
 * It also includes a link to support the developer via Ko-fi. The footer is appended
 * to the element with the ID 'footerContainer'.
 */

function buildFooter() {
  const container = document.getElementById('footerContainer');
  if (!container) {
    console.error('No #footerContainer found!');
    return;
  }

  // Fineprint card
  const fineprintCard = document.createElement('div');
  fineprintCard.className = 'card border-primary mb-3';
  fineprintCard.style.maxWidth = '100%';

  fineprintCard.innerHTML = `
    <div class="card-header">Fineprint</div>
    <div class="card-body" id="contact">
      <p class="card-text">
        Let me (<a href="https://www.torn.com/profiles.php?XID=1132772" class="card-link" target="_blank">byrod [1132772]</a>) know if you run into any issues. Thanks! 
        Your API key is only used to call <a href="https://api.torn.com" target="_blank">https://api.torn.com</a> or <a href="https://tornstats.com" target="_blank">https://tornstats.com</a> and is only stored locally in your browser. All your data stays in your browser, nothing gets sent to me or any other server.<br /><br />
        <a href="#" data-toggle="modal" data-target="#disclaimerModal">View full API disclaimer (aka: What happens with my API key?)</a>
      </p>
    </div>
  `;

  // Ko-fi link
  const kofiLink = document.createElement('a');
  kofiLink.href = 'https://ko-fi.com/N4N6L8OBN';
  kofiLink.target = '_blank';

  const kofiImg = document.createElement('img');
  kofiImg.height = 36;
  kofiImg.style.border = '0px';
  kofiImg.src = 'https://storage.ko-fi.com/cdn/kofi2.png?v=3';
  kofiImg.alt = 'Buy Me a Coffee at ko-fi.com';

  kofiLink.appendChild(kofiImg);

  // Disclaimer modal
  const modalWrapper = document.createElement('div');
  modalWrapper.innerHTML = `
    <div class="modal fade" id="disclaimerModal" tabindex="-1" role="dialog" aria-labelledby="disclaimerTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-scrollable" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="disclaimerTitle">Torn Engine – API Key Usage Disclaimer</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <strong class="text-primary">tl;dr: How Torn Engine handles your data:</strong><br>
            I don’t see anything you do with Torn Engine. All your data stays in your browser, nothing gets sent to me (byrod) or any server. <br>
            Your API key, filters, and spy data are stored only on your device to make the tools work better for you.
            I never have access to your data, I'm just offering tools so you can see your API data more easily using your access.<br><br>

            <strong class="text-primary">Data Storage:</strong><br>
            API data is not stored permanently. All processing is done locally in your browser. Spy data from TornStats, and your selected filters from the Members section, are stored temporarily in session/local storage to enhance your session. No data is stored on external servers.<br><br>

            <strong class="text-primary">Data Sharing:</strong><br>
            Your data and API key are not shared with anyone. All API calls are made directly from your browser to Torn's API.<br><br>

            <strong class="text-primary">Key Storage & Sharing:</strong><br>
            API keys are stored only locally in your browser's storage. They are never transmitted to any server or third party.<br><br>

            <strong class="text-primary">Key Access Level Required:</strong><br>
            Most general features require Public access only. Some advanced faction features require Full access and faction API access.<br>
            You can see the specific level required per tool on each page, directly under the API key field.<br><br>

            <strong class="text-primary">Purpose of Use:</strong><br>
            This toolset is created for faction optimization, analysis, and coordination. It may also support public amusement through fun tools like timestamp formatting or Trailers!
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Append everything
  container.appendChild(fineprintCard);
  container.appendChild(kofiLink);
  container.appendChild(document.createElement('br'));
  container.appendChild(document.createElement('br'));
  container.appendChild(modalWrapper);
}


/**
 * Builds the month selection dropdown. This function gets the last 12 months' options
 * and sets them in the #monthSelect element.
 */
function buildMonthDropdown() {
  const monthSelect = document.getElementById('monthSelect');
  if (!monthSelect) return;

  const options = generateLast12MonthsOptions();
  monthSelect.innerHTML = options.map(opt =>
    `<option value="${opt.value}">${opt.label}</option>`
  ).join('');
}
