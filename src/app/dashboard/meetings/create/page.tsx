"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function CreateMeeting() {

  const [theme, setTheme] = useState("");
  const [word, setWord] = useState("");

  const createMeeting = async () => {
    await addDoc(collection(db, "meetings"), {
      theme,
      wordOfTheDay: word,
      createdAt: serverTimestamp(),
    });
    alert("Meeting Created");
  };

  return (
    <div className="p-6">
      <input placeholder="Theme" onChange={(e)=>setTheme(e.target.value)} />
      <input placeholder="Word of Day" onChange={(e)=>setWord(e.target.value)} />
      <button onClick={createMeeting}>Create</button>
    </div>
  );
}
