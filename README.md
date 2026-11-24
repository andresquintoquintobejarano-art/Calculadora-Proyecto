# Herramienta 4 - API-GitHub · Calculadora Web

Calculadora web con interfaz moderna (estilo glassmorphism), historial de operaciones, soporte de teclado, validación de entradas, manejo de errores y consumo de la API REST pública de GitHub.

## Estructura

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Estructura y accesibilidad de la interfaz |
| `styles.css` | Estilos, animaciones y diseño responsive |
| `calculadora.js` | Lógica pura: `sumar`, `restar`, `multiplicar`, `dividir`, `operar`, `formatear` |
| `github-api.js` | Consumo de la API REST pública de GitHub (`obtenerPerfilGitHub`) |
| `app.js` | Estado de la interfaz, eventos de botones, teclado y renderizado de perfil |
| `test.js` | Pruebas automáticas unitarias y de API con mocks (Node.js) |

## Consumo de la API de GitHub

La aplicación consulta los endpoints públicos `https://api.github.com/users/{usuario}` y `https://api.github.com/users/{usuario}/repos` mediante `fetch` (sin necesidad de token expuesto en el código).

## Manejo de errores

- **Calculadora:**
  - División entre cero: `dividir` lanza `RangeError` y la interfaz muestra el mensaje con una animación.
  - Entradas inválidas (no numéricas, `NaN`, `null`, `Infinity`): lanzan `TypeError`.
  - Operadores desconocidos: lanzan `Error`.
- **API de GitHub:**
  - Usuario vacío o inválido: lanza `TypeError`.
  - Usuario inexistente (`404`), límite de peticiones excedido (`403` / `429`), errores HTTP y fallos de red: muestran mensajes claros en la interfaz.

## Uso

Abre `index.html` en el navegador.
- **Calculadora:** números (`0-9`), operadores (`+ - * /`), `Enter` o `=` para calcular, `Esc` para limpiar, `Backspace` para borrar y `%` para porcentaje.
- **API GitHub:** escribe cualquier nombre de usuario de GitHub en el panel derecho y presiona **Buscar**.

## Pruebas

```bash
node test.js