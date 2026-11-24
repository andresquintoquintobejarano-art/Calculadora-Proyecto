# Herramienta 4 - API-GitHub · Calculadora Web

Calculadora web con interfaz moderna (estilo glassmorphism), historial de operaciones, soporte de teclado, validación de entradas y manejo de errores.

## Estructura

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Estructura y accesibilidad de la interfaz |
| `styles.css` | Estilos, animaciones y diseño responsive |
| `calculadora.js` | Lógica pura: `sumar`, `restar`, `multiplicar`, `dividir`, `operar` |
| `app.js` | Estado de la interfaz, botones y teclado |
| `test.js` | Pruebas automáticas (Node.js) |

## Manejo de errores

- División entre cero: `dividir` lanza `RangeError` y la interfaz muestra el mensaje con una animación.
- Entradas inválidas (no numéricas, `NaN`, `null`): lanzan `TypeError`.
- Operadores desconocidos: lanzan `Error`.

## Uso

Abre `index.html` en el navegador. Atajos: números, `+ - * /`, `Enter`, `Esc`, `Backspace`, `%`.

## Pruebas

```bash
node test.js
```

## Autor

Davier Andrés Quinto Bejarano - SENA ADSO, ficha 3229209
# Calculadora-Proyecto
