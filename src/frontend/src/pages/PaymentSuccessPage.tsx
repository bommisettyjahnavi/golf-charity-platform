import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";

export default function PaymentSuccessPage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId || !actor) {
      setStatus("success");
      return;
    }
    actor
      .getStripeSessionStatus(sessionId)
      .then((res) => {
        if (res.__kind__ === "completed") {
          qc.invalidateQueries({ queryKey: ["callerProfile"] });
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("success"));
  }, [actor, qc]);

  return (
    <main className="pt-24 pb-20 min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
        data-ocid="payment.success_state"
      >
        {status === "loading" ? (
          <Loader2 className="animate-spin text-gold mx-auto mb-6" size={48} />
        ) : (
          <>
            <CheckCircle2 className="text-gold mx-auto mb-6" size={64} />
            <h1 className="font-display text-3xl font-bold tracking-widest uppercase mb-4">
              {status === "success"
                ? "SUBSCRIPTION ACTIVE!"
                : "PAYMENT RECEIVED"}
            </h1>
            <p className="text-muted-foreground mb-8">
              Welcome to Impact Link. Your subscription is now active. Start
              entering your scores and make your mark on the leaderboard.
            </p>
            <Link to="/dashboard">
              <button
                type="button"
                className="btn-gold rounded-full px-8 py-3 text-sm tracking-widest uppercase"
                data-ocid="payment.primary_button"
              >
                Go to Dashboard
              </button>
            </Link>
          </>
        )}
      </motion.div>
    </main>
  );
}
