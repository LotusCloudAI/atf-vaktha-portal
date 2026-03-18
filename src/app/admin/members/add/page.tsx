"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function AddMemberPage() {

  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [clubID, setClubID] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e:any) => {
    e.preventDefault();

    // Basic validation
    if (!name || !email || !clubID) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await addDoc(collection(db, "members"), {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        clubID: clubID.trim(),
        speechesCompleted: 0,
        joinDate: serverTimestamp(),
      });

      setSuccess("Member added successfully");

      // Reset form
      setName("");
      setEmail("");
      setClubID("");

      // Redirect after 1.5 seconds (better UX)
      setTimeout(() => {
        router.push("/admin/members");
      }, 1500);

    } catch (err:any) {
      console.error(err);
      setError("Failed to add member. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-10 max-w-xl">

      <h1 className="text-2xl font-bold mb-6">
        Add ATF Vaktha Member
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          placeholder="Full Name"
          className="border p-2 w-full"
          value={name}
          onChange={(e)=>setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="text"
          placeholder="Club ID (e.g., dallas-vaktha)"
          className="border p-2 w-full"
          value={clubID}
          onChange={(e)=>setClubID(e.target.value)}
        />

        <select
          className="border p-2 w-full"
          value={role}
          onChange={(e)=>setRole(e.target.value)}
        >
          <option value="member">Member</option>
          <option value="speaker">Speaker</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Member"}
        </button>

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        {success && (
          <p className="text-green-600 text-sm">{success}</p>
        )}

      </form>

    </main>
  );
}