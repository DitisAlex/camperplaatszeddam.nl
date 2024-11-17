import Stripe from "stripe";
import { query } from "../../lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { parkingSpotId, licensePlate, expires_at } = req.body;

    try {
      // Step 1: Fetch parking spot details (simulated here, replace with DB query if needed)
      const parkingSpot = {
        id: parkingSpotId,
        price: 1000, // Price in cents ($10)
        description: `Parking Spot Reservation for License Plate: ${licensePlate}`,
      };

      // Step 2: Create a Stripe Checkout session
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

      // Step 3: Insert a new row into the Parking table
      const result = await query(
        `INSERT INTO parking (expires_at, license_plate, spot_number) VALUES ($1, $2) RETURNING *`,
        [expires_at, licensePlate, parkingSpotId]
      );

      // Step 4: Respond with the Checkout session ID and the database entry
      res.status(200).json({
        message:
          "Checkout session created and parking entry added successfully!",
        sessionId: session.id,
        parkingEntry: result.rows[0], // Return the newly added parking entry
      });
    } catch (error) {
      console.error("Error handling request:", error);
      res.status(500).json({ error: "Error: " + error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end("Method Not Allowed");
  }
}
