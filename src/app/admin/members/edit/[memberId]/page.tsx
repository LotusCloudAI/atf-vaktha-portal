"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditMemberPage() {

  const params = useParams();
  const router = useRouter();

  const memberId = params.memberId as string;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [clubID, setClubID] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const snap = await getDoc(doc(db, "members", memberId));

        if (snap.exists()) {
          const data = snap.data();
          setName(data.name || "");
          setEmail(data.email || "");
          setRole(data.role || "member");
          setClubID(data.clubID || "");
        }

      } catch (error) {
        console.error("Error fetching member:", error);
      } finally {
        setLoading(false);
      }
    };

    if (memberId) fetchMember();

  }, [memberId]);

  const handleUpdate = async (e: any) => {
    e.preventDefault();

    try {
      await updateDoc(doc(db, "members", memberId), {
        name,
        email,
        role,
        clubID,
      });

      alert("Member updated successfully");
      router.push("/admin/members");

    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  if (loading) {
    return <main className="p-10">Loading member...</main>;
  }

  return (
    <main className="p-10 max-w-xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        Edit Member
      </h1>

      <form onSubmit={handleUpdate} className="space-y-4">

        <input
          className="border p-2 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-2 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2 w-full"
          value={clubID}
          onChange={(e) => setClubID(e.target.value)}
        />

        <select
          className="border p-2 w-full"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="member">Member</option>
          <option value="speaker">Speaker</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update Member
        </button>

      </form>

    </main>
  );
}