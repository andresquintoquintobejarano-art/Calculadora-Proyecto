"use strict";

/** Interfaz de la calculadora y consulta a la API de GitHub. */
(() => {
  const MAX_DIGITOS = 15;
  const MAX_HISTORIAL = 8;

  const $pantalla = document.getElementById("pantalla");
  const $expresion = document.getElementById("expresion");
  const $mensaje = document.getElementById("mensaje");
  const $calculadora = document.getElementById("calculadora");
  const $historial = document.getElementById("historial");
  const $vacio = document.getElementById("historial-vacio");

  // Elementos del módulo API GitHub
  const $formGithub = document.getElementById("form-github");
  const $inputUsuario = document.getElementById("github-usuario");
  const $btnGithub = document.getElementById("btn-github");
  const $estadoGithub = document.getElementById("github-estado");
  const $resultadoGithub = document.getElementById("github-resultado");

  let actual = "0";
  let anterior = null;
  let operador = null;
  let reiniciar = false;
  let hayError = false;
  let ultimaExpresion = "";
  const historial = [];

  function render() {
    const textoPantalla = hayError ? "Error" : actual;
    $pantalla.textContent = textoPantalla;
    $pantalla.dataset.largo =
      textoPantalla.length > 12 ? "xl" : textoPantalla.length > 9 ? "lg" : "";

    if (hayError) {
      $expresion.textContent = "";
      return;
    }

    $expresion.textContent =
      anterior !== null ? `${formatear(anterior)} ${operador}` : ultimaExpresion;
  }

  function mostrarError(texto) {
    hayError = true;
    anterior = null;
    operador = null;
    reiniciar = false;
    $mensaje.textContent = texto;
    $calculadora.classList.remove("sacudir");
    void $calculadora.offsetWidth;
    $calculadora.classList.add("sacudir");
    render();
  }

  function limpiar() {
    actual = "0";
    anterior = null;
    operador = null;
    reiniciar = false;
    hayError = false;
    ultimaExpresion = "";
    $mensaje.textContent = "";
    render();
  }

  function intentar(a, op, b) {
    try {
      return operar(a, op, b);
    } catch (error) {
      mostrarError(error.message);
      return null;
    }
  }

  function ingresarDigito(digito) {
    if (hayError) limpiar();
    if (reiniciar) {
      actual = "0";
      reiniciar = false;
      if (operador === null) ultimaExpresion = "";
    }
    if (actual.replace(/[-.]/g, "").length >= MAX_DIGITOS) return;
    actual = actual === "0" ? digito : actual + digito;
    render();
  }

  function ingresarPunto() {
    if (hayError) limpiar();
    if (reiniciar) {
      actual = "0";
      reiniciar = false;
    }
    if (!actual.includes(".")) actual += ".";
    render();
  }

  function elegirOperador(op) {
    if (hayError) return;
    const valorActual = Number(actual);
    if (operador !== null && !reiniciar) {
      const resultado = intentar(anterior, operador, valorActual);
      if (resultado === null) return;
      anterior = resultado;
      actual = String(resultado);
    } else {
      anterior = valorActual;
    }
    operador = op;
    reiniciar = true;
    render();
  }

  function calcular() {
    if (hayError || operador === null) return;
    const b = Number(actual);
    const resultado = intentar(anterior, operador, b);
    if (resultado === null) return;
    ultimaExpresion = `${formatear(anterior)} ${operador} ${formatear(b)} =`;
    agregarHistorial(`${ultimaExpresion} ${formatear(resultado)}`);
    actual = String(resultado);
    anterior = null;
    operador = null;
    reiniciar = true;
    render();
  }

  function borrar() {
    if (hayError) {
      limpiar();
      return;
    }
    if (reiniciar) return;
    actual = actual.length > 1 && actual !== "-0" ? actual.slice(0, -1) : "0";
    if (actual === "-") actual = "0";
    render();
  }

  function cambiarSigno() {
    if (hayError || actual === "0") return;
    actual = actual.startsWith("-") ? actual.slice(1) : "-" + actual;
    render();
  }

  function porcentaje() {
    if (hayError) return;
    const resultado = intentar(Number(actual), "÷", 100);
    if (resultado === null) return;
    actual = String(resultado);
    reiniciar = true;
    render();
  }

  function agregarHistorial(texto) {
    historial.unshift(texto);
    if (historial.length > MAX_HISTORIAL) historial.pop();
    $historial.replaceChildren(
      ...historial.map((linea) => {
        const item = document.createElement("li");
        item.textContent = linea;
        return item;
      })
    );
    $vacio.hidden = true;
  }

  function limpiarHistorial() {
    historial.length = 0;
    $historial.replaceChildren();
    $vacio.hidden = false;
  }

  // --- Consumo de API de GitHub ---
  function renderPerfilGitHub(datos) {
    const tarjeta = document.createElement("div");
    tarjeta.className = "github-perfil";

    const avatar = document.createElement("img");
    avatar.src = datos.avatarUrl;
    avatar.alt = `Avatar de ${datos.login}`;

    const info = document.createElement("div");
    const enlace = document.createElement("a");
    enlace.href = datos.perfilUrl;
    enlace.target = "_blank";
    enlace.rel = "noopener noreferrer";
    enlace.textContent = datos.nombre;

    const meta = document.createElement("p");
    meta.className = "github-meta";
    meta.textContent = `@${datos.login} · ${datos.reposPublicos} repos · ${datos.seguidores} seg.`;

    info.append(enlace, meta);
    tarjeta.append(avatar, info);

    const lista = document.createElement("ul");
    lista.className = "github-repos";
    for (const repo of datos.repos) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = repo.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = repo.nombre;

      const lang = document.createElement("span");
      lang.textContent = repo.lenguaje;

      li.append(a, lang);
      lista.appendChild(li);
    }

    $resultadoGithub.replaceChildren(tarjeta, lista);
    $resultadoGithub.hidden = false;
  }

  async function consultarGitHub(usuario) {
    if (!$estadoGithub || !$resultadoGithub) return;
    $btnGithub.disabled = true;
    $estadoGithub.classList.remove("error");
    $estadoGithub.textContent = "Consultando API de GitHub...";

    try {
      const datos = await obtenerPerfilGitHub(usuario);
      $estadoGithub.textContent = "";
      renderPerfilGitHub(datos);
    } catch (error) {
      $resultadoGithub.hidden = true;
      $estadoGithub.classList.add("error");
      $estadoGithub.textContent = error.message;
    } finally {
      $btnGithub.disabled = false;
    }
  }

  if ($formGithub) {
    $formGithub.addEventListener("submit", (evento) => {
      evento.preventDefault();
      consultarGitHub($inputUsuario.value);
    });
  }

  const acciones = {
    limpiar,
    borrar,
    calcular,
    signo: cambiarSigno,
    porcentaje,
    punto: ingresarPunto,
    "limpiar-historial": limpiarHistorial,
  };

  document.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button");
    if (!boton) return;
    if (boton.dataset.num !== undefined) ingresarDigito(boton.dataset.num);
    else if (boton.dataset.op) elegirOperador(boton.dataset.op);
    else if (boton.dataset.accion && acciones[boton.dataset.accion]) {
      acciones[boton.dataset.accion]();
    }
  });

  const TECLAS_OPERADOR = { "+": "+", "-": "-", "*": "×", "/": "÷" };

  document.addEventListener("keydown", (evento) => {
    // Evita que escribir en el campo de usuario active los botones de la calculadora
    if (evento.target && evento.target.matches("input, textarea")) return;

    const { key } = evento;
    if (/^[0-9]$/.test(key)) ingresarDigito(key);
    else if (key === "." || key === ",") ingresarPunto();
    else if (key in TECLAS_OPERADOR) {
      evento.preventDefault();
      elegirOperador(TECLAS_OPERADOR[key]);
    } else if (key === "Enter" || key === "=") {
      evento.preventDefault();
      calcular();
    } else if (key === "Backspace") borrar();
    else if (key === "Escape") limpiar();
    else if (key === "%") porcentaje();
  });

  render();
  if ($inputUsuario && $inputUsuario.value) {
    consultarGitHub($inputUsuario.value);
  }
})();