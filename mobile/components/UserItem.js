import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

export default function UserItem({ user, onPress, lastMessage }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={[styles.dot, { backgroundColor: user.online ? "#22c55e" : "#9ca3af" }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{user.username}</Text>
        {lastMessage ? (
          <Text numberOfLines={1} style={styles.preview}>
            {lastMessage.text}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: "#eee" },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  name: { fontSize: 16, fontWeight: "600" },
  preview: { marginTop: 2, color: "#6b7280" },
});
