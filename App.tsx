import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import type { Product, User } from "./src/api";
import { CartScreen, type Cart, InboxScreen, OrderScreen, ShopScreen, SignInScreen, SettingsScreen } from "./src/screens";
import { ThemeProvider, useTheme } from "./src/theme-context";
import type { ThemeColors, ThemePreference } from "./src/theme";

type Route = { name: "shop" } | { name: "cart" } | { name: "inbox" } | { name: "settings" } | { name: "order"; orderId: string };

export default function App() {
  const [preference, setPreference] = useState<ThemePreference>("system");
  return (
    <ThemeProvider preference={preference} setPreference={setPreference}>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { colors, scheme } = useTheme();
  const appStyles = useMemo(() => makeAppStyles(colors), [colors]);
  const [session, setSession] = useState<{ token: string; user: User } | null>(null);
  const [route, setRoute] = useState<Route>({ name: "shop" });
  const [cart, setCart] = useState<Cart>({});
  const [cartProducts, setCartProducts] = useState<Record<string, Product>>({});

  return (
    <SafeAreaView style={appStyles.root} testID="app-root">
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      {!session ? (
        <SignInScreen onSignedIn={(token, user) => setSession({ token, user })} />
      ) : (
        <>
          <View style={appStyles.content}>
            {route.name === "shop" ? (
              <ShopScreen
                cart={cart}
                setCart={setCart}
                onAddProduct={(product) => setCartProducts((current) => ({ ...current, [product.id]: product }))}
                onOpenCart={() => setRoute({ name: "cart" })}
              />
            ) : route.name === "cart" ? (
              <CartScreen
                token={session.token}
                cart={cart}
                products={cartProducts}
                setCart={setCart}
                onBack={() => setRoute({ name: "shop" })}
                onOrdered={(order) => setRoute({ name: "order", orderId: order.id })}
              />
            ) : route.name === "inbox" ? (
              <InboxScreen token={session.token} onOpenOrder={(orderId) => setRoute({ name: "order", orderId })} />
            ) : route.name === "settings" ? (
              <SettingsScreen />
            ) : (
              <OrderScreen token={session.token} orderId={route.orderId} onBack={() => setRoute({ name: "shop" })} />
            )}
          </View>
          <View style={appStyles.tabs}>
            <Tab label="Shop" active={route.name === "shop" || route.name === "cart"} onPress={() => setRoute({ name: "shop" })} />
            <Tab label="Inbox" active={route.name === "inbox"} onPress={() => setRoute({ name: "inbox" })} />
            <Tab label="Settings" active={route.name === "settings"} onPress={() => setRoute({ name: "settings" })} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  const appStyles = useMemo(() => makeAppStyles(colors), [colors]);
  return (
    <Pressable
      onPress={onPress}
      style={appStyles.tab}
      role="tab"
      aria-selected={active}
      testID={`tab-${label.toLowerCase()}`}
    >
      <Text style={[appStyles.tabLabel, active && appStyles.activeTabLabel]}>{label}</Text>
    </Pressable>
  );
}

const makeAppStyles = (colors: ThemeColors) => StyleSheet.create({
  content: { flex: 1 },
  activeTabLabel: { color: colors.accent },
  root: { flex: 1, backgroundColor: colors.background },
  tabs: { flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.surface },
  tab: { flex: 1, alignItems: "center", paddingVertical: 14 },
  tabLabel: { fontSize: 15, fontWeight: "600", color: colors.muted },
});
