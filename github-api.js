"use strict";

/** Módulo de consumo de la API pública de GitHub (reutilizable y testeable). */

const GITHUB_API_BASE = "https://api.github.com";

function validarUsuario(usuario) {
  if (typeof usuario !== "string" || usuario.trim() === "") {
    throw new TypeError("Debes ingresar un nombre de usuario de GitHub válido.");
  }
}

/**
 * Consulta el perfil público y los repositorios recientes de un usuario en GitHub.
 * @param {string} usuario Nombre de usuario en GitHub.
 * @param {typeof fetch} [fetchImpl] Implementación de fetch (inyectable para pruebas).
 */
async function obtenerPerfilGitHub(usuario, fetchImpl = globalThis.fetch) {
  validarUsuario(usuario);
  if (typeof fetchImpl !== "function") {
    throw new Error("El entorno no soporta peticiones fetch.");
  }

  const limpio = encodeURIComponent(usuario.trim());
  const headers = { Accept: "application/vnd.github+json" };

  let respUsuario;
  try {
    respUsuario = await fetchImpl(`${GITHUB_API_BASE}/users/${limpio}`, { headers });
  } catch {
    throw new Error("Error de conexión: no se pudo contactar con la API de GitHub.");
  }

  if (respUsuario.status === 404) {
    throw new Error(`El usuario "${usuario.trim()}" no existe en GitHub.`);
  }
  if (respUsuario.status === 403 || respUsuario.status === 429) {
    throw new Error("Límite de peticiones de GitHub excedido. Intenta de nuevo más tarde.");
  }
  if (!respUsuario.ok) {
    throw new Error(`Error al consultar GitHub (HTTP ${respUsuario.status}).`);
  }

  const perfil = await respUsuario.json();

  let repos = [];
  try {
    const respRepos = await fetchImpl(
      `${GITHUB_API_BASE}/users/${limpio}/repos?sort=updated&per_page=3`,
      { headers }
    );
    if (respRepos.ok) {
      repos = await respRepos.json();
    }
  } catch {
    // Si falla la carga secundaria de repos, conservamos el perfil principal.
  }

  return {
    login: perfil.login,
    nombre: perfil.name || perfil.login,
    avatarUrl: perfil.avatar_url,
    perfilUrl: perfil.html_url,
    reposPublicos: perfil.public_repos ?? 0,
    seguidores: perfil.followers ?? 0,
    repos: Array.isArray(repos)
      ? repos.map((r) => ({
          nombre: r.name,
          url: r.html_url,
          lenguaje: r.language || "Sin lenguaje",
        }))
      : [],
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { obtenerPerfilGitHub, validarUsuario };
}