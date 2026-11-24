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
const { obtenerPerfilGitHub } = require("./github-api");

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
  },
  "operar con operador desconocido falla"() {
    assert.throws(() => operar(1, "^", 2), Error);
    assert.strictEqual(operar(6, "÷", 3), 2);
  },
  "formatear números extremos"() {
    assert.strictEqual(formatear(0), "0");
    assert.strictEqual(formatear(42), "42");
    assert.match(formatear(1e20), /e\+20$/);
  },
  async "API GitHub: valida usuario vacío"() {
    await assert.rejects(() => obtenerPerfilGitHub("   "), TypeError);
  },
  async "API GitHub: maneja usuario inexistente (404)"() {
    const fetch404 = async () => ({ ok: false, status: 404 });
    await assert.rejects(
      () => obtenerPerfilGitHub("usuario-inexistente", fetch404),
      /no existe en GitHub/
    );
  },
  async "API GitHub: maneja límite excedido (403)"() {
    const fetch403 = async () => ({ ok: false, status: 403 });
    await assert.rejects(
      () => obtenerPerfilGitHub("octocat", fetch403),
      /Límite de peticiones/
    );
  },
  async "API GitHub: maneja error de red"() {
    const fetchRed = async () => {
      throw new Error("Network down");
    };
    await assert.rejects(
      () => obtenerPerfilGitHub("octocat", fetchRed),
      /Error de conexión/
    );
  },
  async "API GitHub: retorna perfil y repositorios correctamente"() {
    const fetchOk = async (url) => {
      if (url.endsWith("/repos?sort=updated&per_page=3")) {
        return {
          ok: true,
          status: 200,
          json: async () => [
            { name: "calculadora", html_url: "https://github.com/u/calc", language: "JavaScript" },
          ],
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          login: "octocat",
          name: "The Octocat",
          avatar_url: "https://avatars.githubusercontent.com/u/583231",
          html_url: "https://github.com/octocat",
          public_repos: 8,
          followers: 1000,
        }),
      };
    };

    const datos = await obtenerPerfilGitHub("octocat", fetchOk);
    assert.strictEqual(datos.login, "octocat");
    assert.strictEqual(datos.reposPublicos, 8);
    assert.strictEqual(datos.repos.length, 1);
    assert.strictEqual(datos.repos[0].nombre, "calculadora");
  },
};

(async () => {
  let fallos = 0;
  for (const [nombre, prueba] of Object.entries(pruebas)) {
    try {
      await prueba();
      console.log(`✔ ${nombre}`);
    } catch (error) {
      fallos++;
      console.error(`✘ ${nombre}: ${error.message}`);
    }
  }
  process.exit(fallos ? 1 : 0);
})();