import { Router, Response } from 'express';
import db from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// In-memory cart store (in production, use DB/Redis)
const carts: Record<number, { productId: number; quantity: number }[]> = {};

// GET /api/cart
router.get('/', authenticate, (req: AuthRequest, res: Response): void => {
    try {
        const userId = req.user!.id;
        const cartItems = carts[userId] || [];
        if (cartItems.length === 0) { res.json([]); return; }

        // SQLite: build dynamic IN clause
        const ids = cartItems.map(i => i.productId);
        const placeholders = ids.map(() => '?').join(',');
        const products = db.prepare(`SELECT * FROM products WHERE id IN (${placeholders})`).all(...ids) as any[];

        const enriched = cartItems.map(item => {
            const product = products.find(p => p.id === item.productId);
            return { ...item, product };
        });
        res.json(enriched);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/cart
router.post('/', authenticate, (req: AuthRequest, res: Response): void => {
    const { productId, quantity } = req.body;
    const userId = req.user!.id;
    if (!productId || !quantity || quantity < 1) {
        res.status(400).json({ error: 'productId and quantity required' });
        return;
    }
    try {
        const product = db.prepare('SELECT * FROM products WHERE id=?').get(productId);
        if (!product) { res.status(404).json({ error: 'Product not found' }); return; }

        if (!carts[userId]) carts[userId] = [];
        const existing = carts[userId].find(i => i.productId === productId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            carts[userId].push({ productId, quantity });
        }
        res.json({ message: 'Added to cart', cart: carts[userId] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/:productId', authenticate, (req: AuthRequest, res: Response): void => {
    const userId = req.user!.id;
    const productId = parseInt(req.params.productId);
    if (carts[userId]) {
        carts[userId] = carts[userId].filter(i => i.productId !== productId);
    }
    res.json({ message: 'Item removed', cart: carts[userId] || [] });
});

router.put('/:productId', authenticate, (req: AuthRequest, res: Response): void => {
    const userId = req.user!.id;
    const productId = parseInt(req.params.productId);
    const { quantity } = req.body;
    if (!carts[userId]) { res.status(404).json({ error: 'Cart empty' }); return; }
    const item = carts[userId].find(i => i.productId === productId);
    if (!item) { res.status(404).json({ error: 'Item not in cart' }); return; }
    if (quantity <= 0) {
        carts[userId] = carts[userId].filter(i => i.productId !== productId);
    } else {
        item.quantity = quantity;
    }
    res.json({ message: 'Cart updated', cart: carts[userId] });
});

router.delete('/', authenticate, (req: AuthRequest, res: Response): void => {
    const userId = req.user!.id;
    carts[userId] = [];
    res.json({ message: 'Cart cleared' });
});

export { carts };
export default router;
