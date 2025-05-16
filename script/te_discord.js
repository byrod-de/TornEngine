// te_discord.js

document.addEventListener('DOMContentLoaded', () => {
    formatDiscordTimestamp();
  });
  function formatDiscordTimestamp() {
    const dateInput = document.getElementById('inputDate');
    const timeInput = document.getElementById('inputTime');
    const typeInput = document.getElementById('formatSelection');
    const output = document.getElementById('outputCode');
    const preview = document.getElementById('outputDate');
    const copyButton = document.getElementById('copyButton');
    const useGmtCheckbox = document.getElementById('useGmtCheckbox');
  
    const localTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
  
    dateInput.addEventListener('input', updateOutput);
    timeInput.addEventListener('input', updateOutput);
    typeInput.addEventListener('input', updateOutput);
    useGmtCheckbox.addEventListener('change', updateOutput);
    output.addEventListener('mouseover', function () { this.select(); });
    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(output.value);
    
        const confirm = document.getElementById('copyConfirm');
        if (confirm) {
          confirm.style.display = 'inline';
          output.className = 'form-control is-valid';
          setTimeout(() => output.className = 'form-control', 2000);
          setTimeout(() => confirm.style.display = 'none', 2000);
        }
      } catch (e) {
        alert(e);
      }
    });
    
  
    const onload = _ => {
      const now = new Date();
      dateInput.value = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
      timeInput.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      updateOutput();
    };
    window.onload = onload;
  
    const typeFormats = {
      't': { timeStyle: 'short' },
      'T': { timeStyle: 'medium' },
      'd': { dateStyle: 'short' },
      'D': { dateStyle: 'long' },
      'f': { dateStyle: 'long', timeStyle: 'short' },
      'F': { dateStyle: 'full', timeStyle: 'short' },
      'R': { style: 'long', numeric: 'auto' },
    };
    function automaticRelativeDifference(d) {
      const secondsDiff = Math.round((new Date() - d) / 1000) * -1;
      const absSeconds = Math.abs(secondsDiff);

      if (absSeconds > 86400 * 30 * 10) {
        const duration = Math.round(secondsDiff / (86400 * 365));
        return { duration: duration, unit: 'years' };
      }
      if (absSeconds > 86400 * 25) {
        const duration = Math.round(secondsDiff / (86400 * 30));
        return { duration: duration, unit: 'months' };
      }
      if (absSeconds > 3600 * 21) {
        const duration = Math.round(secondsDiff / 86400);
        return { duration: duration, unit: 'days' };
      }
      if (absSeconds > 60 * 44) {
        const duration = Math.round(secondsDiff / 3600);
        return { duration: duration, unit: 'hours' };
      }
      if (absSeconds > 30) {
        const duration = Math.round(secondsDiff / 60);
        return { duration: duration, unit: 'minutes' };
      }
      const duration = secondsDiff;
      return { duration: duration, unit: 'seconds' };
    }
  
    function updateOutput() {
      const selectedTimeZone = useGmtCheckbox.checked ? 0 : localTimezoneOffset;
      const combinedMilliseconds = dateInput.valueAsNumber + timeInput.valueAsNumber + selectedTimeZone;
      const selectedDate = new Date(combinedMilliseconds);
      const timestamp = Math.floor(selectedDate.getTime() / 1000);
      output.value = `<t:${timestamp}:${typeInput.value}>`;
  
      if (['R'].includes(typeInput.value)) {
        const formatter = new Intl.RelativeTimeFormat(navigator.language || 'en', typeFormats[typeInput.value] || {});
        const format = automaticRelativeDifference(selectedDate);
        preview.value = formatter.format(format.duration, format.unit);
      } else {
        const formatter = new Intl.DateTimeFormat(navigator.language || 'en', typeFormats[typeInput.value] || {});
        preview.value = formatter.format(selectedDate);
      }
    }
  }