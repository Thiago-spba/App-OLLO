import { useEffect, useState } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { getAuth } from "firebase/auth";

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const db = getDatabase();
        const adminRef = ref(db, `admins/${user.uid}`);
        const snapshot = await get(adminRef);
        setIsAdmin(snapshot.exists() && snapshot.val() === true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { isAdmin, loading };
}
