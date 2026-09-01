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
    const importancias = { ...Object.fromEntries(Object.entries(interestData)) };
    importancias.bolsa_alta_complejidad_descripcion = annualBagDescription;

    const genero = formData.genero || formData.sexo_persona || null;
    const payload = {
      codigo_participante: formData.nombre_completo,
      edad_mascota: formData.edad ? Number(formData.edad) : null,
      estrato_socioeconomico: formData.estrato_socioeconomico ? Number(formData.estrato_socioeconomico) : null,
      edad_persona: formData.edad_persona ? Number(formData.edad_persona) : null,
      sexo_persona: genero,
      genero: genero,
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

    const localKey = `senior_importancia_${Date.now()}`;
    localStorage.setItem(localKey, JSON.stringify(payload));

    if (!config.url || !config.anonKey) {
      thanks.innerHTML = '<b>Gracias.</b> Respuesta guardada localmente mientras se configura Supabase.';
      thanks.style.display = 'block';
      return;
    }

    const supabaseUrl = config.url.replace(/\/+$/, '');
    const tableName = config.table || 'respuestas_senior_activa';

    try {
      console.log('Enviando a:', supabaseUrl + '/rest/v1/' + tableName);
      console.log('Config URL:', config.url);
      console.log('Config tabla:', tableName);
      
      const fetchUrl = `${supabaseUrl}/rest/v1/${tableName}`;
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
          Prefer: 'return=minimal'
        },
        mode: 'cors',
        body: JSON.stringify(payload)
      };
      
      console.log('Headers:', fetchOptions.headers);
      console.log('Body (primeros 100 chars):', JSON.stringify(payload).substring(0, 100));
      
      const response = await fetch(fetchUrl, fetchOptions);
      
      console.log('Status HTTP:', response.status, response.ok);
      const responseText = await response.text();
      console.log('Respuesta del servidor:', responseText);
      
      let errorMessage = 'No fue posible registrar la respuesta en Supabase';

      if (responseText) {
        try {
          const parsed = JSON.parse(responseText);
          if (parsed && parsed.message) errorMessage = parsed.message;
          console.log('Error parsed:', parsed);
        } catch (parseError) {
          console.warn('No es JSON valido:', responseText);
        }
      }

      if (!response.ok) {
        throw new Error(`${errorMessage} (HTTP ${response.status})`);
      }

      console.log('✅ Exitoso');
      thanks.innerHTML = '<b>Gracias.</b> Respuesta enviada correctamente.';
      thanks.style.display = 'block';
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Mensaje:', error.message);
      localStorage.setItem(`${localKey}_error`, JSON.stringify({
        payload,
        error: String(error),
        timestamp: new Date().toISOString()
      }));
      thanks.innerHTML = '<b>Error:</b> ' + error.message + '<br><small>Respuesta guardada localmente.</small>';
      thanks.style.display = 'block';
    }
  }, { once: true });
})();
