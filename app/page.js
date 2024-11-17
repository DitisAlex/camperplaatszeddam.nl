"use client";

import { useState } from "react";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";

export default function Home() {
  const [licensePlate, setLicensePlate] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [message, setMessage] = useState("");

  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

  const handleAddParking = async (parkingSpotId, licensePlate, expiresAt) => {
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licensePlate,
          expiresAt,
          parkingSpotId,
        }),
      });

      const { id } = await response.json();
      const stripe = await stripePromise;

      await stripe.redirectToCheckout({ sessionId: id });
    } catch (error) {
      console.error("Error reserving parking spot:", error);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              app/page.js
            </code>
            .
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className="flex flex-col gap-4 items-center">
          <h2>Add Parking</h2>
          <input
            type="text"
            placeholder="License Plate"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            className="border border-gray-300 rounded p-2"
          />
          <input
            type="datetime-local"
            placeholder="Expires At"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="border border-gray-300 rounded p-2"
          />
          <button
            onClick={handleAddParking("1", licensePlate, expiresAt)}
            className="rounded-full border border-solid border-transparent transition-colors bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm h-10 px-4"
          >
            Add Parking
          </button>
          {message && <p className="mt-4 text-sm text-center">{message}</p>}
        </div>
      </main>
    </div>
  );
}
