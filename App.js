import React, { useState, useEffect } from "react";
import { Keyboard } from "react-native";
import { db } from "./firebase"; // 👈 Make sure the path is correct
import { doc, setDoc } from "firebase/firestore";
import { submitGuess } from "./firebaseHelpers";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";

export default function App() {
  useEffect(() => {
    const testWrite = async () => {
      try {
        await setDoc(doc(db, "testCollection", "testDoc"), {
          hello: "world",
        });
        console.log("✅ Firebase write successful");
      } catch (e) {
        console.error("❌ Firebase error:", e);
      }
    };

    testWrite();
  }, []);

  const [guess, setGuess] = useState("");
  const [randomNumber, setRandomNumber] = useState(null);
  const [result, setResult] = useState("");

  // const handleGuess = () => {
  //   // Keyboard.dismiss();
  //   const num = Math.floor(Math.random() * 100) + 1;
  //   setRandomNumber(num);

  //   if (parseInt(guess) === num) {
  //     setResult("🎉 You guessed it right!");
  //   } else {
  //     setResult(`❌ Nope! The number was ${num}`);
  //   }
  // };

  const handleGuess = () => {
    Keyboard.dismiss();

    const userId = "user1"; // or 'user2' — we'll automate this later
    const myGuess = 42; // this would come from your TextInput state

    submitGuess(userId, myGuess);
  };

  return (
    <View style={styles.container}>
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
