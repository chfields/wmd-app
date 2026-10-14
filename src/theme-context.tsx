import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { colorsFor, resolveScheme, type ThemeColors, type ThemePreference } from "./theme";

type ThemeContextValue = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  scheme: "light" | "dark";
  colors: ThemeColors;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ preference, setPreference, children }: {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  children: ReactNode;
}) {
  const systemScheme = useColorScheme();
  const scheme = resolveScheme(preference, systemScheme === "light" || systemScheme === "dark" ? systemScheme : null);
  const value = useMemo(() => ({ preference, setPreference, scheme, colors: colorsFor(scheme) }), [preference, setPreference, scheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error("useTheme requires ThemeProvider");
  return theme;
}
