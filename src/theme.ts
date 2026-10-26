/** App-local theme preferences and palettes, independent of React Native. */
export type ThemePreference = "system" | "light" | "dark";

export const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export const lightColors = {
  background: "#f0f7fc",
  surface: "#ffffff",
  ink: "#14212b",
  muted: "#5f7180",
  line: "#d4e5f2",
  accent: "#5aaee6",
  accentInk: "#0b2233",
  danger: "#b3402a",
  good: "#2f6b4f",
  pending: "#b7791f",
};

export type ThemeColors = typeof lightColors;

export const darkColors: ThemeColors = {
  background: "#0f1820",
  surface: "#1a2631",
  ink: "#eef5fb",
  muted: "#a3b6c6",
  line: "#34495b",
  accent: "#8fd0f5",
  accentInk: "#0f1820",
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
