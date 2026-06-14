import { useState } from "react";
import { X, CreditCard, Smartphone, Wallet, CheckCircle, Loader2, QrCode } from "lucide-react";
import { registerForEvent } from "@/lib/api/platform.functions";
import type { EventItem } from "@/lib/data";

type Step = "select" | "details" | "processing" | "success";
type Method = "upi" | "card" | "wallet";

interface PaymentModalProps {
  event: EventItem;
  token: string;
  onClose: () => void;
  onSuccess: () => void;
  registrationData: { fullName: string; email: string; rollNumber: string; year: string };
}

export function PaymentModal({ event, token, onClose, onSuccess, registrationData }: PaymentModalProps) {
  const [step, setStep] = useState<Step>("select");
  const [method, setMethod] = useState<Method>("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");
  const confirmationNumber = `XPLORE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  async function processPayment() {
    setStep("processing");
    setError("");
    // Simulate payment processing delay
    await new Promise((res) => setTimeout(res, 2000));
    try {
      await registerForEvent({ data: { token, eventId: event.id, ...registrationData } });
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed. Please try again.");
      setStep("details");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-display font-bold text-lg">Complete Payment</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{event.name}</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-secondary grid place-items-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          {/* Amount pill */}
          <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-primary-soft">
            <span className="text-sm font-medium">Registration fee</span>
            <span className="font-display text-xl font-extrabold text-primary">{event.fee}</span>
          </div>

          {step === "select" && (
            <>
              <p className="text-sm font-semibold mb-3">Choose payment method</p>
              <div className="space-y-2 mb-6">
                {[
                  { id: "upi" as Method, icon: Smartphone, label: "UPI", sub: "Google Pay, PhonePe, Paytm" },
                  { id: "card" as Method, icon: CreditCard, label: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay" },
                  { id: "wallet" as Method, icon: Wallet, label: "Wallet", sub: "Paytm, Amazon Pay" },
                ].map(({ id, icon: Icon, label, sub }) => (
                  <button
                    key={id}
                    onClick={() => setMethod(id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition ${
                      method === id ? "border-primary bg-primary-soft" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className={`h-9 w-9 rounded-lg grid place-items-center ${method === id ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold">{label}</div>
                      <div className="text-xs text-muted-foreground">{sub}</div>
                    </div>
                    <div className={`ml-auto h-4 w-4 rounded-full border-2 ${method === id ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep("details")}
                className="w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold hover:opacity-90 transition"
              >
                Continue
              </button>
            </>
          )}

          {step === "details" && (
            <>
              {method === "upi" && (
                <div className="space-y-4 mb-6">
                  <div className="flex justify-center">
                    <div className="h-32 w-32 rounded-xl bg-secondary grid place-items-center text-muted-foreground">
                      <QrCode className="h-16 w-16" />
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">Scan or enter UPI ID below</p>
                  <input
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="w-full h-11 px-4 rounded-xl border border-border bg-secondary text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>
              )}
              {method === "card" && (
                <div className="space-y-3 mb-6">
                  <input value={cardNum} onChange={(e) => setCardNum(e.target.value.replace(/\D/g, "").slice(0, 16))} placeholder="Card number" className="w-full h-11 px-4 rounded-xl border border-border bg-secondary text-sm focus:outline-none" />
                  <input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Name on card" className="w-full h-11 px-4 rounded-xl border border-border bg-secondary text-sm focus:outline-none" />
                  <div className="grid grid-cols-2 gap-3">
                    <input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM / YY" className="w-full h-11 px-4 rounded-xl border border-border bg-secondary text-sm focus:outline-none" />
                    <input value={cvv} onChange={(e) => setCvv(e.target.value.slice(0, 3))} placeholder="CVV" className="w-full h-11 px-4 rounded-xl border border-border bg-secondary text-sm focus:outline-none" />
                  </div>
                </div>
              )}
              {method === "wallet" && (
                <div className="space-y-2 mb-6">
                  {["Paytm Wallet", "Amazon Pay", "MobiKwik"].map((w) => (
                    <button key={w} className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-border hover:border-primary/40 hover:bg-primary-soft/30 text-sm font-medium transition">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      {w}
                    </button>
                  ))}
                </div>
              )}
              {error && <p className="rounded-xl bg-destructive/10 text-destructive p-3 text-sm mb-4">{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => setStep("select")} className="flex-1 rounded-full border border-border py-3 text-sm font-semibold hover:bg-secondary transition">
                  Back
                </button>
                <button onClick={processPayment} className="flex-1 rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold hover:opacity-90 transition">
                  Pay {event.fee}
                </button>
              </div>
            </>
          )}

          {step === "processing" && (
            <div className="flex flex-col items-center py-8 space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary-soft grid place-items-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-semibold">Processing payment...</p>
                <p className="text-xs text-muted-foreground mt-1">Please don't close this window</p>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center py-6 space-y-4 text-center">
              <div className="h-16 w-16 rounded-full bg-success-soft grid place-items-center">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl">Payment Successful!</h3>
                <p className="text-sm text-muted-foreground mt-1">You're registered for {event.name}</p>
              </div>
              <div className="w-full p-4 rounded-xl bg-secondary space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confirmation</span>
                  <span className="font-mono font-semibold">{confirmationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Event</span>
                  <span className="font-semibold">{event.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold text-success">{event.fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-semibold">{event.date}</span>
                </div>
              </div>
              <button onClick={() => { onSuccess(); onClose(); }} className="w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-semibold">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
