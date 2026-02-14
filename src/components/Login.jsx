import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import db from '../services/db';
import { LogIn, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();

    useEffect(() => {
        // Ensure default users exist (secure check)
        db.initializeDefaults();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (await login(username, password)) {
                // No reload needed as hooks are now reactive, but good to ensure fresh state
                window.location.reload();
            } else {
                setError('Usuario o contraseña incorrectos.');
            }
        } catch (e) {
            console.error(e);
            setError('Error al iniciar sesión.');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'radial-gradient(circle at top right, rgba(0, 108, 224, 0.15), transparent 40%), radial-gradient(circle at bottom left, rgba(0, 108, 224, 0.1), transparent 40%)',
            padding: '20px'
        }}>
            <div className="glass-card" style={{
                padding: '50px 40px',
                width: '100%',
                maxWidth: '450px',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--primary), #004da1)',
                        width: '70px',
                        height: '70px',
                        borderRadius: '20px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        margin: '0 auto 20px',
                        boxShadow: '0 10px 25px rgba(0, 108, 224, 0.3)'
                    }}>
                        <ShieldCheck color="white" size={36} />
                    </div>
                    <h1 style={{ fontSize: '2rem', color: 'white', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '8px' }}>
                        ELSPEC <span style={{ color: 'var(--primary)' }}>ANDINA</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                        Mesa de Soporte Técnico Especializado
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Ingrese su usuario"
                            style={{ padding: '14px 18px', fontSize: '1rem' }}
                            required
                        />
                    </div>
                    <div className="input-group" style={{ marginBottom: '30px' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Ingrese su contraseña"
                                style={{ padding: '14px 18px', fontSize: '1rem', paddingRight: '50px' }}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'transparent',
                                    padding: '5px',
                                    color: 'var(--text-muted)'
                                }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: 'var(--danger)',
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            marginBottom: '20px',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                        Acceder al Sistema <LogIn size={20} />
                    </button>
                </form>

                <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    El sistema ahora sincroniza datos en tiempo real entre todos sus dispositivos.
                </div>

                <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Para restablecer su contraseña, contacte al administrador del sistema.
                </div>
            </div>
        </div>
    );
};

export default Login;
