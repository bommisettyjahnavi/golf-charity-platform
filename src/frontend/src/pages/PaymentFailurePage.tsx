import { Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { motion } from "motion/react";

export default function PaymentFailurePage() {
  return (
    <main className="pt-24 pb-20 min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
        data-ocid="payment.error_state"
      >
        <XCircle
          className="mx-auto mb-6 opacity-60"
          size={64}
          style={{ color: "oklch(55% 0.22 25)" }}
        />
        <h1 className="font-display text-3xl font-bold tracking-widest uppercase mb-4">
          PAYMENT CANCELLED
        </h1>
        <p className="text-muted-foreground mb-8">
          Your payment was not completed. No charges have been made. You can try
          again whenever you&apos;re ready.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/dashboard">
            <button
              type="button"
              className="border border-gold text-gold rounded-full px-6 py-3 text-sm tracking-widest uppercase hover:bg-gold/10 transition-colors"
              data-ocid="payment.cancel_button"
            >
              Back to Dashboard
            </button>
          </Link>
          <Link to="/signup">
            <button
              type="button"
              className="btn-gold rounded-full px-6 py-3 text-sm tracking-widest uppercase"
              data-ocid="payment.primary_button"
            >
              Try Again
            </button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
