import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getCountFromServer,
  DocumentData,
  QueryConstraint,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

export async function getDocuments(
  collectionName: string,
  ...constraints: QueryConstraint[]
) {
  const q = query(collection(db, collectionName), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getDocument(collectionName: string, docId: string) {
  const docRef = doc(db, collectionName, docId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}

export async function getDocumentBySlug(
  collectionName: string,
  slug: string
) {
  const q = query(
    collection(db, collectionName),
    where("slug", "==", slug),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() };
}

export async function getCollectionCount(
  collectionName: string,
  ...constraints: QueryConstraint[]
) {
  const q = query(collection(db, collectionName), ...constraints);
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

export async function createDocument(
  collectionName: string,
  data: DocumentData
) {
  return addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateDocument(
  collectionName: string,
  docId: string,
  data: DocumentData
) {
  const docRef = doc(db, collectionName, docId);
  return updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

export async function setDocument(
  collectionName: string,
  docId: string,
  data: DocumentData
) {
  const docRef = doc(db, collectionName, docId);
  return setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function deleteDocument(collectionName: string, docId: string) {
  return deleteDoc(doc(db, collectionName, docId));
}

export { collection, query, where, orderBy, limit, serverTimestamp };
