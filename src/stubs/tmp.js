/**
 * Stub du module "tmp" pour le navigateur (dépendance de Fengari/loslib).
 * En environnement web, on renvoie un chemin factice pour tmpNameSync.
 */
export function tmpNameSync() {
  return "/tmp/fengari-browser";
}

export default {
  tmpNameSync,
};
