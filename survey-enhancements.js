(() => {
  const config = window.SUPABASE_CONFIG || {};
  const money = value => new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0
  }).format(value || 0);
  const priceBox = document.querySelector('.prices');
  const originalPriceField = priceBox?.closest('.field');
  if (priceBox && originalPriceField) {
    originalPriceField.innerHTML = '<label for="monto_mensual">¿Cuánto pagarías mensualmente por este plan?</label><input id="monto_mensual" name="monto_mensual" type="number" min="0" step="1000" required placeholder="Ej. 100000"><small id="annualEstimate">Pago anual con 10% de descuento: $0</small>';
    const monthlyInput = document.getElementById('monto_mensual');
    const annualEstimate = document.getElementById('annualEstimate');
    monthlyInput.addEventListener('input', () => {
      annualEstimate.textContent = `Pago anual con 10% de descuento: ${money(Number(monthlyInput.value) * 12 * 0.9)}`;
    });
  }
  document.querySelector('.price')?.remove();
  const form = document.getElementById('testForm');
  const interestForm = document.getElementById('interestForm');
  const thanks = document.getElementById('thanks');
  if (!form || !interestForm) return;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!interestForm.reportValidity() || !form.reportValidity()) return;
    const formData = Object.fromEntries(new FormData(form));
    const interestData = Object.fromEntries(new FormData(interestForm));
    const monthly = Number(formData.monto_mensual);
    const importancias = Object.fromEntries(Object.entries(interestData).map(([key, value]) => [key, value]));
    const payload = {
      codigo_participante: formData.codigo,
      edad_mascota: formData.edad ? Number(formData.edad) : null,
      intencion: formData.intencion,
      acepta_red_cerrada: formData.red,
      monto_mensual: monthly,
      monto_anual_descuento: Math.round(monthly * 12 * 0.9),
      importancias_coberturas: importancias,
      comentario: formData.aceptacion_no_cubiertos,
      mejora: formData.mejora,
      fecha: new Date().toISOString(),
      version_prototipo: '3.1',
      modalidad: 'red prestacional cerrada sin reembolso externo'
    };
    localStorage.setItem(`senior_importancia_${Date.now()}`, JSON.stringify(payload));
    if (config.url && config.anonKey) {
      const response = await fetch(`${config.url}/rest/v1/${config.table || 'respuestas_senior_activa'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
          Prefer: 'return=minimal'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('No fue posible registrar la respuesta en Supabase');
      thanks.innerHTML = '<b>Gracias.</b> Respuesta enviada correctamente.';
    } else {
      thanks.innerHTML = '<b>Gracias.</b> Respuesta guardada localmente mientras se configura Supabase.';
    }
    thanks.style.display = 'block';
  }, { once: true });
})();
