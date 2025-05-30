import React, { useState, useEffect } from "react";
import { Keyboard } from "react-native";
import { db } from "./firebase"; // 👈 Make sure the path is correct
import { doc, setDoc, onSnapshot, updateDoc } from "firebase/firestore"; // 👈 Import updateDoc
import { submitGuess } from "./firebaseHelpers";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

export default function App() {
  const [username, setUsername] = useState("");
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState("");
  const [randomNumber, setRandomNumber] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [hasGuessed, setHasGuessed] = useState(false);

  // Load saved username on launch
  useEffect(() => {
    const loadUsername = async () => {
      const stored = await AsyncStorage.getItem("username");
      if (stored) {
        setUsername(stored);
      }
    };
    loadUsername();
  }, []);

  // Game logic once username is set
  useEffect(() => {
    if (!username) return;

    const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Denver" });
    const docRef = doc(db, "dailyGuesses", today);

    const unsubscribe = onSnapshot(docRef, async (snapshot) => {
      const data = snapshot.data();
      console.log("🔥 Firestore snapshot data:", data);
      if (!data) return;

      const { guesses = {}, randomNumber } = data;
      setResult(""); // clear old result

      const myGuess = guesses[username];
      const otherUser = Object.keys(guesses).find((k) => k !== username);
      const otherGuess = guesses[otherUser];

      // Check if user has already made a guess for the day
      if (myGuess) {
        setHasGuessed(true); // Disable further guessing
      }

      if (myGuess) {
        setHasGuessed(true); // Disable further guessing
      }

      if (guesses[username] && guesses[otherUser]) {
        // Generate random number only once
        if (!data.randomNumber) {
          const usernamesSorted = [username, otherUser].sort();
          const shouldGenerate = username === usernamesSorted[1]; // only one user generates

          if (shouldGenerate) {
            const random = Math.floor(Math.random() * 100) + 1;
            try {
              await updateDoc(docRef, { randomNumber: random });
              console.log("🎲 Random number generated and saved:", random);
            } catch (e) {
              console.log("⚠️ Random number already saved by other user");
            }
          }
        }

        // Set result if number already exists
        if (data.randomNumber) {
          setRandomNumber(data.randomNumber);
          const message =
            myGuess === data.randomNumber
              ? `✅ You guessed it! 🎉 The number was: ${data.randomNumber}`
              : `❌ Your guess was ${myGuess}. The number was: ${data.randomNumber}`;
          setResult(message);
        }
      } else if (myGuess && !otherGuess) {
        setResult(`You guessed: ${myGuess}. Waiting for the other player...`);
      }
    });

    return () => unsubscribe();
  }, [username]);

  const handleGuess = () => {
    if (hasGuessed) {
      return;
    }

    Keyboard.dismiss();

    if (!username) {
      setResult("Please choose a username first.");
      return;
    }

    const myGuess = parseInt(guess, 10);
    if (!myGuess || myGuess < 1 || myGuess > 100) {
      setResult("Please enter a number between 1 and 100.");
      return;
    }

    submitGuess(username, myGuess);
    setHasGuessed(true); // Disable further guesses
    setGuess("");
  };

  const saveUsername = async () => {
    const name = nameInput.trim();
    if (!name) {
      Alert.alert("Invalid name", "Please enter a valid name.");
      return;
    }

    await AsyncStorage.setItem("username", name);
    setUsername(name);
  };

  return (
    <View style={styles.container}>
      {!username ? (
        <>
          <Text style={styles.title}>Choose a username</Text>
          <TextInput
            style={styles.input}
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="Enter a unique name"
          />
          <Button title="Set Username" onPress={saveUsername} />
        </>
      ) : (
        <>
          <Text style={styles.title}>Guess the Number (1–100)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={guess}
            onChangeText={setGuess}
            placeholder="Enter your guess"
          />
          <Button title="Submit Guess" onPress={handleGuess} />
          {result && <Text style={styles.result}>{result}</Text>}
        </>
      )}
    </View>
  );
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
