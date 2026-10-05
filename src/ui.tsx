/** Shared look: one palette, a button and a screen frame. */
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

export const colors = {
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

export function Screen({
  title,
  children,
  testID,
  headerRight,
}: {
  title: string;
  children: ReactNode;
  testID?: string;
  headerRight?: ReactNode;
}) {
  return (
    <View style={styles.screen} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {headerRight}
      </View>
      {children}
    </View>
  );
}

export function Button({
  label,
  onPress,
  disabled,
  busy,
  testID,
  tone = "primary",
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
  testID?: string;
  tone?: "primary" | "plain";
}) {
  const primary = tone === "primary";
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || busy}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.buttonPrimary : styles.buttonPlain,
        (disabled || busy) && styles.buttonDisabled,
        pressed && styles.buttonPressed,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={primary ? colors.accentInk : colors.accent} />
      ) : (
        <Text style={[styles.buttonLabel, { color: primary ? colors.accentInk : colors.accent }]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function ErrorText({ message, testID }: { message: string | null; testID?: string }) {
  if (!message) return null;
  return (
    <Text style={styles.error} testID={testID} accessibilityLiveRegion="polite">
      {message}
    </Text>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20, paddingTop: 24, gap: 16 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 28, fontWeight: "700", color: colors.ink },
  cartButton: { position: "relative", padding: 6 },
  cartBadge: {
    position: "absolute",
    right: -4,
    top: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
  },
  cartBadgeText: { color: colors.accentInk, fontSize: 11, fontWeight: "700" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 6,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  name: { fontSize: 17, fontWeight: "600", color: colors.ink },
  muted: { fontSize: 14, color: colors.muted },
  price: { fontSize: 16, fontWeight: "600", color: colors.ink },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
  button: { borderRadius: 10, paddingVertical: 14, paddingHorizontal: 18, alignItems: "center" },
  buttonPrimary: { backgroundColor: colors.accent },
  buttonPlain: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.accent },
  buttonDisabled: { opacity: 0.45 },
  buttonPressed: { opacity: 0.8 },
  buttonLabel: { fontSize: 16, fontWeight: "600" },
  error: { color: colors.danger, fontSize: 15 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" },
  lowStockBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    backgroundColor: colors.pending,
    color: colors.accentInk,
    fontSize: 13,
    fontWeight: "700",
  },
  badgeText: { color: "#fff", fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
});
