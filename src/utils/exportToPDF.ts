import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPDF = (title: string, columns: string[], data: any[]) => {
  const doc = new jsPDF();
  doc.text(title, 10, 10);
  (doc as any).autoTable({
    head: [columns],
    body: data.map(row => Object.values(row)),
  });
  doc.save(`${title}.pdf`);
};