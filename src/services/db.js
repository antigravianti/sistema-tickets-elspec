import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    limit,
    where
} from "firebase/firestore";
import { db_firestore } from "./firebase";

// Firebase Collections
const COLLECTIONS = {
    USERS: 'users',
    TICKETS: 'tickets'
};

const db = {
    // Users Management
    // Initialize base users if collection is empty
    initializeDefaults: async () => {
        try {
            console.log("Firebase: Verificando datos iniciales...");
            // Only fetch 1 doc to check existence, saving bandwidth/security
            const q = query(collection(db_firestore, COLLECTIONS.USERS), limit(1));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                console.log("Firebase: Base de datos vacía. Creando usuarios por defecto...");
                const defaults = [
                    { username: 'alejandro', password: 'lucy931205', role: 'admin', name: 'Alejandro', email: 'admin@elspecandina.com' },
                    { username: 'user', password: 'user', role: 'engineer', name: 'Usuario Soporte', email: 'soporte@elspecandina.com' }
                ];
                for (const u of defaults) {
                    await addDoc(collection(db_firestore, COLLECTIONS.USERS), {
                        ...u,
                        createdAt: new Date().toISOString()
                    });
                }
                console.log("Firebase: Usuarios iniciales creados.");
                return true;
            }
            return false;
        } catch (e) {
            console.error("Firebase Initialization Error:", e);
            return false;
        }
    },

    // Secure login: fetch only the specific user by username
    loginUser: async (username, password) => {
        try {
            const normalizedUsername = (username || '').toLowerCase().trim();
            const q = query(
                collection(db_firestore, COLLECTIONS.USERS), 
                where('username', '==', normalizedUsername),
                limit(1)
            );
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data();
                
                // Simple password check (In production, use Firebase Auth or hashing)
                if (userData.password === password) {
                    return { id: userDoc.id, ...userData };
                }
            }
            return null;
        } catch (e) {
            console.error("Login Error:", e);
            return null;
        }
    },

    getUsers: async () => {
        const querySnapshot = await getDocs(collection(db_firestore, COLLECTIONS.USERS));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    subscribeUsers: (callback) => {
        try {
            console.log("Firebase: Iniciando suscripción de usuarios...");
            return onSnapshot(collection(db_firestore, COLLECTIONS.USERS), (snapshot) => {
                console.log("Firebase: Usuarios actualizados");
                const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                callback(users);
            }, (error) => {
                console.error("Firebase Error (Usuarios):", error);
                alert("Error de conexión con la base de datos (Usuarios). Verifique su conexión.");
            });
        } catch (e) {
            console.error("Critical Firebase Error:", e);
            return () => { }; // Return safe cleanup function
        }
    },

    addUser: async (userData) => {
        const docRef = await addDoc(collection(db_firestore, COLLECTIONS.USERS), {
            ...userData,
            createdAt: new Date().toISOString()
        });
        return { id: docRef.id, ...userData };
    },

    updateUser: async (userId, data) => {
        const userRef = doc(db_firestore, COLLECTIONS.USERS, userId);
        await updateDoc(userRef, data);
    },

    deleteUser: async (userId) => {
        const userRef = doc(db_firestore, COLLECTIONS.USERS, userId);
        await deleteDoc(userRef);
    },

    // Tickets Management
    subscribeTickets: (callback) => {
        try {
            console.log("Firebase: Iniciando suscripción de tickets...");
            // Updated query to filter out soft-deleted tickets
            const q = query(
                collection(db_firestore, COLLECTIONS.TICKETS),
                orderBy("createdAt", "desc")
            );
            return onSnapshot(q, (snapshot) => {
                console.log("Firebase: Tickets actualizados");
                const tickets = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(t => !t.deleted); // Client-side filtering as initial safety, though query should ideally handle it
                callback(tickets);
            }, (error) => {
                console.error("Firebase Error (Tickets):", error);
            });
        } catch (e) {
            console.error("Critical Firebase Error (Tickets):", e);
            return () => { }; // Return safe cleanup function
        }
    },

    addTicket: async (ticket) => {
        const docRef = await addDoc(collection(db_firestore, COLLECTIONS.TICKETS), {
            ...ticket,
            status: 'open',
            deleted: false, // Initializing soft-delete flag
            createdAt: new Date().toISOString()
        });
        return { id: docRef.id, ...ticket };
    },

    updateTicket: async (ticketId, data) => {
        const ticketRef = doc(db_firestore, COLLECTIONS.TICKETS, ticketId);
        await updateDoc(ticketRef, data);
    },

    deleteTicket: async (ticketId) => {
        const ticketRef = doc(db_firestore, COLLECTIONS.TICKETS, ticketId);
        // Soft delete: keep the document but mark as deleted
        await updateDoc(ticketRef, { deleted: true, deletedAt: new Date().toISOString() });
    },

    // Auth Sessions (Still in LocalStorage as it's per-device)
    getSession: () => {
        try {
            const session = localStorage.getItem('app_logged_user');
            return session ? JSON.parse(session) : null;
        } catch (e) {
            localStorage.removeItem('app_logged_user');
            return null;
        }
    },

    setSession: (user) => {
        localStorage.setItem('app_logged_user', JSON.stringify(user));
    },

    clearSession: () => {
        localStorage.removeItem('app_logged_user');
    }
};

export default db;
