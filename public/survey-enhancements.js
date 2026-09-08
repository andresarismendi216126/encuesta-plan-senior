(() => {
  'use strict';
  
  const config = window.SUPABASE_CONFIG || {};
  const annualBagDescription = 'Los $2.500.000 son el monto máximo total compartido para hospitalización, cirugía y/o urgencias. Puedes utilizar una, dos o las tres atenciones, pero la bolsa completa solo está disponible una vez por vigencia anual.';
  
  // Actualizar descripción de bolsa
  const annualBag = [...document.querySelectorAll('.bag')].find(element => element.textContent.includes('$2.500.000'));
  if (annualBag) {
    const description = annualBag.querySelector('p');
    if (description) description.textContent = annualBagDescription;
  }
  
  document.querySelector('.price')?.remove();
  
  const form = document.getElementById('testForm');
  const interestForm = document.getElementById('interestForm');
  const thanks = document.getElementById('thanks');
  
  if (!form || !interestForm || !thanks) {
    console.error('Formularios no encontrados');
    return;
  }
  
  form.addEventListener('submit', function(event) {
    // CRITICAL: Prevenir reload a cualquier costo
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    console.log('=== SUBMIT DETECTADO ===');
    
    // Validar
    if (!interestForm.reportValidity() || !form.reportValidity()) {
      console.log('Formulario inválido');
      return;
    }
    
    // Recopilar datos
    const formData = Object.fromEntries(new FormData(form));
    const interestData = Object.fromEntries(new FormData(interestForm));
    
    const importancias = { ...interestData };
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
    
    // Guardar en localStorage primero
    const localKey = `senior_importancia_${Date.now()}`;
    try {
      localStorage.setItem(localKey, JSON.stringify(payload));
      console.log('✅ Guardado en localStorage:', localKey);
    } catch (e) {
      console.error('Error localStorage:', e);
    }
    
    // Si no hay Supabase, mostrar mensaje
    if (!config.url || !config.anonKey) {
      thanks.innerHTML = '<b>Gracias.</b> Respuesta guardada localmente (Supabase no configurado).';
      thanks.style.display = 'block';
      return;
    }
    
    // Intentar enviar a Supabase (async, sin bloquear)
    sendToSupabase(payload, localKey);
  }, false);
  
  // Función para enviar a Supabase
  async function sendToSupabase(payload, localKey) {
    const supabaseUrl = config.url.replace(/\/+$/, '');
    const tableName = config.table || 'respuestas_senior_activa';
    
    try {
      console.log('Enviando a Supabase...');
      
      const fetchUrl = `${supabaseUrl}/rest/v1/${tableName}`;
      const response = await fetch(fetchUrl, {
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
      });
      
      console.log('Status:', response.status);
      
      if (response.ok) {
        console.log('✅ Guardado en Supabase');
        thanks.innerHTML = '<b>Gracias.</b> Respuesta enviada correctamente a Supabase.';
      } else {
        const text = await response.text();
        console.error('Error HTTP', response.status, ':', text);
        thanks.innerHTML = '<b>⚠️ Guardado localmente.</b> Supabase respondió con error HTTP ' + response.status;
      }
      
    } catch (error) {
      console.error('Error Supabase:', error.message);
      thanks.innerHTML = '<b>✅ Guardado localmente.</b> No fue posible conectar a Supabase: ' + error.message;
    }
    
    thanks.style.display = 'block';
  }
})();
