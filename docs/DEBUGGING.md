# Instrucciones de Debugging: Problema de Inserción de Contactos

## Contexto

- **Problema**: Los contactos no se guardan en la base de datos.

## Archivos Modificados

1. `app/database.js`
   - **Función `createContacto`**: Agregar logs detallados para capturar errores y datos enviados.
   - **Función `initializeTables`**: Verificar la existencia de la tabla `contactos` y registrar cualquier problema.

## Cambios Permitidos

- **Modificaciones mínimas**: Solo agregar logs de depuración.
- **No cambiar la estructura del código existente**.

## Resultado Esperado

- Logs detallados que muestren:
  1. Datos enviados al realizar un `INSERT`.
  2. Errores específicos en la creación de contactos.
  3. Estado de la tabla `contactos` al inicializar la base de datos.

## Pasos a Seguir

1. Implementar logs en las funciones mencionadas.
2. Probar la aplicación y capturar los logs generados.
3. Analizar los logs para identificar el problema.

---

**Nota**: No realizar cambios adicionales fuera de los especificados.
