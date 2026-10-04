import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import type { User } from "./src/api";
import { type Cart, InboxScreen, OrderScreen, ShopScreen, SignInScreen } from "./src/screens";
import { colors } from "./src/ui";

type Route = { name: "shop" } | { name: "inbox" } | { name: "order"; orderId: string };

export default function App() {
  const [session, setSession] = useState<{ token: string; user: User } | null>(null);
  const [route, setRoute] = useState<Route>({ name: "shop" });
  const [cart, setCart] = useState<Cart>({});

  return (
    <SafeAreaView style={appStyles.root}>
      <StatusBar style="dark" />
      {!session ? (
        <SignInScreen onSignedIn={(token, user) => setSession({ token, user })} />
      ) : (
        <>
          <View style={{ flex: 1 }}>
            {route.name === "shop" ? (
              <ShopScreen
                token={session.token}
                cart={cart}
                setCart={setCart}
                onOrdered={(order) => setRoute({ name: "order", orderId: order.id })}
              />
            ) : route.name === "inbox" ? (
              <InboxScreen token={session.token} onOpenOrder={(orderId) => setRoute({ name: "order", orderId })} />
            ) : (
              <OrderScreen token={session.token} orderId={route.orderId} onBack={() => setRoute({ name: "shop" })} />
            )}
          </View>
          <View style={appStyles.tabs}>
            <Tab label="Shop" active={route.name === "shop"} onPress={() => setRoute({ name: "shop" })} />
            <Tab label="Inbox" active={route.name === "inbox"} onPress={() => setRoute({ name: "inbox" })} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={appStyles.tab}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      testID={`tab-${label.toLowerCase()}`}
    >
      <Text style={[appStyles.tabLabel, active && { color: colors.accent }]}>{label}</Text>
    </Pressable>
  );
}

const appStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  tabs: { flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.surface },
  tab: { flex: 1, alignItems: "center", paddingVertical: 14 },
  tabLabel: { fontSize: 15, fontWeight: "600", color: colors.muted },
});
