import { useState, useEffect } from "react";
import { ref, onValue, off } from "firebase/database";
import { rtdb } from "../firebase";

const ENV_MATCH_ID = import.meta.env.VITE_MATCH_ID;

export const useMatchData = () => {
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState(ENV_MATCH_ID);

  useEffect(() => {
    // If no ID in env, listen for the dynamically selected ID from the backend
    if (!ENV_MATCH_ID) {
      const activeMatchIdRef = ref(rtdb, 'activeMatchId');
      const unsubscribeActiveId = onValue(activeMatchIdRef, (snapshot) => {
        const id = snapshot.val();
        if (id) {
          setActiveId(id);
        } else {
          setError("Waiting for a live match to start...");
          setLoading(false);
        }
      });

      return () => unsubscribeActiveId();
    }
  }, []);

  useEffect(() => {
    if (!activeId) return;

    setLoading(true);
    const matchRef = ref(rtdb, `liveMatch/${activeId}`);
    
    const unsubscribe = onValue(matchRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMatchData(data);
        setError(null);
      } else {
        setError(`No data found for match ${activeId}`);
      }
      setLoading(false);
    }, (err) => {
      console.error("RTDB Error:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeId]);

  return { matchData, loading, error, matchId: activeId };
};
