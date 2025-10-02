// js/submit.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('recordForm');
  const msg = document.getElementById('responseMsg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const json = await res.json();
      msg.textContent = json.message || 'Success!';
      msg.style.color = 'green';
      form.reset();
    } catch (err) {
      msg.textContent = 'Error submitting: ' + err.message;
      msg.style.color = 'red';
    }
  });
});
