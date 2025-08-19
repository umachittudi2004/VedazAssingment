import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import HomeScreen from "./screens/HomeScreen";
import ChatScreen from "./screens/ChatScreen";
import { setAuthToken } from "./utils/api";

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState("Login");

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        setAuthToken(token);
        setInitialRoute("Home");
      }
    })();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerTitle: "Create Account" }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={({ route }) => ({ title: route.params?.contact?.username ?? "Chat" })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
