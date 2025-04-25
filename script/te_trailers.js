document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.getElementById('submit');
    submitButton.addEventListener('click', async (e) => {
      e.preventDefault();
  
      const key = getApiKey();
      const playerId = document.getElementById('playerid').value.trim() || '';
  
      if (!key || key.length !== 16) {
        printAlert('Error', 'Please enter a valid API key.');
        return;
      }
  
      await callTornAPI({
        apiKey: key,
        part: `user/${playerId}`,
        selections: 'basic,properties'
      });
    });
  });
  