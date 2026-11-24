"use strict";

/** Interfaz de la calculadora: maneja el estado, los botones y el teclado. */
(() => {
  const MAX_DIGITOS = 15;
  const MAX_HISTORIAL = 8;

  const $pantalla = document.getElementById("pantalla");
  const $expresion = document.getElementById("expresion");
  const $mensaje = document.getElementById("mensaje");
  const $calculadora = document.getElementById("calculadora");
  const $historial = document.getElementById("historial");
  const $vacio = document.getElementById("historial-vacio");

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

    const numeroActual = Number(actual);
    $expresion.textContent =
      anterior !== null
        ? `${formatear(anterior)} ${operador}`
        : ultimaExpresion || (Number.isFinite(numeroActual) ? "" : "");
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
    const valor = Number(actual);
    const resultado = intentar(valor, "÷", 100);
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
})();