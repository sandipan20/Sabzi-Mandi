/**
 * POST /api/orders/verify
 * Verifies Razorpay payment signature and marks order as paid.
 * Body: { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
 */
import type { Request, Response } from 'express';
import crypto from 'crypto';
import { getSecret } from '#airo/secrets';
import { db } from '../../../db/client.js';
import { order } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { getAuth } from '@/lib/auth/auth.js';

export default async function handler(req: Request, res: Response) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ error: 'Missing payment verification fields' });
    }

    const keySecret = getSecret('RAZORPAY_KEY_SECRET');
    if (!keySecret) return res.status(500).json({ error: 'Payment gateway not configured' });

    // Verify HMAC-SHA256 signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', String(keySecret))
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      // Mark as failed
      await db.update(order)
        .set({ paymentStatus: 'failed' })
        .where(eq(order.id, orderId));
      return res.status(400).json({ error: 'Payment signature verification failed' });
    }

    // Mark as paid + confirmed
    await db.update(order)
      .set({
        razorpayPaymentId,
        razorpaySignature,
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
      })
      .where(eq(order.id, orderId));

    res.json({ success: true, orderId, paymentId: razorpayPaymentId });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Verification failed', message: String(error) });
  }
}
