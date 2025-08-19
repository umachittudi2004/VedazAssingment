import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, RefreshControl, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { setAuthToken } from "../utils/api";
import UserItem from "../components/UserItem";
import { initSocket, getSocket } from "../utils/socket";

export default function HomeScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadTokenAndMe = useCallback(async () => {
    const token = await AsyncStorage.getItem("token");
    const userId = await AsyncStorage.getItem("userId");
    if (!token || !userId) {
      navigation.replace("Login");
      return;
    }
    setAuthToken(token);
    setMe(userId);
    const s = initSocket(userId);
    // live presence updates
    s.on("user:online", (id) => setUsers((prev) => prev.map(u => u._id === id ? { ...u, online: true } : u)));
    s.on("user:offline", (id) => setUsers((prev) => prev.map(u => u._id === id ? { ...u, online: false } : u)));
    // optional: new message to update last message preview
    s.on("message:new", (msg) => {
      const peer = String(msg.sender) === String(userId) ? msg.receiver : msg.sender;
      setUsers((prev) => prev.map(u => u._id === String(peer) ? { ...u, lastMessage: msg } : u));
    });
  }, [navigation]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch {
      // ignore
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  }, [fetchUsers]);

  useEffect(() => {
    loadTokenAndMe();
    fetchUsers();
    return () => {
      const s = getSocket();
      if (s) {
        s.off("user:online"); s.off("user:offline"); s.off("message:new");
      }
    };
  }, []);

  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "userId"]);
    setAuthToken(null);
    navigation.replace("Login");
  };

  const renderItem = ({ item }) => (
    <UserItem
      user={item}
      lastMessage={item.lastMessage}
      onPress={() => navigation.navigate("Chat", { contact: item, me })}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        <Button title="Logout" onPress={logout} />
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No users yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  header: { padding: 16, paddingTop: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "700" },
  empty: { textAlign: "center", color: "#6b7280", marginTop: 24 },
});
