import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const MATCH_ID = import.meta.env.VITE_MATCH_ID;

export const useInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!MATCH_ID) {
      setError("No Match ID provided");
      setLoading(false);
      return;
    }

    const insightsRef = collection(db, "insights", MATCH_ID, "cards");
    const q = query(insightsRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cardList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInsights(cardList);
      setLoading(false);
    }, (err) => {
      console.error("Firestore Error:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { insights, loading, error };
};
