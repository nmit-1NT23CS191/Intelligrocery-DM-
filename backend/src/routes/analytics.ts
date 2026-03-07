import { Router, Response } from 'express';
import db from '../db';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/analytics  (Admin only)
router.get('/', authenticate, requireAdmin, (_req: AuthRequest, res: Response): void => {
  try {
    // KPIs
    const usersCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
    const productsCount = (db.prepare('SELECT COUNT(*) as count FROM products').get() as any).count;
    const ordersCount = (db.prepare('SELECT COUNT(*) as count FROM orders').get() as any).count;
    const revenue = (db.prepare('SELECT COALESCE(SUM(total_amount),0) as total FROM orders').get() as any).total;

    // Sales trend (last 30 days, grouped by day in SQLite)
    const salesTrend = db.prepare(`
      SELECT date(created_at) as date,
             COUNT(*) as orders,
             COALESCE(SUM(total_amount),0) as revenue
      FROM orders
      WHERE created_at >= date('now', '-30 days')
      GROUP BY date(created_at)
      ORDER BY date ASC
    `).all();

    // Top selling products
    const topProducts = db.prepare(`
      SELECT name, sales_count, category, price
      FROM products
      ORDER BY sales_count DESC
      LIMIT 10
    `).all();

    // Category distribution
    const categoryDist = db.prepare(`
      SELECT category, COUNT(*) as count, SUM(sales_count) as total_sales
      FROM products
      GROUP BY category
      ORDER BY total_sales DESC
    `).all();

    // Low stock alerts
    const lowStock = db.prepare(`
      SELECT id, name, stock, category
      FROM products
      WHERE stock < 20
      ORDER BY stock ASC
    `).all();

    // Recent orders
    const recentOrders = db.prepare(`
      SELECT o.id, u.name as customer, o.total_amount, o.created_at
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `).all();

    res.json({
      kpis: {
        totalUsers: usersCount,
        totalProducts: productsCount,
        totalOrders: ordersCount,
        totalRevenue: revenue,
      },
      salesTrend,
      topProducts,
      categoryDistribution: categoryDist,
      lowStockAlerts: lowStock,
      recentOrders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
