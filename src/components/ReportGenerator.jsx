import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText, Download, Calendar } from 'lucide-react';

const ReportGenerator = ({ tickets }) => {
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const closedTickets = (tickets || []).filter(t => t.status === 'closed');

    const filteredTickets = closedTickets.filter(t => {
        if (!t.closedAt) return false;
        try {
            const ticketDate = new Date(t.closedAt).toISOString().split('T')[0];
            return ticketDate >= dateRange.start && ticketDate <= dateRange.end;
        } catch (e) {
            return false;
        }
    });

    const generatePDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(0, 108, 224);
        doc.text('ELSPEC ANDINA - INFORME TÉCNICO', 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 30);
        doc.text(`Filtro periodo: ${dateRange.start} a ${dateRange.end}`, 14, 35);

        const tableColumn = ["ID", "Título", "Autor", "Prioridad", "Fecha Cierre", "Resolución"];
        const tableRows = [];

        filteredTickets.forEach(ticket => {
            const ticketData = [
                ticket.id ? ticket.id.slice(-6) : 'N/A',
                ticket.title || 'S/T',
                ticket.author || 'Anon',
                ticket.priority || 'medium',
                ticket.closedAt ? new Date(ticket.closedAt).toLocaleDateString() : 'N/A',
                ticket.solution || 'N/A'
            ];
            tableRows.push(ticketData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'striped',
            headStyles: { fillColor: [0, 108, 224] }
        });

        // Add detailed sections for each ticket
        let currentY = doc.lastAutoTable.finalY + 15;

        filteredTickets.forEach((ticket, index) => {
            // Check for page overflow
            if (currentY > 250) {
                doc.addPage();
                currentY = 20;
            }

            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.setFont('helvetica', 'bold');
            doc.text(`${index + 1}. DETALLES TÉCNICOS: ${ticket.title || 'Sin Título'}`, 14, currentY);
            currentY += 8;

            doc.setFontSize(10);
            doc.setTextColor(60);
            doc.setFont('helvetica', 'normal');

            const solutionText = `SOLUCIÓN: ${ticket.solution || 'No especificada'}`;
            const solLines = doc.splitTextToSize(solutionText, 175);
            doc.text(solLines, 14, currentY);
            currentY += (solLines.length * 5) + 3;

            const recText = `RECOMENDACIÓN: ${ticket.recommendation || 'Sin recomendaciones adicionales'}`;
            const recLines = doc.splitTextToSize(recText, 175);
            doc.text(recLines, 14, currentY);
            currentY += (recLines.length * 5) + 12;
        });

        doc.save(`Reporte_IT_ElspecAndina_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <div className="glass-card" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                    <FileText size={24} color="var(--primary)" /> Generador de Informes Técnicos
                </h3>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '15px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'end', flexWrap: 'wrap' }}>
                    <div className="input-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={14} /> Fecha Inicio
                        </label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                    </div>
                    <div className="input-group" style={{ marginBottom: 0, flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={14} /> Fecha Fin
                        </label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                    </div>
                    <button
                        onClick={generatePDF}
                        disabled={filteredTickets.length === 0}
                        className="btn-primary"
                        style={{
                            height: '48px',
                            padding: '0 30px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: filteredTickets.length === 0 ? 'rgba(255,255,255,0.05)' : 'var(--primary)',
                            cursor: filteredTickets.length === 0 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <Download size={20} /> Descargar PDF ({filteredTickets.length})
                    </button>
                </div>

                {filteredTickets.length === 0 && (
                    <p style={{ marginTop: '20px', color: 'var(--warning)', fontSize: '0.9rem', textAlign: 'center' }}>
                        * No se encontraron tickets cerrados en el rango de fechas seleccionado.
                    </p>
                )}
            </div>

            <div style={{ marginTop: '30px' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '15px' }}>Vista previa de tickets incluidos:</h4>
                <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {filteredTickets.map(t => (
                        <div key={t.id} style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{t.title}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{t.closedAt ? new Date(t.closedAt).toLocaleDateString() : 'Fecha N/A'}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReportGenerator;
