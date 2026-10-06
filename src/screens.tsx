/** The four screens of the first journey: sign in, shop, order status, inbox. */
import { useCallback, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { api, ApiError, money, type Notification, type Order, type Product, type User } from "./api";
import { Button, colors, ErrorText, Screen, styles } from "./ui";
import { stockLabel } from "./restock";

const messageOf = (error: unknown): string =>
  error instanceof ApiError ? error.message : "Something went wrong. Try again.";

export function SignInScreen({ onSignedIn }: { onSignedIn: (token: string, user: User) => void }) {
  const [email, setEmail] = useState("demo@wmd.shop");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const session = await api.signIn(email, password);
      onSignedIn(session.token, session.user);
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title="WMD Shop" testID="sign-in-screen">
      <Text style={styles.muted}>Sign in to order.</Text>
      <TextInput
        testID="email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        accessibilityLabel="Email"
      />
      <TextInput
        testID="password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Password"
        accessibilityLabel="Password"
        onSubmitEditing={submit}
      />
      <ErrorText message={error} testID="sign-in-error" />
      <Button label="Sign in" onPress={submit} busy={busy} disabled={!email || !password} testID="sign-in" />
    </Screen>
  );
}

export type Cart = Record<string, number>;

export function ShopScreen({
  cart,
  setCart,
  onAddProduct,
  onOpenCart,
}: {
  cart: Cart;
  setCart: (cart: Cart) => void;
  onAddProduct: (product: Product) => void;
  onOpenCart: () => void;
}) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    const timer = setTimeout(() => {
      api
        .products(query.trim() || undefined)
        .then((list) => current && (setProducts(list), setError(null)))
        .catch((err) => current && setError(messageOf(err)));
    }, 200);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [query]);

  const add = (product: Product, delta: number) => {
    onAddProduct(product);
    const next = { ...cart, [product.id]: Math.max(0, Math.min(product.stock, (cart[product.id] ?? 0) + delta)) };
    if (next[product.id] === 0) delete next[product.id];
    setCart(next);
  };

  const itemCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  const cartLabel = itemCount === 0 ? "Cart, empty" : `Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`;

  return (
    <Screen
      title="Shop"
      testID="shop-screen"
      headerRight={
        <Pressable testID="cart-button" style={styles.cartButton} onPress={onOpenCart} accessibilityRole="button" accessibilityLabel={cartLabel}>
          <Ionicons name="cart-outline" size={26} color={colors.ink} />
          {itemCount > 0 ? (
            <View style={styles.cartBadge} testID="cart-badge">
              <Text style={styles.cartBadgeText}>{itemCount}</Text>
            </View>
          ) : null}
        </Pressable>
      }
    >
      <TextInput
        testID="search"
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Search coffee, bagels, berries…"
        accessibilityLabel="Search products"
      />
      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card} testID={`product-${item.id}`}>
            <View style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>{money(item.priceCents)}</Text>
            </View>
            <Text style={styles.muted}>{item.description}</Text>
            {item.lowStock === true ? (
              <Text style={styles.lowStockBadge} testID={`low-stock-${item.id}`}>
                {`Only ${item.stock} left`}
              </Text>
            ) : null}
            <View style={styles.row}>
              <Text style={[styles.muted, !item.available && { color: colors.danger }]} testID={`stock-${item.id}`}>
                {stockLabel(item, new Date())}
              </Text>
              {item.available ? (
                <View style={[styles.row, { gap: 8 }]}>
                  {cart[item.id] ? (
                    <Pressable onPress={() => add(item, -1)} testID={`remove-${item.id}`} accessibilityLabel={`Remove one ${item.name}`}>
                      <Text style={[styles.name, { color: colors.accent, paddingHorizontal: 8 }]}>−</Text>
                    </Pressable>
                  ) : null}
                  {cart[item.id] ? <Text style={styles.name} testID={`qty-${item.id}`}>{cart[item.id]}</Text> : null}
                  <Pressable onPress={() => add(item, 1)} testID={`add-${item.id}`} accessibilityLabel={`Add one ${item.name}`}>
                    <Text style={[styles.name, { color: colors.accent, paddingHorizontal: 8 }]}>+</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </View>
        )}
      />
      <ErrorText message={error} testID="shop-error" />
    </Screen>
  );
}

