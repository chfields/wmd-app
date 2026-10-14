/** App-local theme preferences and palettes, independent of React Native. */
export type ThemePreference = "system" | "light" | "dark";

export const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export const lightColors = {
  background: "#f6f4ef",
  surface: "#ffffff",
  ink: "#1d2420",
  muted: "#66706a",
  line: "#e2ded5",
  accent: "#2f6b4f",
  accentInk: "#ffffff",
  danger: "#b3402a",
  good: "#2f6b4f",
  pending: "#b7791f",
};

export type ThemeColors = typeof lightColors;

export const darkColors: ThemeColors = {
  background: "#121815",
  surface: "#1d2822",
  ink: "#f1f4ef",
  muted: "#a8b5ac",
  line: "#3b4b41",
  accent: "#9bd5b1",
  accentInk: "#121815",
  danger: "#ff9b85",
  good: "#9bd5b1",
  pending: "#edbe72",
};

export function resolveScheme(preference: ThemePreference, systemScheme: "light" | "dark" | null | undefined): "light" | "dark" {
  return preference === "system" ? systemScheme ?? "light" : preference;
}

export function colorsFor(scheme: "light" | "dark"): ThemeColors {
  return scheme === "dark" ? darkColors : lightColors;
}
