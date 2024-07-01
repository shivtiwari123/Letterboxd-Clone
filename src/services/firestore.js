import { db } from "../services/firebase";
import { addDoc, collection, doc, getDoc, setDoc, deleteDoc, getDocs } from 'firebase/firestore'
import { useToast } from "@chakra-ui/react";
import { useCallback } from "react";
//import { deleteDoc } from "firebase/firestore/lite";

export const useFirestore = () => {

    const toast = useToast();

// Add a new document with a generated id.
    const addDocument = async (collectionName, data) => {
        const docRef = await addDoc(collection(db, collectionName), data);
          console.log("Document written with ID: ", docRef.id);
    };

    const addToWatchlist = async (userId, dataId, data) => {
        try {
            if (await checkIfInWatchlist(userId, dataId)) {
                toast({
                    title: "Alert!",
                    description: "This item is already in your watchlist.",
                    status: 'error',
                    duration: 9000,
                    isClosable: true
                }); 
                return false;
            }
            await setDoc(doc(db, "users", userId, "watchlist", dataId), data)
            toast({
                title: "Success!",
                description: "Added to watchlist.",
                status: "success",
                isClosable: true
            });  
        } catch (error) {
            console.log(error, "error adding document")
            toast({
                title: "Error!",
                description: "An error occured.",
                status: 'error',
                isClosable: true
            });
        }
    }

    const checkIfInWatchlist = async (userId, dataId) => {
        const docRef = doc(db, 'users', userId?.toString(), "watchlist", dataId?.toString());
    
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return true;
        } else {
            return false;
        }
    };

    const removeFromWatchlist = async (userId, dataId) => {
        try {
            await deleteDoc(doc(db, "users", userId?.toString(), "watchlist", dataId?.toString()));
            toast({
                title: "Success!",
                description: "Removed from watchlist.",
                status: 'success',
                isClosable: true
            });
        } catch (error) {
            console.log(error, 'Error while deleting');
            toast({
                title: "Error!",
                description: "An error occured.",
                status: 'error',
                isClosable: true
            });
        }
    };

    const getWatchlist = useCallback (async (userId) => {
        const querySnapshot = await getDocs(collection(db, "users", userId, "watchlist"));
        const data = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
        }));
        return data;
    }, []);

    return {
        addDocument,
        addToWatchlist,
        checkIfInWatchlist,
        removeFromWatchlist,
        getWatchlist
    }
};

