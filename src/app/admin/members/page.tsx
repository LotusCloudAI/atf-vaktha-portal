"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function MembersPage() {

  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {

    async function loadMembers() {

      const snapshot = await getDocs(collection(db, "members"));

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setMembers(data);
    }

    loadMembers();

  }, []);

  return (

    <main className="p-10">

      <h1 className="text-2xl font-bold mb-6">
        ATF Vaktha Members
      </h1>

      {members.map((m:any) => (

        <div key={m.id} className="border p-4 mb-3 rounded">

          <h3 className="font-semibold">{m.name}</h3>

          <p>{m.email}</p>

          <p>Role: {m.role}</p>

        </div>

      ))}

    </main>

  );
}