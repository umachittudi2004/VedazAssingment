import React from "react";
import { View, Text, StyleSheet } from "react-native";

const formatTime = (iso) => {
  try {
    const d = new Date(iso);
    const hh = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}`;
  } catch { return ""; }
};

const StatusTicks = ({ status, isMine }) => {
  if (!isMine) return null;
  const map = { sent: "✓", delivered: "✓✓", read: "✓✓" };
  const style = [styles.ticks, status === "read" && { color: "#22c55e", fontWeight: "700" }];
  return <Text style={style}>{map[status] || ""}</Text>;
};

export default function MessageBubble({ msg, me }) {
  const isMine = String(msg.sender) === String(me);
  return (
    <View style={[styles.wrap, isMine ? styles.right : styles.left]}>
      <View style={[styles.bubble, isMine ? styles.mine : styles.theirs]}>
        <Text style={styles.text}>{msg.text}</Text>
        <View style={styles.meta}>
          <Text style={styles.time}>{formatTime(msg.createdAt)}</Text>
          <StatusTicks status={msg.status} isMine={isMine} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 12, marginVertical: 4, width: "100%" },
  left: { alignItems: "flex-start" },
  right: { alignItems: "flex-end" },
  bubble: { maxWidth: "80%", borderRadius: 12, padding: 10 },
  mine: { backgroundColor: "#DCF8C6" },
  theirs: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#eee" },
  text: { fontSize: 16 },
  meta: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginTop: 4, gap: 8 },
  time: { color: "#6b7280", fontSize: 12 },
  ticks: { marginLeft: 6, fontSize: 12, color: "#9ca3af" },
});
