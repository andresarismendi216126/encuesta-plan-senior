(() => {
  const config = window.SUPABASE_CONFIG || {};
  const annualBagDescription = 'Los $2.500.000 son el monto máximo total compartido para hospitalización, cirugía y/o urgencias. Puedes utilizar una, dos o las tres atenciones, pero la bolsa completa solo está disponible una vez por vigencia anual.';
  const annualBag = [...document.querySelectorAll('.bag')].find(element => element.textContent.includes('$2.500.000'));
  if (annualBag) {
    const description = annualBag.querySelector('p');
    if (description) description.textContent = annualBagDescription;
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
    const importancias = Object.fromEntries(Object.entries(interestData).map(([key, value]) => [key, value]));
    importancias.bolsa_alta_complejidad_descripcion = annualBagDescription;
    const payload = {
      codigo_participante: formData.codigo,
      edad_mascota: formData.edad ? Number(formData.edad) : null,
      estrato_socioeconomico: formData.estrato_socioeconomico ? Number(formData.estrato_socioeconomico) : null,
      edad_persona: formData.edad_persona ? Number(formData.edad_persona) : null,
      sexo_persona: formData.sexo_persona,
      sexo_mascota: formData.sexo_mascota,
      intencion: formData.intencion,
      acepta_red_cerrada: formData.red,
      precio: formData.rango_precio,
      importancias_coberturas: importancias,
      comentario: formData.aceptacion_no_cubiertos,
      mejora: formData.mejora,
      fecha: new Date().toISOString(),
      version_prototipo: '3.2',
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
