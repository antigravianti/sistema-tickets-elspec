import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield, User as UserIcon, Edit, X } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import db from '../services/db';

const UserManagement = () => {
    const { addUser, deleteUser, updateUser } = useAuth();
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const unsubscribe = db.subscribeUsers(setUsers);
        return () => unsubscribe();
    }, []);
    const [editingUser, setEditingUser] = useState(null); // The user being edited
    const [formData, setFormData] = useState({ username: '', password: '', role: 'engineer', name: '', email: '' });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingUser) {
            // Update existing user
            updateUser(editingUser.id, formData);
            setEditingUser(null);
        } else {
            // Add new user
            if (users.some(u => u.username === formData.username)) {
                alert('El nombre de usuario ya existe');
                return;
            }
            addUser(formData);
        }

        setFormData({ username: '', password: '', role: 'engineer', name: '', email: '' });
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            password: user.password,
            role: user.role,
            name: user.name,
            email: user.email
        });
    };

    const cancelEdit = () => {
        setEditingUser(null);
        setFormData({ username: '', password: '', role: 'engineer', name: '', email: '' });
    };

    return (
        <div className="glass-card" style={{ padding: '30px' }}>
            <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {editingUser ? <Edit size={22} color="var(--warning)" /> : <UserPlus size={22} color="var(--primary)" />}
                {editingUser ? `Editando Usuario: ${editingUser.username}` : 'Registro de Nuevo Usuario'}
            </h3>

            <form onSubmit={handleSubmit} style={{ marginBottom: '40px', paddingBottom: '30px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label>Nombre Completo</label>
                        <input
                            type="text"
                            value={formData.name}
                            placeholder="Juan Pérez"
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label>Correo Electrónico</label>
                        <input
                            type="email"
                            value={formData.email}
                            placeholder="juan@empresa.com"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label>Usuario</label>
                        <input
                            type="text"
                            value={formData.username}
                            placeholder="juanp"
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                            disabled={!!editingUser} // Optional: usually usernames aren't changed
                        />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label>Contraseña</label>
                        <input
                            type="text" // Using text so admin can see/set the password easily
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                        <label>Rol</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="engineer">Ingeniero</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button type="submit" className="btn-primary" style={{ height: '48px', padding: '0 20px', background: editingUser ? 'var(--warning)' : 'var(--primary)' }}>
                            {editingUser ? 'Actualizar' : 'Registrar'}
                        </button>
                        {editingUser && (
                            <button type="button" onClick={cancelEdit} style={{ height: '48px', padding: '0 15px', background: 'rgba(255,255,255,0.05)' }}>
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </form>

            <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Cuentas Existentes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {users.map(u => (
                    <div key={u.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '15px 20px',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color)',
                        opacity: editingUser && editingUser.id === u.id ? 0.6 : 1
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{
                                background: u.role === 'admin' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.05)',
                                padding: '10px',
                                borderRadius: '8px'
                            }}>
                                {u.role === 'admin' ? <Shield size={20} color="var(--warning)" /> : <UserIcon size={20} color="var(--text-muted)" />}
                            </div>
                            <div>
                                <div style={{ fontWeight: '600' }}>{u.name || u.username}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    @{u.username} • {u.email} • <span style={{ textTransform: 'capitalize' }}>{u.role}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => handleEdit(u)}
                                style={{
                                    background: 'rgba(52, 211, 153, 0.1)',
                                    color: 'var(--success)',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                                title="Editar Usuario"
                            >
                                <Edit size={18} />
                            </button>
                            {u.username !== 'admin' && (
                                <button
                                    onClick={() => {
                                        if (confirm(`¿Eliminar al usuario ${u.username}?`)) deleteUser(u.id);
                                    }}
                                    style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: 'var(--danger)',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                    title="Eliminar Usuario"
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserManagement;
