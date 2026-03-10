import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
})

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json()

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: "https://coach.tonehouse.sg",
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error("Stripe portal error:", error)
    return NextResponse.json(
      { error: "Unable to create billing portal session" },
      { status: 500 }
    )
  }
}