import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { parkingSpotId, licensePlate } = req.body;

    try {
      // Fetch parking spot details from your database
      // (replace this with a real DB query)
      const parkingSpot = {
        id: parkingSpotId,
        price: 1000, // Price in cents ($10)
        description: `Parking Spot Reservation for License Plate: ${licensePlate}`,
      };

      // Create a Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Parking Spot #${parkingSpot.id}`,
                description: parkingSpot.description,
              },
              unit_amount: parkingSpot.price,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}&spot_id=${parkingSpot.id}`,
        cancel_url: `${req.headers.origin}/cancel`,
      });

      res.status(200).json({ id: session.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end("Method Not Allowed");
  }
}
