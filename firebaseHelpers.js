import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function submitGuess(userId, guess) {
  const today = new Date().toISOString().split("T")[0]; // e.g. '2025-04-17'
  const ref = doc(db, "dailyGuesses", today);

  try {
    const snapshot = await getDoc(ref);
    const existingData = snapshot.exists() ? snapshot.data() : {};

    // Merge the user's guess into the existing data
    const updatedGuesses = {
      ...existingData.guesses,
      [userId]: guess,
    };

    await setDoc(ref, {
      ...existingData,
      guesses: updatedGuesses,
    });

    console.log("✅ Guess submitted!");
  } catch (error) {
    console.error("❌ Error submitting guess:", error);
  }
}
