"use strict";
const assert = require("node:assert");
const {
  sumar,
  restar,
  multiplicar,
  dividir,
  operar,
  formatear,
} = require("./calculadora");

const pruebas = {
  "suma básica y decimales"() {
    assert.strictEqual(sumar(2, 3), 5);
    assert.strictEqual(sumar(0.1, 0.2), 0.3);
    assert.strictEqual(sumar(-1, 1), 0);
  },
  "resta y multiplicación"() {
    assert.strictEqual(restar(5, 8), -3);
    assert.strictEqual(multiplicar(4, 2.5), 10);
  },
  "división normal y porcentaje"() {
    assert.strictEqual(dividir(10, 4), 2.5);
    assert.strictEqual(dividir(25, 100), 0.25);
  },
  "división entre cero lanza RangeError"() {
    assert.throws(() => dividir(10, 0), RangeError);
  },
  "tipos inválidos lanzan TypeError"() {
    assert.throws(() => sumar("2", 1), TypeError);
    assert.throws(() => sumar(NaN, 1), TypeError);
    assert.throws(() => multiplicar(null, 1), TypeError);
    assert.throws(() => dividir(5, Infinity), TypeError);
  },
  "operar con operador desconocido falla"() {
    assert.throws(() => operar(1, "^", 2), Error);
    assert.strictEqual(operar(6, "÷", 3), 2);
  },
  "formatear números normales y extremos"() {
    assert.strictEqual(formatear(0), "0");
    assert.strictEqual(formatear(42), "42");
    assert.match(formatear(1e20), /e\+20$/);
  },
};

let fallos = 0;
for (const [nombre, prueba] of Object.entries(pruebas)) {
  try {
    prueba();
    console.log(`✔ ${nombre}`);
  } catch (error) {
    fallos++;
    console.error(`✘ ${nombre}: ${error.message}`);
  }
}
process.exit(fallos ? 1 : 0);