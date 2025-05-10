document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  const path = location.pathname.split('/').pop() || 'index.html';
  buildHeader(path);
  buildMenu(path);
  if (path === 'index.html') {
    buildCards();
  }
  buildFooter();
});
