# Senior Activa

Prototipo estático de encuesta para evaluar una propuesta de seguro para mascotas senior.

## Publicación y guardado de respuestas

La página pública de la encuesta se publica desde GitHub Pages. GitHub aloja los archivos, pero no funciona como base de datos. Las respuestas se guardan en Supabase:

1. Crea un proyecto en [Supabase](https://supabase.com/) y ejecuta `supabase-schema.sql` en **SQL Editor**.
2. Para probarlo localmente, usa el `config.js` local con la URL y la clave pública `anon` de **Project Settings > API**.
3. Para publicarlo, configura en GitHub `Settings > Secrets and variables > Actions` las variables `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SUPABASE_TABLE`.
4. Activa GitHub Pages manualmente con **Settings > Pages > Source: GitHub Actions** antes de ejecutar el workflow. El workflow solo publica el sitio ya habilitado y genera `config.js` durante el despliegue, pero nunca lo guarda en el repositorio.

GitHub Pages no procesa archivos `.env` en un HTML estático. Por eso el archivo que lee la página es `config.js`, que queda excluido por `.gitignore`; el workflow lo crea solo en el artefacto de publicación. La clave `anon` o `publishable` está diseñada para estar en el navegador, pero nunca uses la clave `service_role` en el HTML ni en GitHub.

La página pública únicamente puede insertar respuestas; no tiene permiso para consultarlas.

Sin configuración, las respuestas se guardan únicamente en el navegador mediante `localStorage`; no son visibles para otros dispositivos.

## Revisar y descargar respuestas

La revisión no estará disponible en la página pública. Para analizar las respuestas desde el lugar donde administras el proyecto:

1. Entra al panel de tu proyecto en Supabase.
2. Abre **Table Editor > respuestas_senior_activa**.
3. Revisa todas las respuestas recibidas.
4. Usa la opción **Export** o **Download CSV** del editor de tabla para descargar los datos.

También puedes consultarlas desde **SQL Editor**:

```sql
select * from public.respuestas_senior_activa order by fecha desc;
```