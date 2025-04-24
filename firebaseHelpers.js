import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function submitGuess(userId, guess) {
  console.log("test");
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Denver" });
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
