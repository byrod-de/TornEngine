document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  const path = location.pathname.split('/').pop() || 'index.html';
  buildHeader(path);
  buildMenu(path);
  if (path === 'index.html') {
    buildCards();
  }

  buildFooter();

  const modalToOpen = getQueryParam('openModal');
  if (modalToOpen === 'disclaimer') {
    const tryShowModal = () => {
      const modal = document.getElementById('disclaimerModal');
      if (modal) {
        $('#disclaimerModal').modal('show');
      } else {
        // Retry until the modal is injected by buildFooter
        setTimeout(tryShowModal, 50);
      }
    };
    tryShowModal();
  }
});

function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}