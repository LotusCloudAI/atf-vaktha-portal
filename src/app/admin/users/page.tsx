"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";

interface User {
  id: string;
  email?: string;
  role?: string;
}

export default function UsersPage() {

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (user) => {

      console.log("🔥 CURRENT USER UID:", user?.uid);
      console.log("🔥 CURRENT USER EMAIL:", user?.email);

      if (!user) {
        console.error("❌ No user logged in");
        setLoading(false);
        return;
      }

      try {
        const snapshot = await getDocs(collection(db, "users"));

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];

        setUsers(data);

      } catch (error) {
        console.error("❌ Error fetching users:", error);
      } finally {
        setLoading(false);
      }

    });

    return () => unsubscribe();

  }, []);

  const updateRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        role: newRole,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: newRole } : u
        )
      );

    } catch (error) {
      console.error("❌ Error updating role:", error);
    }
  };

  if (loading) {
    return <main className="p-10">Loading users...</main>;
  }

  return (
    <main className="p-10 max-w-5xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        Admin Users Management
      </h1>

      <table className="w-full border border-gray-300">

        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Role</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>

          {users.map((user) => (
            <tr key={user.id} className="border-t">

              <td className="p-3">
                {user.email || "No Email"}
              </td>

              <td className="p-3">
                {user.role || "member"}
              </td>

              <td className="p-3 flex gap-3">

                {user.role !== "admin" && (
                  <button
                    onClick={() => updateRole(user.id, "admin")}
                    className="text-green-600"
                  >
                    Promote
                  </button>
                )}

                {user.role === "admin" && (
                  <button
                    onClick={() => updateRole(user.id, "member")}
                    className="text-red-600"
                  >
                    Demote
                  </button>
                )}

              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </main>
  );
}