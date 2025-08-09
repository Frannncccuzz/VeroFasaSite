
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#contatti form[action^="https://formsubmit.co/"]');
  if (!form) return;
  const statusBox = document.createElement('div');
  statusBox.id = 'formStatus';
  statusBox.className = 'mt-3';
  form.appendChild(statusBox);
  const ensureHidden = (name, value) => {
    let el = form.querySelector(`input[name="${name}"]`);
    if (!el) {
      el = document.createElement('input');
      el.type = 'hidden';
      el.name = name;
      form.appendChild(el);
    }
    el.value = value;
  };
  const submitBtn = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const oggettoSel = form.querySelector('#oggetto');
    const oggettoTxt = oggettoSel && oggettoSel.value ? `: ${oggettoSel.value}` : '';
    ensureHidden('_subject', `Contatto dal sito${oggettoTxt}`);
    ensureHidden('_template', 'table');
    ensureHidden('_captcha', 'false');
    ensureHidden('_honey', '');

    const originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Invio...';
    }
    statusBox.textContent = '';
    statusBox.className = 'mt-3';
    try {
      const formData = new FormData(form);
      const resp = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' } 
      });

      if (!resp.ok) {
        let msg = 'Errore imprevisto durante l’invio.';
        try {
          const data = await resp.json();
          if (data && data.message) msg = data.message;
        } catch(_) {}
        throw new Error(msg);
      }
      statusBox.textContent = 'Grazie! Il messaggio è stato inviato correttamente';
      statusBox.className = 'alert alert-success mt-3';
      form.reset();
    } catch (err) {
      statusBox.textContent = `Ops! ${err.message || 'Qualcosa è andato storto.'}`;
      statusBox.className = 'alert alert-danger mt-3';
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  });
});
