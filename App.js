import React, { useState, useEffect } from "react";
import { Keyboard } from "react-native";
import { db } from "./firebase"; // 👈 Make sure the path is correct
import { doc, setDoc, onSnapshot, updateDoc } from "firebase/firestore"; // 👈 Import updateDoc
import { submitGuess } from "./firebaseHelpers";

import { View, Text, TextInput, Button, StyleSheet } from "react-native";

export default function App() {
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState("");
  const [userId, setUserId] = useState("");
  const [randomNumber, setRandomNumber] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const docRef = doc(db, "dailyGuesses", today);

    const unsubscribe = onSnapshot(docRef, async (snapshot) => {
      const data = snapshot.data();
      if (!data || !userId) return;

      const { guesses = {}, randomNumber } = data;
      setResult(""); // clear old result

      const myGuess = guesses[userId];
      const otherUserId = userId === "user1" ? "user2" : "user1";
      const otherGuess = guesses[otherUserId];

      if (guesses.user1 && guesses.user2) {
        if (!randomNumber) {
          // Generate random number if not already set
          const random = Math.floor(Math.random() * 2) + 1;
          try {
            await updateDoc(docRef, { randomNumber: random });
            console.log("🎲 Random number generated and saved:", random);
          } catch (e) {
            console.log("⚠️ Random number already saved by other user");
          }
        } else {
          // both guessed & number revealed
          setRandomNumber(randomNumber); // Set the random number state
          const message =
            myGuess === randomNumber
              ? `✅ You guessed it! 🎉 The number was: ${randomNumber}`
              : `❌ Your guess was ${myGuess}. The number was: ${randomNumber}`;
          setResult(message);
        }
      } else if (myGuess && !otherGuess) {
        setResult("Waiting for the other player...");
      } else {
        setResult(""); // don't show anything yet
      }
    });

    return () => unsubscribe();
  }, [userId]); // Add userId as dependency to ensure it runs when userId changes

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

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 16 }}>
        <Button title="Play as User 1" onPress={() => setUserId("user1")} />
        <Button title="Play as User 2" onPress={() => setUserId("user2")} />
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
