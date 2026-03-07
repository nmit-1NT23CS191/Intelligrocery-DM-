import { Router, Response } from 'express';
import db from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';
import { io } from '../index';
import { carts } from './cart';

const router = Router();

// POST /api/orders  (Checkout)
router.post('/', authenticate, (req: AuthRequest, res: Response): void => {
    const userId = req.user!.id;
    const cartItems = carts[userId] || [];

    if (cartItems.length === 0) {
        res.status(400).json({ error: 'Cart is empty' });
        return;
    }

    // Define transaction
    const checkoutTx = db.transaction((items) => {
        let total = 0;
        const enriched: { productId: number; quantity: number; price: number }[] = [];

        // Check stock
        const getProduct = db.prepare('SELECT * FROM products WHERE id=?');
        for (const item of items) {
            const product = getProduct.get(item.productId) as any;
            if (!product) throw new Error(`Product ${item.productId} not found`);
            if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
            total += product.price * item.quantity;
            enriched.push({ productId: item.productId, quantity: item.quantity, price: product.price });
        }

        // Create order
        const insertOrder = db.prepare('INSERT INTO orders (user_id, total_amount) VALUES (?,?)');
        const orderInfo = insertOrder.run(userId, total.toFixed(2));
        const orderId = orderInfo.lastInsertRowid;
        const order = db.prepare('SELECT * FROM orders WHERE id=?').get(orderId);

        // Create items and update stock
        const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?,?,?,?)');
        const updateProduct = db.prepare('UPDATE products SET stock = stock - ?, sales_count = sales_count + ? WHERE id=?');

        for (const item of enriched) {
            insertItem.run(orderId, item.productId, item.quantity, item.price);
            updateProduct.run(item.quantity, item.quantity, item.productId);
        }

        return order;
    });

    try {
        const order = checkoutTx(cartItems) as any;
        carts[userId] = [];
        io.emit('new_order', { orderId: order.id, userId, total: order.total_amount });
        res.status(201).json({ message: 'Order placed successfully', order });
    } catch (err: any) {
        console.error(err);
        res.status(400).json({ error: err.message || 'Checkout failed' });
    }
});

// GET /api/orders  (user's orders)
router.get('/', authenticate, (req: AuthRequest, res: Response): void => {
    try {
        const ordersList = db.prepare('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC').all(req.user!.id) as any[];
        const itemsQuery = db.prepare(`
      SELECT oi.*, p.name as product_name 
      FROM order_items oi 
      LEFT JOIN products p ON oi.product_id = p.id 
      WHERE oi.order_id=?
    `);

        const enriched = ordersList.map(o => ({
            ...o,
            items: itemsQuery.all(o.id)
        }));

        res.json(enriched);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
