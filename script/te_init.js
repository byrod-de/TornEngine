document.addEventListener('DOMContentLoaded', () => {
    const path = location.pathname.split('/').pop() || 'index.html';
    buildHeader(path);
    buildMenu(path);
    if (path === 'index.html') {
      buildCards();
    }
    buildFooter();
  });
  