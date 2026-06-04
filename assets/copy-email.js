(() => {
  const copyWithFallback = (text) => {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(field);
    if (!copied) throw new Error('copy failed');
  };

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    copyWithFallback(text);
  };

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-copy-email]');
    if (!button) return;

    const email = button.getAttribute('data-copy-email');
    const status = button.parentElement.querySelector('.copy-email-status');
    const label = button.textContent;

    button.disabled = true;
    try {
      await copyText(email);
      button.textContent = 'Adresse copiee';
      if (status) status.textContent = email;
    } catch {
      button.textContent = 'Adresse affichee';
      if (status) status.textContent = `Adresse : ${email}`;
    } finally {
      window.setTimeout(() => {
        button.disabled = false;
        button.textContent = label;
      }, 1800);
    }
  });
})();
