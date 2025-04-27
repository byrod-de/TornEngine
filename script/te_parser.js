/**
 * Parses property information and updates the specified HTML element with a summary.
 *
 * @param {Object} data - The data containing property information of a player.
 * @param {string} selection - The key to access specific property data within the data object.
 * @param {string} elementId - The ID of the HTML element where the summary will be inserted.
 *
 * This function counts the number of trailers owned by a player and their spouse,
 * then generates an HTML snippet summarizing these counts and inserts it into the
 * specified HTML element. The summary includes a link to the player's profile.
 */

function parsePropertyInfo(data, selection, elementId) {
    let countOwn = 0;
    let countSpouse = 0;
  
    const name = data['name'];
    const player_id = data['player_id'];
    const properties = data[selection];
  
    for (const key in properties) {
      const property = properties[key].property;
      const status = properties[key].status;
      if (property === 'Trailer') {
        if (status === 'Owned by them') {
          countOwn++;
        }
        if (status === 'Owned by their spouse') {
          countSpouse++;
        }
      }
    }
  
    const html = `
      <div class="alert alert-secondary">
        <a class="alert-link" href="https://www.torn.com/profiles.php?XID=${player_id}" target="_blank">${name} [${player_id}]</a>:<br />
        There are <span class="badge badge-primary">${countOwn}</span> trailer(s) owned by them and
        <span class="badge badge-light">${countSpouse}</span> trailer(s) owned by their spouse.
      </div>
    `;
  
    document.getElementById(elementId).innerHTML = html;
  }
  