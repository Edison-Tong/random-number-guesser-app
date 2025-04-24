import React, { useState, useEffect } from "react";
import { Keyboard } from "react-native";
import { db } from "./firebase";
import { doc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { submitGuess } from "./firebaseHelpers";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

export default function App() {
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState("");
  const [userId, setUserId] = useState(""); // this will become the saved username
  const [usernameInput, setUsernameInput] = useState("");
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [randomNumber, setRandomNumber] = useState(null);

  // Load username on mount
  useEffect(() => {
    const loadUsername = async () => {
      const savedUsername = await AsyncStorage.getItem("userId");
      if (savedUsername) {
        setUserId(savedUsername);
        setIsUsernameSet(true);
      }
    };
    loadUsername();
  }, []); // This runs once on mount

  // Handle setting username
  const handleSetUsername = async () => {
    const trimmed = usernameInput.trim();
    if (!trimmed) return;
    await AsyncStorage.setItem("userId", trimmed);
    setUserId(trimmed);
    setIsUsernameSet(true);
  };

  const handleGuess = () => {
    Keyboard.dismiss();

    if (!userId) {
      setResult("Please select a user first.");
      return;
    }

    const myGuess = parseInt(guess, 10);

    if (!myGuess || myGuess < 1 || myGuess > 100) {
      setResult("Please enter a number between 1 and 100.");
      return;
    }

    submitGuess(userId, myGuess);
    setResult("Guess submitted! Waiting for the other player...");
    setGuess(""); // clear input
  };

  // Only render the username input screen if username is not set
  const renderUsernameInput = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a username</Text>
      <TextInput
        style={styles.input}
        value={usernameInput}
        onChangeText={setUsernameInput}
        placeholder="Enter your username"
      />
      <Button title="Confirm" onPress={handleSetUsername} />
    </View>
  );

  // If username is set, continue with game logic
  const renderGameScreen = () => (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 16 }}>
        <Text style={{ textAlign: "center", marginBottom: 10 }}>
          Logged in as: <Text style={{ fontWeight: "bold" }}>{userId}</Text>
        </Text>
      </View>
      <Text style={{ textAlign: "center", marginBottom: 10 }}>
        Playing as: <Text style={{ fontWeight: "bold" }}>{userId || "none selected"}</Text>
      </Text>
      <Text style={styles.title}>Guess the Number (1-100)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={guess}
        onChangeText={setGuess}
        placeholder="Enter your guess"
      />
      <Button title="Submit Guess" onPress={handleGuess} />
      {result && <Text style={styles.result}>{result}</Text>}
    </View>
  );

  // Render the appropriate screen based on whether the username is set
  if (!isUsernameSet) {
    return renderUsernameInput();
  } else {
    return renderGameScreen();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    fontSize: 18,
  },
  result: {
    marginTop: 24,
    fontSize: 20,
    textAlign: "center",
  },
});
