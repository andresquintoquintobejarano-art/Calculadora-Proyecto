"use strict";

/** Lógica pura de la calculadora (sin DOM), reutilizable y testeable con Node. */

function validarNumero(valor, nombre) {
  if (typeof valor !== "number" || !Number.isFinite(valor)) {
    throw new TypeError(`El parámetro '${nombre}' debe ser un número válido.`);
  }
}

/** Evita errores típicos de punto flotante (ej. 0.1 + 0.2 => 0.3). */
function redondear(numero) {
  validarNumero(numero, "numero");
  return Number(numero.toPrecision(12));
}

function sumar(a, b) {
  validarNumero(a, "a");
  validarNumero(b, "b");
  return redondear(a + b);
}

function restar(a, b) {
  validarNumero(a, "a");
  validarNumero(b, "b");
  return redondear(a - b);
}

function multiplicar(a, b) {
  validarNumero(a, "a");
  validarNumero(b, "b");
  return redondear(a * b);
}

function dividir(a, b) {
  validarNumero(a, "a");
  validarNumero(b, "b");
  if (b === 0) {
    throw new RangeError("No se puede dividir entre cero.");
  }
  return redondear(a / b);
}

const OPERACIONES = {
  "+": sumar,
  "-": restar,
  "×": multiplicar,
  "÷": dividir,
};

function operar(a, operador, b) {
  const funcion = OPERACIONES[operador];
  if (!funcion) {
    throw new Error(`Operador no soportado: ${operador}`);
  }
  return funcion(a, b);
}

function formatear(numero) {
  validarNumero(numero, "numero");
  const abs = Math.abs(numero);
  if (abs !== 0 && (abs >= 1e15 || abs < 1e-9)) {
    return numero.toExponential(6);
  }
  return String(numero);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    sumar,
    restar,
    multiplicar,
    dividir,
    operar,
    redondear,
    formatear,
  };
}