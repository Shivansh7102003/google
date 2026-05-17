import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../firebase";

const MATCH_ID = import.meta.env.VITE_MATCH_ID;

export const useMatchData = () => {
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!MATCH_ID) {
      setError("No Match ID provided");
      setLoading(false);
      return;
    }

    const matchRef = ref(rtdb, `liveMatch/${MATCH_ID}`);
    
    const unsubscribe = onValue(matchRef, (snapshot) => {
      const data = snapshot.val();
      setMatchData(data);
      setLoading(false);
    }, (err) => {
      console.error("RTDB Error:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { matchData, loading, error };
};
