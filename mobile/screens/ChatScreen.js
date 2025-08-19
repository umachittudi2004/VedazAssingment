import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../utils/api";
import { getSocket } from "../utils/socket";
import MessageBubble from "../components/MessageBubble";

export default function ChatScreen({ route }) {
  const { contact, me } = route.params;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [theirTyping, setTheirTyping] = useState(false);
  const typingTimeout = useRef(null);
  const listRef = useRef(null);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await api.get(`/conversations/${contact._id}/messages`);
      console.log("Fetched message history:", res.data);

      setMessages(res.data);
      // mark unread as read
      const s = getSocket();
      res.data.forEach((m) => {
        if (String(m.receiver) === String(me) && m.status !== "read") {
          s.emit("message:read", m._id);
        }
      });
    } catch {}
  }, [contact._id, me]);

  useEffect(() => {
    fetchHistory();
    const s = getSocket();

    const onNew = (msg) => {
      const isForThisChat =
        (String(msg.sender) === String(contact._id) && String(msg.receiver) === String(me)) ||
        (String(msg.sender) === String(me) && String(msg.receiver) === String(contact._id));
      if (!isForThisChat) return;

      setMessages((prev) => {
        // if server confirms optimistic message → replace it
        const optimistic = prev.find(
          (m) =>
            m.text === msg.text &&
            m.sender === msg.sender &&
            m.receiver === msg.receiver &&
            m.status === "sent"
        );
        if (optimistic) {
          return prev.map((m) => (m._id === optimistic._id ? msg : m));
        }

        // if already exists by id → skip
        if (prev.some((m) => String(m._id) === String(msg._id))) return prev;

        return [...prev, msg];
      });

      // if I received it, immediately mark as read (when chat open)
      if (String(msg.receiver) === String(me)) {
        s.emit("message:read", msg._id);
      }

      listRef.current?.scrollToEnd({ animated: true });
    };

    // ✅ new handler for read receipts
    const onRead = (messageId) => {
      setMessages((prev) =>
        prev.map((m) =>
          String(m._id) === String(messageId) ? { ...m, status: "read" } : m
        )
      );
    };

    const onTypingStart = (senderId) => {
      if (String(senderId) === String(contact._id)) setTheirTyping(true);
    };
    const onTypingStop = (senderId) => {
      if (String(senderId) === String(contact._id)) setTheirTyping(false);
    };

    s.on("message:new", onNew);
    s.on("message:read", onRead);
    s.on("typing:start", onTypingStart);
    s.on("typing:stop", onTypingStop);

    return () => {
      s.off("message:new", onNew);
      s.off("message:read", onRead);
      s.off("typing:start", onTypingStart);
      s.off("typing:stop", onTypingStop);
    };
  }, [contact._id, me, fetchHistory]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const s = getSocket();
    const optimistic = {
      _id: `${Date.now()}`, // temp ID
      sender: me,
      receiver: contact._id,
      text: trimmed,
      status: "sent",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    listRef.current?.scrollToEnd({ animated: true });
    setText("");
    s.emit("message:send", { sender: me, receiver: contact._id, text: trimmed });
  };

  const onChangeText = (t) => {
    setText(t);
    const s = getSocket();
    s.emit("typing:start", { sender: me, receiver: contact._id });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      s.emit("typing:stop", { sender: me, receiver: contact._id });
    }, 900);
  };

  const renderItem = ({ item }) => <MessageBubble msg={item} me={me} />;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#f5f5f5" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: contact.online ? "#22c55e" : "#9ca3af" }]} />
        <Text style={styles.title}>{contact.username}</Text>
        {theirTyping && <Text style={styles.typing}>typing…</Text>}
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item, idx) => item._id?.toString() || String(idx)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 10 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          value={text}
          onChangeText={onChangeText}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee",
    gap: 8,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  title: { fontSize: 18, fontWeight: "700", flex: 0 },
  typing: { marginLeft: 8, color: "#22c55e", fontStyle: "italic" },
  inputRow: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#fafafa",
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
});
