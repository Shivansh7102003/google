import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const ENV_MATCH_ID = import.meta.env.VITE_MATCH_ID;

export const useInsights = (activeMatchId) => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const targetId = activeMatchId || ENV_MATCH_ID;

  useEffect(() => {
    if (!targetId) {
      setLoading(false);
      return;
    }

    const insightsRef = collection(db, "insights", targetId, "cards");
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
  }, [targetId]);

  return { insights, loading, error };
};
