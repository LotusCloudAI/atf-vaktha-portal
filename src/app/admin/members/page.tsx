"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Fetch Members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "members"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMembers(data);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Fetch Logged-in User Role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const q = query(
          collection(db, "members"),
          where("email", "==", user.email)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const data: any = snapshot.docs[0].data();
          setUserRole(data.role);
        }
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  // Delete Member
  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this member?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "members", id));
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting member");
    }
  };

  // Update Role
  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const memberRef = doc(db, "members", memberId);
      await updateDoc(memberRef, { role: newRole });

      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId ? { ...m, role: newRole } : m
        )
      );
    } catch (error) {
      console.error("Role update error:", error);
    }
  };

  return (
    <main className="p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">ATF Vaktha Members</h1>

        {(userRole === "admin" || userRole === "super_admin") && (
          <Link
            href="/admin/members/add"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            + Add Member
          </Link>
        )}
      </div>

      {/* Loading */}
      {loading && <p className="text-gray-500">Loading members...</p>}

      {/* Empty State */}
      {!loading && members.length === 0 && (
        <p className="text-gray-500">No members found.</p>
      )}

      {/* Members List */}
      <div className="grid gap-4">
        {members.map((m: any) => (
          <div
            key={m.id}
            className="border rounded-lg p-5 shadow-sm bg-white flex justify-between items-center"
          >
            {/* Member Info */}
            <div>
              <h3 className="text-lg font-semibold">{m.name}</h3>
              <p className="text-sm text-gray-600">{m.email}</p>
              <p className="text-sm mt-1">
                Role: <span className="font-medium">{m.role}</span>
              </p>
              <p className="text-sm">Club: {m.clubID}</p>
            </div>

            {/* Actions */}
            {(userRole === "admin" || userRole === "super_admin") && (
              <div className="flex flex-col gap-2">
                <Link
                  href={'/admin/members/edit/${m.id}'}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </Link>

                <button
                  className="text-red-600 hover:underline"
                  onClick={() => handleDelete(m.id)}
                >
                  Delete
                </button>

                <select
                  value={m.role}
                  onChange={(e) =>
                    handleRoleChange(m.id, e.target.value)
                  }
                  className="border p-1 text-sm"
                >
                  <option value="member">Member</option>
                  <option value="speaker">Speaker</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}