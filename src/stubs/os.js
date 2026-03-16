/**
 * Stub du module Node "os" pour le navigateur (utilisé par Fengari).
 * En environnement web, on renvoie des valeurs neutres.
 */
export function platform() {
  return "browser";
}

export default { platform };
