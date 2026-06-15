/*
 * Guardar de forma persistente y local los datos de autenticación de usuario
 */

// TODO: Implementar la lógica real

interface AuthState {
  isAuthenticated: boolean;
}

export default function useAuthStore(arg: (arg0: AuthState) => any) {
  return arg({ isAuthenticated: true });
}
