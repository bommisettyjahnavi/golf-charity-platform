import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCharities,
  useRegisterUser,
  useUpdateProfile,
} from "../hooks/useQueries";

type Step = "auth" | "register" | "charity";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { login, loginStatus, identity } = useInternetIdentity();
  const [step, setStep] = useState<Step>(identity ? "register" : "auth");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCharityId, setSelectedCharityId] = useState<bigint | null>(
    null,
  );
  const [contribution, setContribution] = useState(10);

  const registerUser = useRegisterUser();
  const updateProfile = useUpdateProfile();
  const { data: charities } = useCharities();

  const handleLogin = async () => {
    try {
      await login();
      setStep("register");
    } catch (err: any) {
      if (err.message === "User is already authenticated") {
        setStep("register");
      } else {
        toast.error("Login failed. Please try again.");
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      await registerUser.mutateAsync({
        name: name.trim(),
        email: email.trim(),
      });
      toast.success("Account created!");
      setStep("charity");
    } catch {
      toast.error("Registration failed. Please try again.");
    }
  };

  const handleCharitySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        selectedCharityId,
        charityContributionPercent: BigInt(contribution),
      });
      toast.success("Profile saved! Welcome to Impact Link.");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  const steps: Step[] = ["auth", "register", "charity"];
  const stepIndex = steps.indexOf(step);

  return (
    <main className="pt-24 pb-20 min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-10">
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">
              Join Us
            </p>
            <h1 className="font-display text-3xl font-bold tracking-widest uppercase">
              CREATE ACCOUNT
            </h1>
          </div>

          <div className="flex items-center justify-center gap-2 mb-10">
            {["Connect", "Details", "Charity"].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      i <= stepIndex
                        ? "btn-gold"
                        : "border border-border text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <ChevronRight
                    size={12}
                    className="text-muted-foreground mb-4"
                  />
                )}
              </div>
            ))}
          </div>

          <div
            className="rounded-2xl p-8"
            style={{
              background: "oklch(24% 0.04 195)",
              border: "1px solid oklch(34% 0.04 195)",
            }}
          >
            {step === "auth" && (
              <div className="text-center">
                <p className="text-muted-foreground text-sm mb-8">
                  Sign in securely with Internet Identity to get started.
                </p>
                <Button
                  onClick={handleLogin}
                  disabled={loginStatus === "logging-in"}
                  className="btn-gold rounded-full px-8 py-3 w-full text-sm tracking-widest uppercase"
                  data-ocid="signup.primary_button"
                >
                  {loginStatus === "logging-in" ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Connecting...
                    </>
                  ) : (
                    "Connect Identity"
                  )}
                </Button>
              </div>
            )}

            {step === "register" && (
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
                    Full Name
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="bg-secondary border-border"
                    required
                    data-ocid="signup.input"
                  />
                </div>
                <div>
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-secondary border-border"
                    required
                    data-ocid="signup.input"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={registerUser.isPending}
                  className="btn-gold rounded-full px-8 py-3 w-full text-sm tracking-widest uppercase"
                  data-ocid="signup.submit_button"
                >
                  {registerUser.isPending ? (
                    <Loader2 className="animate-spin mr-2" size={16} />
                  ) : null}
                  {registerUser.isPending ? "Creating..." : "Continue"}
                </Button>
              </form>
            )}

            {step === "charity" && (
              <form onSubmit={handleCharitySetup} className="space-y-6">
                <div>
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-3 block">
                    Select Your Charity
                  </Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(charities && charities.length > 0
                      ? charities
                      : ([
                          { id: 1n, name: "Future Scholars Fund" },
                          { id: 2n, name: "Clean Water Initiative" },
                          { id: 3n, name: "Global Health Alliance" },
                        ] as any[])
                    ).map((c) => (
                      <button
                        key={c.id.toString()}
                        type="button"
                        onClick={() => setSelectedCharityId(c.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                          selectedCharityId === c.id
                            ? "btn-gold"
                            : "border border-border text-muted-foreground hover:border-gold"
                        }`}
                        data-ocid="charity.select.button"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label className="text-xs tracking-widest uppercase text-muted-foreground">
                      Charity Contribution
                    </Label>
                    <span className="text-gold font-bold">{contribution}%</span>
                  </div>
                  <Slider
                    min={10}
                    max={100}
                    step={5}
                    value={[contribution]}
                    onValueChange={([v]) => setContribution(v)}
                    className="w-full"
                    data-ocid="signup.select"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Minimum 10% of your subscription fee
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="btn-gold rounded-full px-8 py-3 w-full text-sm tracking-widest uppercase"
                  data-ocid="signup.submit_button"
                >
                  {updateProfile.isPending ? (
                    <Loader2 className="animate-spin mr-2" size={16} />
                  ) : null}
                  {updateProfile.isPending ? "Saving..." : "Complete Setup"}
                </Button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
