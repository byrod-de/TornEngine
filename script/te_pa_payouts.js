document.addEventListener('DOMContentLoaded', () => {
    const submit = document.getElementById('submit');
  
    submit.addEventListener('click', () => {
      const key = getApiKey();
      if (!key || key.length !== 16) {
        printAlert('Error', 'Please enter a valid API key.');
        return;
      }
  
      const today = new Date();
      const currentMonth = today.getMonth();
      const monthOffset = parseInt(document.getElementById('monthSelect').value);
      const { firstDay, lastDay } = calculateMonthTimestamps(today, currentMonth - monthOffset, 192);
  
      callTornAPI({
        apiKey: key,
        part: 'faction',
        selections: 'basic,crimes',
        from: firstDay,
        to: lastDay
      });
    });
  });
  