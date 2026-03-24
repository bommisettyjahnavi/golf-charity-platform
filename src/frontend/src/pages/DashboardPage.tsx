import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  CreditCard,
  Heart,
  Loader2,
  Plus,
  Star,
  Ticket,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DrawStatus, Variant_pending_paid } from "../backend";
import type { Draw, Winner } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddGolfScore,
  useCallerProfile,
  useCharities,
  useCreateCheckoutSession,
  useGolfScores,
  usePublishedDraws,
  useUpdateProfile,
  useWinnersByUser,
} from "../hooks/useQueries";

function CountdownTimer({ targetMs }: { targetMs: number }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, targetMs - Date.now());
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetMs]);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex gap-3">
      {[
        { l: "D", v: time.d },
        { l: "H", v: time.h },
        { l: "M", v: time.m },
        { l: "S", v: time.s },
      ].map(({ l, v }) => (
        <div key={l} className="flex flex-col items-center">
          <span className="font-display text-xl font-bold text-gold">
            {pad(v)}
          </span>
          <span className="text-xs text-muted-foreground">{l}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString();

  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const { data: scores, isLoading: scoresLoading } = useGolfScores(principal);
  const { data: charities } = useCharities();
  const { data: draws } = usePublishedDraws();
  const { data: winners } = useWinnersByUser(principal);
  const addScore = useAddGolfScore();
  const updateProfile = useUpdateProfile();
  const createCheckout = useCreateCheckoutSession();

  const [scoreInput, setScoreInput] = useState("");
  const [dateInput, setDateInput] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [charityContrib, setCharityContrib] = useState(10);
  const [selectedCharityId, setSelectedCharityId] = useState<string>("");
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    if (!identity) navigate({ to: "/" });
  }, [identity, navigate]);

  useEffect(() => {
    if (profile) {
      setCharityContrib(Number(profile.charityContributionPercent));
      if (profile.selectedCharityId)
        setSelectedCharityId(profile.selectedCharityId.toString());
    }
  }, [profile]);

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    const s = Number.parseInt(scoreInput);
    if (Number.isNaN(s) || s < 1 || s > 45) {
      toast.error("Score must be between 1 and 45.");
      return;
    }
    if (!dateInput) {
      toast.error("Please enter a date.");
      return;
    }
    try {
      await addScore.mutateAsync({ score: BigInt(s), dateText: dateInput });
      toast.success("Score added!");
      setScoreInput("");
    } catch {
      toast.error("Failed to add score.");
    }
  };

  const handleUpdateCharity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      await updateProfile.mutateAsync({
        name: profile.name,
        email: profile.email,
        selectedCharityId: selectedCharityId ? BigInt(selectedCharityId) : null,
        charityContributionPercent: BigInt(charityContrib),
      });
      toast.success("Charity preferences updated!");
    } catch {
      toast.error("Update failed.");
    }
  };

  const handleSubscribe = async () => {
    try {
      const items = [
        {
          productName:
            plan === "monthly" ? "Impact Link Monthly" : "Impact Link Yearly",
          currency: "gbp",
          quantity: 1n,
          priceInCents: plan === "monthly" ? 1499n : 14990n,
          productDescription:
            plan === "monthly"
              ? "Monthly subscription"
              : "Annual subscription (2 months free)",
        },
      ];
      const session = await createCheckout.mutateAsync(items);
      window.location.href = session.url;
    } catch {
      toast.error("Could not start checkout. Please try again.");
    }
  };

  const upcomingDraw =
    draws?.find((d: Draw) => d.status === DrawStatus.pending) ?? draws?.[0];
  const drawMs = upcomingDraw
    ? Number(upcomingDraw.drawDate) * 1000
    : Date.now() + 15 * 86400000;
  const totalWon =
    winners?.reduce(
      (sum: number, w: Winner) => sum + Number(w.prizeAmount),
      0,
    ) ?? 0;

  if (profileLoading) {
    return (
      <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-gold" size={40} />
      </main>
    );
  }

  return (
    <main className="pt-24 pb-20 min-h-screen px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-1">
            Welcome back
          </p>
          <h1 className="font-display text-3xl font-bold tracking-widest uppercase">
            {profile?.name || "Dashboard"}
          </h1>
        </motion.div>

        <Tabs defaultValue="scores">
          <TabsList
            className="w-full grid grid-cols-5 mb-8 rounded-xl"
            style={{ background: "oklch(24% 0.04 195)" }}
            data-ocid="dashboard.tab"
          >
            {[
              { value: "scores", icon: <Trophy size={14} />, label: "Scores" },
              {
                value: "subscription",
                icon: <CreditCard size={14} />,
                label: "Subscription",
              },
              { value: "charity", icon: <Heart size={14} />, label: "Charity" },
              { value: "draws", icon: <Ticket size={14} />, label: "Draws" },
              {
                value: "winnings",
                icon: <Star size={14} />,
                label: "Winnings",
              },
            ].map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="flex items-center gap-1.5 text-xs data-[state=active]:btn-gold data-[state=active]:rounded-lg"
                data-ocid={`dashboard.${t.value}.tab`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Scores Tab */}
          <TabsContent value="scores">
            <div className="grid md:grid-cols-2 gap-6">
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "oklch(24% 0.04 195)",
                  border: "1px solid oklch(34% 0.04 195)",
                }}
              >
                <h3 className="font-display text-sm tracking-widest uppercase mb-5">
                  Add Score
                </h3>
                <form onSubmit={handleAddScore} className="space-y-4">
                  <div>
                    <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
                      Stableford Score (1-45)
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={45}
                      value={scoreInput}
                      onChange={(e) => setScoreInput(e.target.value)}
                      placeholder="e.g. 38"
                      className="bg-secondary border-border"
                      data-ocid="scores.input"
                    />
                  </div>
                  <div>
                    <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
                      Date Played
                    </Label>
                    <Input
                      type="date"
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                      className="bg-secondary border-border"
                      data-ocid="scores.input"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={addScore.isPending}
                    className="btn-gold rounded-full px-6 py-2 text-xs tracking-widest uppercase w-full"
                    data-ocid="scores.submit_button"
                  >
                    {addScore.isPending ? (
                      <Loader2 className="animate-spin mr-2" size={14} />
                    ) : (
                      <Plus size={14} className="mr-2" />
                    )}
                    Add Score
                  </Button>
                </form>
              </div>
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "oklch(24% 0.04 195)",
                  border: "1px solid oklch(34% 0.04 195)",
                }}
              >
                <h3 className="font-display text-sm tracking-widest uppercase mb-5">
                  Recent Scores
                </h3>
                {scoresLoading ? (
                  <div
                    className="flex items-center justify-center h-32"
                    data-ocid="scores.loading_state"
                  >
                    <Loader2 className="animate-spin text-gold" size={24} />
                  </div>
                ) : !scores || scores.length === 0 ? (
                  <div
                    className="text-center py-8 text-muted-foreground"
                    data-ocid="scores.empty_state"
                  >
                    <p className="text-sm">
                      No scores yet. Add your first score!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[...scores]
                      .reverse()
                      .slice(0, 5)
                      .map((s, i) => (
                        <div
                          key={s.dateText + String(i)}
                          className="flex items-center justify-between py-2 px-3 rounded-lg"
                          style={{ background: "oklch(27% 0.04 195)" }}
                          data-ocid={`scores.item.${i + 1}`}
                        >
                          <span className="text-xs text-muted-foreground">
                            {s.dateText}
                          </span>
                          <div className="flex-1 mx-4">
                            <div
                              className="h-1.5 rounded-full overflow-hidden"
                              style={{ background: "oklch(34% 0.04 195)" }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${(Number(s.score) / 45) * 100}%`,
                                  background:
                                    "linear-gradient(90deg, oklch(70% 0.11 75), oklch(64% 0.10 70))",
                                }}
                              />
                            </div>
                          </div>
                          <span className="font-display font-bold text-gold text-sm">
                            {Number(s.score)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <div
              className="rounded-2xl p-8"
              style={{
                background: "oklch(24% 0.04 195)",
                border: "1px solid oklch(34% 0.04 195)",
              }}
            >
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="font-display text-sm tracking-widest uppercase mb-2">
                    Subscription Status
                  </h3>
                  <Badge
                    className={`text-xs border-0 ${profile?.subscriptionActive ? "btn-gold" : "bg-muted text-muted-foreground"}`}
                    data-ocid="subscription.card"
                  >
                    {profile?.subscriptionActive ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {[
                  {
                    label: "Monthly",
                    price: "£14.99",
                    per: "/month",
                    plan: "monthly" as const,
                    highlight: false,
                  },
                  {
                    label: "Yearly",
                    price: "£149.90",
                    per: "/year",
                    plan: "yearly" as const,
                    highlight: true,
                  },
                ].map((p) => (
                  <button
                    key={p.plan}
                    type="button"
                    onClick={() => setPlan(p.plan)}
                    className={`rounded-xl p-5 text-left transition-all border ${
                      plan === p.plan
                        ? "btn-gold border-transparent"
                        : "border-border text-muted-foreground hover:border-gold"
                    }`}
                    data-ocid={`subscription.${p.plan}.button`}
                  >
                    <p className="font-display text-xs tracking-widest uppercase mb-1">
                      {p.label}
                    </p>
                    <p className="text-2xl font-bold">
                      {p.price}
                      <span className="text-sm font-normal opacity-70">
                        {p.per}
                      </span>
                    </p>
                    {p.highlight && (
                      <p className="text-xs mt-1 opacity-80">2 months free!</p>
                    )}
                  </button>
                ))}
              </div>

              <Button
                onClick={handleSubscribe}
                disabled={createCheckout.isPending}
                className="btn-gold rounded-full px-8 py-3 text-sm tracking-widest uppercase w-full"
                data-ocid="subscription.submit_button"
              >
                {createCheckout.isPending ? (
                  <Loader2 className="animate-spin mr-2" size={16} />
                ) : null}
                {createCheckout.isPending
                  ? "Redirecting..."
                  : profile?.subscriptionActive
                    ? "Manage Subscription"
                    : "Subscribe Now"}
              </Button>
            </div>
          </TabsContent>

          {/* Charity Tab */}
          <TabsContent value="charity">
            <div
              className="rounded-2xl p-8"
              style={{
                background: "oklch(24% 0.04 195)",
                border: "1px solid oklch(34% 0.04 195)",
              }}
            >
              <h3 className="font-display text-sm tracking-widest uppercase mb-6">
                Charity Preferences
              </h3>
              <form onSubmit={handleUpdateCharity} className="space-y-6">
                <div>
                  <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-3 block">
                    Selected Charity
                  </Label>
                  <Select
                    value={selectedCharityId}
                    onValueChange={setSelectedCharityId}
                  >
                    <SelectTrigger
                      className="bg-secondary border-border"
                      data-ocid="charity.select"
                    >
                      <SelectValue placeholder="Choose a charity..." />
                    </SelectTrigger>
                    <SelectContent
                      style={{ background: "oklch(24% 0.04 195)" }}
                    >
                      {(charities ?? []).map((c) => (
                        <SelectItem
                          key={c.id.toString()}
                          value={c.id.toString()}
                        >
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label className="text-xs tracking-widest uppercase text-muted-foreground">
                      Contribution Percentage
                    </Label>
                    <span className="text-gold font-bold">
                      {charityContrib}%
                    </span>
                  </div>
                  <Slider
                    min={10}
                    max={100}
                    step={5}
                    value={[charityContrib]}
                    onValueChange={([v]) => setCharityContrib(v)}
                    data-ocid="charity.select"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Minimum 10% of your subscription fee
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="btn-gold rounded-full px-8 py-3 text-sm tracking-widest uppercase w-full"
                  data-ocid="charity.save_button"
                >
                  {updateProfile.isPending ? (
                    <Loader2 className="animate-spin mr-2" size={16} />
                  ) : null}
                  Save Preferences
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* Draws Tab */}
          <TabsContent value="draws">
            <div className="space-y-4">
              {upcomingDraw && (
                <div
                  className="rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(27% 0.055 185), oklch(22% 0.045 200))",
                    border: "1px solid oklch(40% 0.06 185)",
                  }}
                  data-ocid="draws.card"
                >
                  <div>
                    <p className="text-xs tracking-widest uppercase text-gold mb-1">
                      Next Draw
                    </p>
                    <p className="font-display text-lg font-bold tracking-wide">
                      Prize Pool: £
                      {Number(upcomingDraw.prizePool).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Jackpot Rollover: £
                      {Number(upcomingDraw.jackpot).toLocaleString()}
                    </p>
                  </div>
                  <CountdownTimer targetMs={drawMs} />
                </div>
              )}
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "oklch(24% 0.04 195)",
                  border: "1px solid oklch(34% 0.04 195)",
                }}
              >
                <h3 className="font-display text-sm tracking-widest uppercase mb-5">
                  Published Draws
                </h3>
                {!draws || draws.length === 0 ? (
                  <p
                    className="text-sm text-muted-foreground"
                    data-ocid="draws.empty_state"
                  >
                    No draws published yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {draws.map((d: Draw, i: number) => (
                      <div
                        key={d.id.toString()}
                        className="flex items-center justify-between py-3 px-4 rounded-lg"
                        style={{ background: "oklch(27% 0.04 195)" }}
                        data-ocid={`draws.item.${i + 1}`}
                      >
                        <div>
                          <p className="text-sm font-medium">
                            Draw #{d.id.toString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Pool: £{Number(d.prizePool).toLocaleString()}
                          </p>
                        </div>
                        <Badge
                          className={`text-xs border-0 ${
                            d.status === DrawStatus.published
                              ? "btn-gold"
                              : d.status === DrawStatus.pending
                                ? "bg-muted text-muted-foreground"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {d.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Winnings Tab */}
          <TabsContent value="winnings">
            <div className="space-y-4">
              <div
                className="rounded-2xl p-6 flex items-center justify-between"
                style={{
                  background: "oklch(24% 0.04 195)",
                  border: "1px solid oklch(34% 0.04 195)",
                }}
                data-ocid="winnings.card"
              >
                <div>
                  <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">
                    Total Won
                  </p>
                  <p className="font-display text-3xl font-bold text-gold">
                    £{totalWon.toLocaleString()}
                  </p>
                </div>
                <Trophy className="text-gold opacity-30" size={48} />
              </div>
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "oklch(24% 0.04 195)",
                  border: "1px solid oklch(34% 0.04 195)",
                }}
              >
                <h3 className="font-display text-sm tracking-widest uppercase mb-5">
                  Winner Records
                </h3>
                {!winners || winners.length === 0 ? (
                  <p
                    className="text-sm text-muted-foreground"
                    data-ocid="winnings.empty_state"
                  >
                    No winnings yet. Keep playing!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {winners.map((w: Winner, i: number) => (
                      <div
                        key={w.drawId.toString() + String(i)}
                        className="flex items-center justify-between py-3 px-4 rounded-lg"
                        style={{ background: "oklch(27% 0.04 195)" }}
                        data-ocid={`winnings.item.${i + 1}`}
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {Number(w.matchCount)}-Number Match
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Draw #{w.drawId.toString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gold">
                            £{Number(w.prizeAmount).toLocaleString()}
                          </span>
                          <Badge
                            className={`text-xs border-0 ${
                              w.paymentStatus === Variant_pending_paid.paid
                                ? "btn-gold"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {w.paymentStatus}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
