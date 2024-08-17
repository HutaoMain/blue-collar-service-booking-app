import { useCallback, useEffect, useState } from "react";
import { UserInterface } from "../types";
import { collection, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "../firebaseConfig";

export const useFetchAllUsers = () => {
  const [users, setUsers] = useState<UserInterface[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(FIREBASE_DB, "users"));
      const fetchedUsers: UserInterface[] = [];
      querySnapshot.forEach((doc) => {
        fetchedUsers.push({
          id: doc.id,
          email: doc.data().email,
          fullName: doc.data().fullName,
          age: doc.data().age,
          gender: doc.data().gender,
          imageUrl: doc.data().imageUrl,
          role: doc.data().role,
          isWorkerApproved: doc.data().isWorkerApproved,
        });
      });
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, refreshUsers: fetchUsers };
};