export function CartScreen({
  token,
  cart,
  products,
  setCart,
  onBack,
  onOrdered,
}: {
  token: string;
  cart: Cart;
  products: Record<string, Product>;
  setCart: (cart: Cart) => void;
  onBack: () => void;
  onOrdered: (order: Order) => void;
}) {
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [giftMessage, setGiftMessage] = useState("");
  const items = Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity }));
  const total = items.reduce((sum, item) => sum + (products[item.productId]?.priceCents ?? 0) * item.quantity, 0);

  const checkout = async () => {
    setPlacing(true);
    setError(null);
    try {
      const order = await api.placeOrder(token, items, giftMessage);
      setCart({});
      onOrdered(order);
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Screen title="Cart" testID="cart-screen">
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 16 }}>
        {items.map((item) => {
          const product = products[item.productId];
          if (!product) return null;
          return (
            <View key={item.productId} style={[styles.card, styles.row]} testID={`cart-item-${item.productId}`}>
              <Text style={styles.name}>
                {item.quantity} × {product.name}
              </Text>
              <Text style={styles.price}>{money(item.quantity * product.priceCents)}</Text>
            </View>
          );
        })}
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 8 }]}>
          <Text style={styles.name}>Total</Text>
          <Text style={styles.price} testID="cart-total">
            {money(total)}
          </Text>
        </View>
        <TextInput
          testID="gift-message"
          style={styles.input}
          value={giftMessage}
          onChangeText={setGiftMessage}
          maxLength={200}
          multiline
          placeholder="Gift message"
          accessibilityLabel="Gift message"
        />
      </ScrollView>
      <ErrorText message={error} testID="cart-error" />
      <Button label={`Place order · ${money(total)}`} onPress={checkout} busy={placing} disabled={items.length === 0} testID="place-order" />
      <Button label="Keep shopping" tone="plain" onPress={onBack} testID="keep-shopping" />
    </Screen>
  );
}

function StatusBadge({ status }: { status: Order["status"] }) {
  return (
    <View style={[styles.badge, { backgroundColor: status === "confirmed" ? colors.good : colors.pending }]} testID="order-status">
      <Text style={styles.badgeText}>{status}</Text>
    </View>
  );
}

export function OrderScreen({ token, orderId, onBack }: { token: string; orderId: string; onBack: () => void }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stopped = false;
    const poll = async () => {
      try {
        const latest = await api.order(token, orderId);
        if (stopped) return;
        setOrder(latest);
        if (latest.status !== "confirmed") setTimeout(poll, 2000);
      } catch (err) {
        if (!stopped) setError(messageOf(err));
      }
    };
    poll();
    return () => {
      stopped = true;
    };
  }, [token, orderId]);

  return (
    <Screen title="Your order" testID="order-screen">
      <ErrorText message={error} />
      {order ? (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.muted}>Order {order.id.slice(0, 8)}</Text>
            <StatusBadge status={order.status} />
          </View>
          {order.lines.map((line) => (
            <View key={line.productId} style={styles.row}>
              <Text style={styles.name}>
                {line.quantity} × {line.name}
              </Text>
              <Text style={styles.price}>{money(line.quantity * line.priceCents)}</Text>
            </View>
          ))}
          <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 8 }]}>
            <Text style={styles.name}>Total</Text>
            <Text style={styles.price} testID="order-total">
              {money(order.totalCents)}
            </Text>
          </View>
          {order.giftMessage ? (
            <View>
              <Text style={styles.muted}>Gift message</Text>
              <Text style={styles.name} testID="order-gift-message">
                {order.giftMessage}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
      <Button label="Keep shopping" tone="plain" onPress={onBack} testID="keep-shopping" />
    </Screen>
  );
}

export function InboxScreen({ token, onOpenOrder }: { token: string; onOpenOrder: (id: string) => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [inbox, history] = await Promise.all([api.notifications(token), api.orders(token)]);
      setNotifications(inbox);
      setOrders(history);
      setError(null);
    } catch (err) {
      setError(messageOf(err));
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Screen title="Inbox" testID="inbox-screen">
      <ErrorText message={error} />
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 16 }}>
        {notifications.length === 0 ? <Text style={styles.muted}>No notifications yet.</Text> : null}
        {notifications.map((n) => (
          <Pressable key={n.id} onPress={() => onOpenOrder(n.orderId)} testID={`notification-${n.orderId}`}>
            <View style={styles.card}>
              <Text style={styles.name}>{n.title}</Text>
              <Text style={styles.muted}>{n.body}</Text>
            </View>
          </Pressable>
        ))}
        {orders.length > 0 ? <Text style={[styles.name, { marginTop: 12 }]}>Orders</Text> : null}
        {orders.map((order) => (
          <Pressable key={order.id} onPress={() => onOpenOrder(order.id)}>
            <View style={[styles.card, styles.row]}>
              <Text style={styles.muted}>
                {order.id.slice(0, 8)} · {money(order.totalCents)}
              </Text>
              <StatusBadge status={order.status} />
            </View>
          </Pressable>
        ))}
        <Button label="Refresh" tone="plain" onPress={load} testID="refresh-inbox" />
      </ScrollView>
    </Screen>
  );
}
