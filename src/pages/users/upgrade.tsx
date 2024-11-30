import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { loadStripe } from "@stripe/stripe-js";

// Initialize stripePromise with your publishable key
const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY!);


const UpgradeToPro: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<"card" | "apple" | "paypal">("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
  
    try {
      if (selectedMethod === "card") {
        const accessToken = localStorage.getItem("accesstoken");
        // Step 1: Request clientSecret from the backend
        const response = await fetch("/api/users/upgrade", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // Replace with actual JWT handling logic
          },
        });
  
        if (!response.ok) {
          throw new Error("Failed to create payment intent. Please try again.");
        }
  
        const { clientSecret } = await response.json();
  
        // Step 2: Confirm the payment using Stripe.js
        const stripe = await stripePromise;
  
        if (!stripe) {
          throw new Error("Stripe.js failed to load.");
        }
  
        const { error } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: {
              token: "tok_visa", // Replace with real card input via Stripe Elements
            },
            billing_details: {
              name: (document.getElementById("name") as HTMLInputElement)?.value,
            },
          },
        });
  
        if (error) {
          throw new Error(error.message || "Payment failed. Please try again.");
        }
  
        // Payment succeeded
        setSuccess(true);
      } else {
        setError("Payment method not implemented yet.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
//   const handleUpgrade = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       if (selectedMethod === "card") {
//         console.log("Processing card payment...");
//         setSuccess(true);
//       } else {
//         setError("Payment method not implemented yet.");
//       }
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

  return (
    <div className="flex w-full items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Upgrade to Pro</CardTitle>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center">
              <h2 className="text-lg font-bold text-green-600">You're now a Pro user!</h2>
              <p className="mt-2">Enjoy your premium features.</p>
            </div>
          ) : (
            <>
              <p className="text-center mb-4 text-gray-600">
                Upgrade your plan to Pro for <span className="font-bold">$9.99/month</span>.
              </p>

              <Tabs
                value={selectedMethod}
                onValueChange={(value) => setSelectedMethod(value as "card" | "apple" | "paypal")}
              >
                <TabsList className="flex justify-center mb-4">
                  <TabsTrigger value="card">Card</TabsTrigger>
                  <TabsTrigger value="apple">Apple Pay</TabsTrigger>
                  <TabsTrigger value="paypal">PayPal</TabsTrigger>
                </TabsList>

                <TabsContent value="card">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Cardholder Name</Label>
                      <Input id="name" placeholder="John Doe" />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input id="postalCode" placeholder="12345" />
                    </div>
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="flex gap-4 mb-4">
                      <div className="w-1/2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input id="expiryDate" placeholder="MM/YY" />
                      </div>
                      <div className="w-1/2 mb-4">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="apple">
                  <div className="text-center">
                    <p className="text-gray-600">Apple Pay is not implemented yet.</p>
                  </div>
                </TabsContent>

                <TabsContent value="paypal">
                  <div className="text-center">
                    <p className="text-gray-600">PayPal is not implemented yet.</p>
                  </div>
                </TabsContent>
              </Tabs>

              {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

              <Button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full "
              >
                {loading ? "Processing..." : `Pay $9.99`}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UpgradeToPro;
