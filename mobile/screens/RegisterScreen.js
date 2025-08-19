import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import api from "../utils/api";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      await api.post("/auth/register", { username, password });
      alert("Registered successfully! Please login.");
      navigation.navigate("Login");
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input}/>
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input}/>
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 }
});
