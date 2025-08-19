import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { setAuthToken } from "../utils/api";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { username, password });
      await AsyncStorage.setItem("token", res.data.token);
      await AsyncStorage.setItem("userId", res.data.user._id);
      setAuthToken(res.data.token);
      console.log("Login successful");
      navigation.replace("Home");
    } catch (err) {
        console.error(err);
      alert(err.message + " Login failed");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input}/>
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input}/>
      <Button title="Login" onPress={handleLogin} />
      <Button title="Go to Register" onPress={() => navigation.navigate("Register")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 }
});
