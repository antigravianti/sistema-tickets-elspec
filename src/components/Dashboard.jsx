import React, { useState } from 'react';
import useTickets from '../hooks/useTickets';
import useAuth from '../hooks/useAuth';
import UserManagement from './UserManagement';
import ReportGenerator from './ReportGenerator';
import {
    PlusCircle,
    ClipboardList,
    LogOut,
    CheckCircle,
    Clock,
    Users,
    FileText,
    LayoutDashboard,
    AlertCircle,
    Maximize,
    Minimize,
    Edit,
    Trash2,
    X
} from 'lucide-react';

const Dashboard = () => {
    const { user, logout, users } = useAuth();
    const { tickets, addTicket, updateTicketStatus, deleteTicket } = useTickets();
    const [activeTab, setActiveTab] = useState('tickets'); // 'tickets', 'users', 'reports'
    const [newTicket, setNewTicket] = useState({ title: '', description: '', priority: 'medium' });
    const [isFullscreen, setIsFullscreen] = useState(false);

    // State for closing a ticket
    const [closingTicket, setClosingTicket] = useState(null); // id of the ticket being closed
    const [closingData, setClosingData] = useState({ solution: '', recommendation: '' });

    // State for editing a ticket
    const [editingTicket, setEditingTicket] = useState(null); // ticket object being edited

    // Safety check for user
    if (!user) return null;

    const toggleFullscreen = () => {
        try {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
                setIsFullscreen(true);
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                    setIsFullscreen(false);
                }
            }
        } catch (e) {
            console.error("Fullscreen error", e);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        addTicket({ ...newTicket, author: user.username });
        setNewTicket({ title: '', description: '', priority: 'medium' });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (editingTicket) {
            updateTicketStatus(editingTicket.id, editingTicket.status, {
                title: editingTicket.title,
                description: editingTicket.description,
                priority: editingTicket.priority
            });
            setEditingTicket(null);
        }
    };

    const handleDeleteTicket = (ticketId) => {
        if (window.confirm('¿Está seguro de que desea eliminar este ticket?')) {
            deleteTicket(ticketId);
        }
    };

    const handleCloseTicket = (e) => {
        e.preventDefault();
        updateTicketStatus(closingTicket, 'closed', {
            solution: closingData.solution,
            recommendation: closingData.recommendation,
            closedAt: new Date().toISOString(),
            closedBy: user.username
        });

        // Simulate sending email (Logging for now as it's static)
        const ticket = (tickets || []).find(t => t.id === closingTicket);
        if (ticket) {
            const authorUser = (users || []).find(u => u.username === ticket.author);
            if (authorUser && authorUser.email) {
                console.log(`%c📧 SISTEMA ENVIANDO CORREO A: ${authorUser.email}`, 'color: #10b981; font-weight: bold;');
                console.log(`Asunto: ✅ Ticket Resuelto: ${ticket.title}`);
                console.log(`Solución: ${closingData.solution}`);
                console.log(`Recomendación: ${closingData.recommendation}`);
            }
        }

        setClosingTicket(null);
        setClosingData({ solution: '', recommendation: '' });
    };

    const isAdmin = user.role === 'admin';

    // Metrics for Admin
    const allTickets = tickets || [];
    const activeTicketsCount = allTickets.filter(t => t.status === 'open').length;
    const closedTicketsCount = allTickets.filter(t => t.status === 'closed').length;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-color)', color: 'white' }}>
            {/* Modal for editing ticket */}
            {editingTicket && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                    zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: '20px'
                }}>
                    <div className="glass-card" style={{ padding: 'clamp(20px, 5vw, 40px)', width: '100%', maxWidth: '600px', border: '1px solid var(--primary)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Edit color="var(--primary)" size={24} /> Editar Ticket
                            </h3>
                            <button onClick={() => setEditingTicket(null)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="input-group">
                                <label>Título / Asunto</label>
                                <input
                                    type="text"
                                    required
                                    value={editingTicket.title}
                                    onChange={(e) => setEditingTicket({ ...editingTicket, title: e.target.value })}
                                />
                            </div>
                            <div className="input-group">
                                <label>Prioridad</label>
                                <select
                                    value={editingTicket.priority}
                                    onChange={(e) => setEditingTicket({ ...editingTicket, priority: e.target.value })}
                                >
                                    <option value="low">Baja</option>
                                    <option value="medium">Media</option>
                                    <option value="high">Alta</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Descripción del Problema</label>
                                <textarea
                                    rows="5"
                                    required
                                    value={editingTicket.description}
                                    onChange={(e) => setEditingTicket({ ...editingTicket, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div style={{ display: 'flex', flexDirection: window.innerWidth < 600 ? 'column' : 'row', gap: '15px', marginTop: '30px' }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1.5, padding: '15px' }}>
                                    Guardar Cambios
                                </button>
                                <button type="button" onClick={() => setEditingTicket(null)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for closing ticket details */}
            {closingTicket && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                    zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: '20px'
                }}>
                    <div className="glass-card" style={{ padding: 'clamp(20px, 5vw, 40px)', width: '100%', maxWidth: '600px', border: '1px solid var(--primary)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CheckCircle color="var(--success)" size={24} /> Finalizar Servicio Técnico
                        </h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '25px', fontSize: '0.9rem' }}>
                            Complete los detalles de la solución para cerrar el caso y notificar al usuario.
                        </p>
                        <form onSubmit={handleCloseTicket}>
                            <div className="input-group">
                                <label>Descripción de la Solución</label>
                                <textarea
                                    rows="4"
                                    required
                                    value={closingData.solution}
                                    onChange={(e) => setClosingData({ ...closingData, solution: e.target.value })}
                                    placeholder="Detalle los pasos técnicos realizados..."
                                ></textarea>
                            </div>
                            <div className="input-group">
                                <label>Recomendaciones al Usuario</label>
                                <textarea
                                    rows="3"
                                    required
                                    value={closingData.recommendation}
                                    onChange={(e) => setClosingData({ ...closingData, recommendation: e.target.value })}
                                    placeholder="Recomendaciones sugeridas para el futuro..."
                                ></textarea>
                            </div>
                            <div style={{ display: 'flex', flexDirection: window.innerWidth < 600 ? 'column' : 'row', gap: '15px', marginTop: '30px' }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1.5, background: 'var(--success)', padding: '15px' }}>
                                    Confirmar y Enviar Notificación
                                </button>
                                <button type="button" onClick={() => setClosingTicket(null)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Top Navigation Bar */}
            <nav style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                padding: '10px 15px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                gap: '10px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
                    <h1 style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)', margin: 0, fontWeight: 800, letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>
                        ELSPEC <span style={{ color: 'var(--primary)' }}>ANDINA</span>
                    </h1>

                    <div className="glass-card" style={{ display: 'flex', padding: '3px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setActiveTab('tickets')}
                            style={{
                                background: activeTab === 'tickets' ? 'var(--primary)' : 'transparent',
                                border: 'none', color: activeTab === 'tickets' ? 'white' : 'var(--text-muted)',
                                padding: '6px 10px', borderRadius: '7px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)'
                            }}
                        >
                            <ClipboardList size={16} /> <span style={{ display: window.innerWidth < 480 ? 'none' : 'inline' }}>Tickets</span>
                        </button>
                        {isAdmin && (
                            <>
                                <button
                                    onClick={() => setActiveTab('users')}
                                    style={{
                                        background: activeTab === 'users' ? 'var(--primary)' : 'transparent',
                                        border: 'none', color: activeTab === 'users' ? 'white' : 'var(--text-muted)',
                                        padding: '6px 10px', borderRadius: '7px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)'
                                    }}
                                >
                                    <Users size={16} /> <span style={{ display: window.innerWidth < 480 ? 'none' : 'inline' }}>Usuarios</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('reports')}
                                    style={{
                                        background: activeTab === 'reports' ? 'var(--primary)' : 'transparent',
                                        border: 'none', color: activeTab === 'reports' ? 'white' : 'var(--text-muted)',
                                        padding: '6px 10px', borderRadius: '7px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)'
                                    }}
                                >
                                    <FileText size={16} /> <span style={{ display: window.innerWidth < 480 ? 'none' : 'inline' }}>Reportes</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <button
                        onClick={toggleFullscreen}
                        title="Pantalla Completa"
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '1px solid var(--border-color)', paddingLeft: '20px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{user.username}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{user.role}</div>
                        </div>
                        <button onClick={() => { logout(); window.location.reload(); }} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: 'var(--danger)', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </nav>

            <div style={{ padding: 'clamp(15px, 4vw, 30px)' }}>
                {/* Header Section */}
                <header style={{ marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                        <div>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '5px' }}>
                                {activeTab === 'tickets' ? (isAdmin ? 'Consola de Administración IT' : 'Mis Solicitudes Técnicas') :
                                    activeTab === 'users' ? 'Control de Accesos' : 'Centro de Generación de Informes'}
                            </h2>
                            <p style={{ color: 'var(--text-muted)' }}>Mesa de servicios corporativa - Soporte Interno ELSPEC ANDINA.</p>
                        </div>
                        {isAdmin && activeTab === 'tickets' && (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Estado Global: <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Operativo</span>
                            </div>
                        )}
                    </div>
                </header>

                {/* Metrics Bar for Admin */}
                {isAdmin && activeTab === 'tickets' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ background: 'rgba(0, 108, 224, 0.15)', padding: '14px', borderRadius: '15px' }}>
                                <LayoutDashboard color="var(--primary)" size={28} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Tickets</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{allTickets.length}</div>
                            </div>
                        </div>
                        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '14px', borderRadius: '15px' }}>
                                <AlertCircle color="var(--warning)" size={28} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Pendientes</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{activeTicketsCount}</div>
                            </div>
                        </div>
                        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '14px', borderRadius: '15px' }}>
                                <CheckCircle color="var(--success)" size={28} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Finalizados</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{closedTicketsCount}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                {activeTab === 'tickets' && (
                    <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr' : window.innerWidth < 1024 ? '1fr' : '400px 1fr', gap: 'clamp(15px, 3vw, 30px)' }}>
                        {!isAdmin && (
                            <aside>
                                <div className="glass-card" style={{ padding: '30px', position: 'sticky', top: '100px' }}>
                                    <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <PlusCircle size={24} color="var(--primary)" /> Nueva Solicitud
                                    </h3>
                                    <form onSubmit={handleSubmit}>
                                        <div className="input-group">
                                            <label>Tipo de Servicio / Asunto</label>
                                            <input
                                                type="text"
                                                value={newTicket.title}
                                                placeholder="Ej: Falla en servidor de archivos"
                                                onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="input-group">
                                            <label>Nivel de Prioridad</label>
                                            <select
                                                value={newTicket.priority}
                                                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                                            >
                                                <option value="low">Baja - Consulta General</option>
                                                <option value="medium">Media - Incidencia Relevante</option>
                                                <option value="high">Alta - Urgencia Técnica</option>
                                            </select>
                                        </div>
                                        <div className="input-group">
                                            <label>Descripción Detallada</label>
                                            <textarea
                                                rows="6"
                                                value={newTicket.description}
                                                placeholder="Describa el problema aquí..."
                                                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                                required
                                            ></textarea>
                                        </div>
                                        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '18px', fontSize: '1rem' }}>Enviar a Soporte IT</button>
                                    </form>
                                </div>
                            </aside>
                        )}

                        <main>
                            <div className="glass-card" style={{ padding: '30px' }}>
                                <h3 style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <ClipboardList size={24} color="var(--primary)" />
                                    {isAdmin ? 'Registro General de Actividades IT' : 'Listado de mis Requerimientos'}
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {allTickets.length === 0 ? (
                                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '100px 0', opacity: 0.4 }}>
                                            <ClipboardList size={64} style={{ marginBottom: '20px' }} />
                                            <p style={{ fontSize: '1.1rem' }}>No existen tickets registrados en este momento.</p>
                                        </div>
                                    ) : (
                                        allTickets.filter(t => isAdmin || t.author === user.username).map(ticket => {
                                            const canManage = isAdmin || ticket.author === user.username;

                                            return (
                                                <div key={ticket.id} style={{
                                                    padding: 'clamp(15px, 4vw, 25px)',
                                                    background: 'rgba(255,255,255,0.01)',
                                                    borderRadius: '16px',
                                                    border: '1px solid rgba(255,255,255,0.05)',
                                                    transition: 'var(--transition)'
                                                }}>
                                                    <div style={{ display: 'flex', flexDirection: window.innerWidth < 768 ? 'column' : 'row', justifyContent: 'space-between', alignItems: window.innerWidth < 768 ? 'flex-start' : 'flex-start', marginBottom: '20px', gap: '15px' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <h4 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', margin: '0 0 10px 0', color: 'white' }}>{ticket.title}</h4>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
                                                                <span style={{
                                                                    fontSize: '0.75rem',
                                                                    padding: '5px 12px',
                                                                    borderRadius: '20px',
                                                                    background: ticket.priority === 'high' ? 'rgba(239, 68, 68, 0.2)' : ticket.priority === 'medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                                                    color: ticket.priority === 'high' ? 'var(--danger)' : ticket.priority === 'medium' ? 'var(--warning)' : 'var(--success)',
                                                                    textTransform: 'uppercase',
                                                                    fontWeight: 800,
                                                                    letterSpacing: '0.5px'
                                                                }}>
                                                                    {ticket.priority}
                                                                </span>
                                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                    <Clock size={14} /> Creación: {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'Fecha N/A'}
                                                                </span>
                                                                {ticket.closedAt && (
                                                                    <span style={{ fontSize: '0.85rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                        <CheckCircle size={14} /> Cierre: {new Date(ticket.closedAt).toLocaleString()}
                                                                    </span>
                                                                )}
                                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                                    ID: <code style={{ color: 'var(--primary)' }}>{ticket.id ? ticket.id.slice(-6) : 'N/A'}</code>
                                                                </span>
                                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '15px' }}>
                                                                    Autor: <b style={{ color: 'white' }}>{ticket.author}</b>
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                                                            {ticket.status === 'open' ? (
                                                                <div style={{ color: 'var(--warning)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', background: 'rgba(245, 158, 11, 0.08)', padding: '6px 14px', borderRadius: '30px' }}>
                                                                    <Clock size={16} /> Pendiente
                                                                </div>
                                                            ) : (
                                                                <div style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', background: 'rgba(16, 185, 129, 0.08)', padding: '6px 14px', borderRadius: '30px' }}>
                                                                    <CheckCircle size={16} /> Resuelto
                                                                </div>
                                                            )}

                                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                                {canManage && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => setEditingTicket(ticket)}
                                                                            title="Editar Ticket"
                                                                            style={{ background: 'rgba(0, 108, 224, 0.1)', color: 'var(--primary)', padding: '8px', borderRadius: '8px' }}
                                                                        >
                                                                            <Edit size={18} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteTicket(ticket.id)}
                                                                            title="Eliminar Ticket"
                                                                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '8px', borderRadius: '8px' }}
                                                                        >
                                                                            <Trash2 size={18} />
                                                                        </button>
                                                                    </>
                                                                )}

                                                                {isAdmin && ticket.status === 'open' && (
                                                                    <button
                                                                        onClick={() => setClosingTicket(ticket.id)}
                                                                        className="btn-primary"
                                                                        style={{ padding: '8px 20px', fontSize: '0.9rem', background: 'var(--success)', borderRadius: '10px' }}
                                                                    >
                                                                        Finalizar
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ display: 'grid', gridTemplateColumns: ticket.status === 'closed' && window.innerWidth >= 768 ? '1fr 1fr' : '1fr', gap: '20px' }}>
                                                        <div style={{ background: 'rgba(0,0,0,0.15)', padding: '20px', borderRadius: '12px' }}>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>Descripción del Problema</div>
                                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>{ticket.description}</p>
                                                        </div>

                                                        {ticket.status === 'closed' && (
                                                            <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '20px', borderRadius: '12px', borderLeft: '4px solid var(--success)' }}>
                                                                <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>Resolución Técnica</div>
                                                                <p style={{ color: 'white', fontSize: '0.95rem', marginBottom: '15px', lineHeight: 1.6 }}>{ticket.solution}</p>
                                                                <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>Recomendaciones</div>
                                                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>{ticket.recommendation}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </main>
                    </div>
                )}

                {(activeTab === 'users' || activeTab === 'reports') && (
                    <div style={{ width: '100%' }}>
                        {activeTab === 'users' && <UserManagement />}
                        {activeTab === 'reports' && <ReportGenerator tickets={tickets} />}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
