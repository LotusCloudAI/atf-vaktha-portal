"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function EditSpeechPage(){

  const router = useRouter();
  const params = useParams();
  const speechId:any = params.id;

  const [title,setTitle] = useState("");
  const [content,setContent] = useState("");

  useEffect(()=>{

    const loadSpeech = async () => {

      const docRef = doc(db,"speeches",speechId);
      const docSnap = await getDoc(docRef);

      if(docSnap.exists()){
        const data:any = docSnap.data();
        setTitle(data.title);
        setContent(data.content);
      }

    };

    loadSpeech();

  },[speechId]);

  const handleUpdate = async(e:any)=>{

    e.preventDefault();

    await updateDoc(doc(db,"speeches",speechId),{
      title,
      content
    });

    router.push("/dashboard");

  };

  return(

    <main className="min-h-screen bg-gray-50 p-10">

      <h1 className="text-3xl font-bold text-blue-700">
        Edit Speech
      </h1>

      <form
        onSubmit={handleUpdate}
        className="mt-8 max-w-xl space-y-4"
      >

        <input
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
          className="w-full border p-3 rounded"
        />

        <textarea
          value={content}
          onChange={(e)=>setContent(e.target.value)}
          rows={8}
          className="w-full border p-3 rounded"
        />

        <button
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          Update Speech
        </button>

      </form>

    </main>

  );

}