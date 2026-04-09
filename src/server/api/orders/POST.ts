/**
 * POST /api/orders
 * Creates a Razorpay order and persists a pending order record.
 * Body: { items, subtotal, freightFee, grandTotal, contactName, company,
 *         phone, email, address, pincode, city, state, deliveryType, notes }
 */
import type { Request, Response } from 'express';
import Razorpay from 'razorpay';
import { getSecret } from '#airo/secrets';
import { db } from '../../db/client.js';
import { order } from '../../db/schema.js';
import { getAuth } from '@/lib/auth/auth.js';

function generateOrderId() {
  return 'BLK-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

export default async function handler(req: Request, res: Response) {
  try {
    // Auth required
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
    if (!session?.user) return res.status(401).json({ error: 'Login required to place an order' });

    const {
      items, subtotal, freightFee, grandTotal,
      contactName, company, phone, email,
      address, pincode, city, state = '',
      deliveryType = 'delivery', notes = '',
    } = req.body;

    if (!items?.length || !grandTotal || !contactName || !phone || !email || !address || !pincode || !city) {
      return res.status(400).json({ error: 'Missing required order fields' });
    }

    const keyId = getSecret('RAZORPAY_KEY_ID');
    const keySecret = getSecret('RAZORPAY_KEY_SECRET');

    if (!keyId || !keySecret) {
      return res.status(500).json({ error: 'Payment gateway not configured' });
    }

    const razorpay = new Razorpay({ key_id: String(keyId), key_secret: String(keySecret) });

    // Amount in paise (INR × 100)
    const amountPaise = Math.round(Number(grandTotal) * 100);

    const rzpOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: generateOrderId(),
      notes: {
        buyer: contactName,
        company: String(company),
        city: String(city),
      },
    });

    const orderId = generateOrderId();

    await db.insert(order).values({
      id: orderId,
      buyerId: session.user.id,
      razorpayOrderId: rzpOrder.id,
      items: items,
      subtotal: String(subtotal),
      freightFee: String(freightFee),
      grandTotal: String(grandTotal),
      contactName,
      company,
      phone,
      email,
      address,
      pincode,
      city,
      state,
      deliveryType,
      notes,
      paymentStatus: 'pending',
      orderStatus: 'pending',
    });

    res.json({
      orderId,
      razorpayOrderId: rzpOrder.id,
      amount: amountPaise,
      currency: 'INR',
      keyId,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order', message: String(error) });
  }
}
