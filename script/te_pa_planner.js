document.addEventListener('DOMContentLoaded', () => {
    const submit = document.getElementById('submit');
  
    submit.addEventListener('click', () => {
      const key = getApiKey();
      if (!key || key.length !== 16) {
        printAlert('Error', 'Please enter a valid API key.');
        return;
      }
  
      callTornAPI({
        apiKey: key,
        part: 'faction',
        selections: 'basic,crimeexp'
      });
    });
  });
  