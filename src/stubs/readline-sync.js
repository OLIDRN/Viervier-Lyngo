/**
 * Stub du module "readline-sync" pour le navigateur (dépendance de Fengari/ldblib).
 * debug.debug() ne peut pas lire l'entrée de façon synchrone en web ; on renvoie une chaîne vide.
 */
export function setDefaultOptions() {}
export function prompt() {
  return "";
}

export default {
  setDefaultOptions,
  prompt,
};
