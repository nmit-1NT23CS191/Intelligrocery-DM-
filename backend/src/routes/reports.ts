import { Router, Response } from 'express';
import db from '../db';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import PDFDocument from 'pdfkit';

function toCSV(rows: Record<string, unknown>[]): string {
    if (rows.length === 0) return '';
    const headers = Object.keys(rows[0]);
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    return [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\n');
}

const router = Router();

router.get('/csv', authenticate, requireAdmin, (_req: AuthRequest, res: Response): void => {
    try {
        const orders = db.prepare(`
      SELECT o.id, u.name as customer, u.email, o.total_amount, o.created_at
      FROM orders o JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `).all() as any[];

        const products = db.prepare('SELECT id, name, category, price, stock, sales_count FROM products ORDER BY sales_count DESC').all() as any[];

        const ordersCSV = toCSV(orders);
        const productsCSV = toCSV(products);
        const combined = `=== ORDERS ===\n${ordersCSV}\n\n=== PRODUCTS ===\n${productsCSV}`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="intelligrocery_report.csv"');
        res.send(combined);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate CSV' });
    }
});

router.get('/pdf', authenticate, requireAdmin, (_req: AuthRequest, res: Response): void => {
    try {
        const orders = db.prepare(`
      SELECT o.id, u.name as customer, o.total_amount, o.created_at
      FROM orders o JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC LIMIT 20
    `).all() as any[];

        const products = db.prepare('SELECT name, category, price, stock, sales_count FROM products ORDER BY sales_count DESC LIMIT 15').all() as any[];
        const revenueObj = db.prepare('SELECT COALESCE(SUM(total_amount),0) as total FROM orders').get() as any;

        const doc = new PDFDocument({ margin: 40 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="intelligrocery_report.pdf"');
        doc.pipe(res);

        doc.fontSize(22).fillColor('#1e3a5f').text('IntelliGrocery-Pro', { align: 'center' });
        doc.fontSize(12).fillColor('#666').text('Business Analytics Report', { align: 'center' });
        doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(1);

        doc.fontSize(14).fillColor('#1e3a5f').text('📊 Summary');
        doc.moveTo(40, doc.y).lineTo(560, doc.y).strokeColor('#ddd').stroke();
        doc.moveDown(0.3);
        doc.fontSize(11).fillColor('#333');
        doc.text(`Total Orders: ${orders.length}+`);
        doc.text(`Total Revenue: $${parseFloat(revenueObj.total).toFixed(2)}`);
        doc.text(`Total Products: ${products.length}+`);
        doc.moveDown(1);

        doc.fontSize(14).fillColor('#1e3a5f').text('🛍 Top Products by Sales');
        doc.moveTo(40, doc.y).lineTo(560, doc.y).strokeColor('#ddd').stroke();
        doc.moveDown(0.3);
        doc.fontSize(9).fillColor('#555');
        products.forEach((p, i) => {
            doc.text(`${i + 1}. ${p.name} | Category: ${p.category} | Price: $${p.price} | Stock: ${p.stock} | Sales: ${p.sales_count}`);
        });
        doc.moveDown(1);

        doc.fontSize(14).fillColor('#1e3a5f').text('📦 Recent Orders');
        doc.moveTo(40, doc.y).lineTo(560, doc.y).strokeColor('#ddd').stroke();
        doc.moveDown(0.3);
        doc.fontSize(9).fillColor('#555');
        orders.forEach((o) => {
            doc.text(`Order #${o.id} | Customer: ${o.customer} | Amount: $${o.total_amount} | Date: ${new Date(o.created_at).toLocaleDateString()}`);
        });

        doc.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

export default router;
