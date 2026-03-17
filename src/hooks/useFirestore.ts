"use client";

import { useState, useEffect } from "react";
import { getDocuments } from "@/firebase/firestore";
import { QueryConstraint } from "firebase/firestore";

export function useFirestore<T>(
  collectionName: string,
  ...constraints: QueryConstraint[]
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const results = await getDocuments(collectionName, ...constraints);
        setData(results as T[]);
      } catch (err) {
        console.error(`[useFirestore] ${collectionName} error:`, err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName]);

  return { data, loading, error, setData };
}
