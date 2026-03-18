"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";

export default function AdminClubsManagement() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    clubName: "",
    country: "",
    state: "",
    city: "",
    language: "English",
    meetingDay: "Monday"
  });

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    const snapshot = await getDocs(collection(db, "clubs"));
    setClubs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TASK-12: Admin can create a club
      await addDoc(collection(db, "clubs"), formData);
      setFormData({ clubName: "", country: "", state: "", city: "", language: "English", meetingDay: "Monday" });
      fetchClubs();
      alert("Club created!");
    } catch (error) { /* Silent handle */ }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this club?")) {
      await deleteDoc(doc(db, "clubs", id));
      fetchClubs();
    }
  };

  return (
    <main className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Clubs Management</h1>

        {/* Create Club Form */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-10">
          <h2 className="text-lg font-bold mb-4">Create New Club</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              placeholder="Club Name" 
              className="p-2 border rounded-lg"
              value={formData.clubName}
              onChange={(e) => setFormData({...formData, clubName: e.target.value})}
              required
            />
            <input 
              placeholder="Country" 
              className="p-2 border rounded-lg"
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              required
            />
            <input 
              placeholder="State" 
              className="p-2 border rounded-lg"
              value={formData.state}
              onChange={(e) => setFormData({...formData, state: e.target.value})}
              required
            />
            <input 
              placeholder="City" 
              className="p-2 border rounded-lg"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              required
            />
            <select 
              className="p-2 border rounded-lg"
              value={formData.language}
              onChange={(e) => setFormData({...formData, language: e.target.value})}
            >
              <option>English</option>
              <option>Telugu</option>
              <option>Hindi</option>
            </select>
            <button type="submit" className="bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
              Add Club
            </button>
          </form>
        </section>

        {/* Clubs List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-bold text-slate-600">Club Name</th>
                <th className="p-4 font-bold text-slate-600">Location</th>
                <th className="p-4 font-bold text-slate-600">Language</th>
                <th className="p-4 font-bold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clubs.map((club) => (
                <tr key={club.id}>
                  <td className="p-4 font-semibold">{club.clubName}</td>
                  <td className="p-4">{club.city}, {club.state}</td>
                  <td className="p-4">{club.language}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(club.id)}
                      className="text-red-500 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
