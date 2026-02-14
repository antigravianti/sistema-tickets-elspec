import { useState } from 'react';
import db from '../services/db';

const useAuth = () => {
    const [user, setUser] = useState(() => db.getSession());

    const login = async (username, password) => {
        const userFound = await db.loginUser(username, password);
        if (userFound) {
            setUser(userFound);
            db.setSession(userFound);
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        db.clearSession();
    };

    const addUser = (userData) => {
        return db.addUser(userData);
    };

    const deleteUser = (userId) => {
        return db.deleteUser(userId);
    };

    const updateUser = (userId, data) => {
        return db.updateUser(userId, data);
    };

    return { user, login, logout, addUser, deleteUser, updateUser, isAuthenticated: !!user };
};

export default useAuth;
