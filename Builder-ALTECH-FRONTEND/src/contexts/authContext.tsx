import { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Define tipul de user pe baza răspunsului tău din backend
interface User {
  first_name: string;
  last_name: string;
  email: string;
  plan?: string;
}

// Define tipul contextului
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

// Creăm contextul inițial cu fallback null
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Providerul care va înconjura aplicația
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // La montare, luăm userul din localStorage (dacă există)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Funcție de logout rapid
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizat pentru a accesa contextul
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
