import { db } from "../firebase";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  doc,      // Added for getClubById
  getDoc,   // Added for getClubById
  limit     // Added for getClubSpeeches
} from "firebase/firestore";
import { Club } from "../types/club";

// Fetch all clubs (For Task 2)
export const getAllClubs = async () => {
  const snapshot = await getDocs(collection(db, "clubs"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Filter clubs by Country (For Task 3)
export const getClubsByCountry = async (countryId: string) => {
  const q = query(collection(db, "clubs"), where("countryId", "==", countryId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Create a new club (For Task 12)
export const createClub = async (clubData: Omit<Club, 'id'>) => {
  return await addDoc(collection(db, "clubs"), clubData);
};
// Filter clubs by Country AND State (For Task 4)
export const getClubsByState = async (countryId: string, stateId: string) => {
  const q = query(
    collection(db, "clubs"), 
    where("countryId", "==", countryId),
    where("stateId", "==", stateId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
// Filter clubs by Country, State, AND City (For Task 5)
export const getClubsByCity = async (countryId: string, stateId: string, cityId: string) => {
  const q = query(
    collection(db, "clubs"), 
    where("countryId", "==", countryId),
    where("stateId", "==", stateId),
    where("cityId", "==", cityId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
// Fetch a single club by ID
export const getClubById = async (clubId: string) => {
  const docRef = doc(db, "clubs", clubId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

// Fetch members belonging to a specific club
export const getClubMembers = async (clubId: string) => {
  const q = query(collection(db, "members"), where("clubId", "==", clubId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Fetch recent speeches for a specific club
export const getClubSpeeches = async (clubId: string) => {
  const q = query(
    collection(db, "transcripts"), 
    where("clubId", "==", clubId),
    limit(5)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
// Fetch meetings for a specific club
export const getClubMeetings = async (clubId: string) => {
  const q = query(
    collection(db, "meetings"), 
    where("clubId", "==", clubId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};