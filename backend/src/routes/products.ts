import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../db';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `product_${Date.now()}${ext}`);
    },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', (_req, res: Response): void => {
    try {
        const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:id', (req, res: Response): void => {
    try {
        const product = db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
        if (!product) { res.status(404).json({ error: 'Product not found' }); return; }
        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', authenticate, requireAdmin, upload.single('image'), (req: AuthRequest, res: Response): void => {
    const { name, category, price, stock } = req.body;
    const image = req.file ? req.file.filename : null;
    if (!name || !category || !price) {
        res.status(400).json({ error: 'Name, category and price required' });
        return;
    }
    try {
        const info = db.prepare('INSERT INTO products (name, category, price, stock, image) VALUES (?,?,?,?,?)')
            .run(name, category, parseFloat(price), parseInt(stock) || 0, image);
        const product = db.prepare('SELECT * FROM products WHERE id=?').get(info.lastInsertRowid);
        res.status(201).json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/:id', authenticate, requireAdmin, upload.single('image'), (req: AuthRequest, res: Response): void => {
    const { name, category, price, stock } = req.body;
    const { id } = req.params;
    try {
        const existing = db.prepare('SELECT * FROM products WHERE id=?').get(id) as any;
        if (!existing) { res.status(404).json({ error: 'Product not found' }); return; }
        const image = req.file ? req.file.filename : existing.image;

        db.prepare('UPDATE products SET name=?, category=?, price=?, stock=?, image=? WHERE id=?')
            .run(
                name || existing.name,
                category || existing.category,
                price ? parseFloat(price) : existing.price,
                stock !== undefined ? parseInt(stock) : existing.stock,
                image,
                id
            );
        const updated = db.prepare('SELECT * FROM products WHERE id=?').get(id);
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response): void => {
    try {
        const product = db.prepare('SELECT * FROM products WHERE id=?').get(req.params.id);
        if (!product) { res.status(404).json({ error: 'Product not found' }); return; }
        db.prepare('DELETE FROM products WHERE id=?').run(req.params.id);
        res.json({ message: 'Product deleted', product });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
