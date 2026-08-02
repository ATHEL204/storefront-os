import Stripe from 'stripe'

// Single shared Stripe client, same singleton pattern as lib/prisma.ts
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-07-29.dahlia',
})
