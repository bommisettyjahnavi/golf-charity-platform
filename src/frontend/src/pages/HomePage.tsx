import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  DollarSign,
  Handshake,
  Heart,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Draw } from "../backend";
import { DrawStatus } from "../backend";
import {
  useFeaturedCharities,
  usePublishedDraws,
  useTotalCharityContributions,
  useTotalUsers,
} from "../hooks/useQueries";

const CHARITY_IMAGES = [
  "/assets/generated/charity-education.dim_600x400.jpg",
  "/assets/generated/charity-water.dim_600x400.jpg",
  "/assets/generated/charity-health.dim_600x400.jpg",
];

function CountdownTimer({ targetDate }: { targetDate: number }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, targetDate - Date.now());
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
  }, [targetDate]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex gap-3">
      {[
        { label: "DAYS", val: time.d },
        { label: "HRS", val: time.h },
        { label: "MINS", val: time.m },
        { label: "SECS", val: time.s },
      ].map(({ label, val }) => (
        <div key={label} className="flex flex-col items-center">
          <span
            className="font-display text-2xl font-bold text-gold"
            style={{ minWidth: 40, textAlign: "center" }}
          >
            {pad(val)}
          </span>
          <span className="text-xs text-muted-foreground tracking-wider">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

const STEPS = [
  {
    icon: <Trophy className="text-gold" size={28} />,
    title: "Subscribe",
    desc: "Choose your plan. A portion of every subscription goes directly to your chosen charity — automatically.",
    num: "01",
  },
  {
    icon: <Target className="text-gold" size={28} />,
    title: "Track Scores",
    desc: "Enter your last 5 Stableford scores. Your scores enter you into the monthly draw — the better you play, the more you earn.",
    num: "02",
  },
  {
    icon: <Heart className="text-gold" size={28} />,
    title: "Win & Give",
    desc: "Monthly draws with real prize pools. Win big, give more. Your impact is visible in every round.",
    num: "03",
  },
];

const STATIC_CHARITIES = [
  {
    id: 1,
    name: "Future Scholars Fund",
    description:
      "Providing quality education to underprivileged children across Sub-Saharan Africa through scholarships, school supplies, and infrastructure.",
    goal: 50000,
    raised: 32400,
    image: CHARITY_IMAGES[0],
    featured: true,
  },
  {
    id: 2,
    name: "Clean Water Initiative",
    description:
      "Building sustainable clean water infrastructure in rural communities, eliminating waterborne disease and improving quality of life.",
    goal: 35000,
    raised: 21800,
    image: CHARITY_IMAGES[1],
    featured: true,
  },
  {
    id: 3,
    name: "Global Health Alliance",
    description:
      "Delivering critical medical care, vaccinations, and health education to communities with limited access to healthcare services.",
    goal: 80000,
    raised: 56200,
    image: CHARITY_IMAGES[2],
    featured: true,
  },
];

export default function HomePage() {
  const { data: featuredCharities } = useFeaturedCharities();
  const { data: draws } = usePublishedDraws();
  const { data: totalUsers } = useTotalUsers();
  const { data: totalContributions } = useTotalCharityContributions();

  const charities =
    featuredCharities && featuredCharities.length > 0
      ? featuredCharities.map((c, i) => ({
          id: Number(c.id),
          name: c.name,
          description: c.description,
          goal: 50000,
          raised: 30000,
          image: CHARITY_IMAGES[i % CHARITY_IMAGES.length],
          featured: c.featured,
        }))
      : STATIC_CHARITIES;

  const upcomingDraw =
    draws?.find((d: Draw) => d.status === DrawStatus.pending) ?? draws?.[0];
  const drawDate = upcomingDraw
    ? Number(upcomingDraw.drawDate) * 1000
    : Date.now() + 15 * 86400000;
  const prizePool = upcomingDraw ? Number(upcomingDraw.prizePool) : 12500;

  const statsData = [
    {
      icon: <Users size={18} className="text-gold" />,
      label: "Active Subscribers",
      value: totalUsers ? totalUsers.toString() : "2,847",
    },
    {
      icon: <DollarSign size={18} className="text-gold" />,
      label: "Total Donated",
      value: totalContributions
        ? `\u00a3${Number(totalContributions).toLocaleString()}`
        : "\u00a3284,720",
    },
    {
      icon: <Handshake size={18} className="text-gold" />,
      label: "Charities Supported",
      value: "38",
    },
  ];

  return (
    <main className="pt-16">
      {/* Hero */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6"
        style={{
          backgroundImage:
            "url(/assets/generated/hero-handshake.dim_1920x900.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        data-ocid="hero.section"
      >
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-6 font-medium">
              Golf &middot; Charity &middot; Community
            </p>
            <h1
              className="font-display font-bold text-foreground mb-6 leading-tight"
              style={{
                fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
                letterSpacing: "0.04em",
              }}
            >
              PLAY GOLF.
              <br />
              WIN PRIZES.
              <br />
              <span className="text-gold">CHANGE LIVES.</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
              The subscription platform where your handicap meets humanity.
              Enter monthly draws, track your Stableford scores, and make a real
              difference with every round.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <button
                  type="button"
                  className="btn-gold rounded-full px-8 py-4 text-sm tracking-widest uppercase font-semibold"
                  data-ocid="hero.primary_button"
                >
                  Start Your Journey
                </button>
              </Link>
              <Link to="/charities">
                <button
                  type="button"
                  className="rounded-full px-8 py-4 text-sm tracking-widest uppercase font-semibold border border-gold text-gold hover:bg-gold/10 transition-colors"
                  data-ocid="hero.secondary_button"
                >
                  Our Charities
                </button>
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground"
        >
          <ChevronRight size={20} className="rotate-90 opacity-60" />
        </motion.div>
      </section>

      {/* Stats strip */}
      <section
        className="py-6 px-6"
        style={{
          background: "oklch(16% 0.035 195)",
          borderBottom: "1px solid oklch(34% 0.04 195)",
        }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-0">
          {statsData.map((s, i) => (
            <div
              key={s.label}
              className="flex items-center justify-center gap-3 px-6 py-2"
              style={
                i < 2 ? { borderRight: "1px solid oklch(34% 0.04 195)" } : {}
              }
            >
              <div>{s.icon}</div>
              <div>
                <p className="font-display font-bold text-xl text-foreground">
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground tracking-wider">
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">
              Simple &amp; Transparent
            </p>
            <h2 className="section-title">HOW IT WORKS</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="teal-card rounded-2xl p-8 relative overflow-hidden"
              >
                <span className="absolute top-4 right-6 font-display text-6xl font-bold opacity-[0.06] text-foreground">
                  {step.num}
                </span>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: "oklch(27% 0.04 195)" }}
                >
                  {step.icon}
                </div>
                <h3 className="font-display text-lg font-semibold tracking-widest uppercase mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Charity spotlight */}
      <section
        className="py-20 px-6"
        style={{ background: "oklch(20% 0.04 195)" }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">
              Making a Difference
            </p>
            <h2 className="section-title">CHARITY SPOTLIGHT</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {charities.slice(0, 3).map((c, i) => (
              <motion.article
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="teal-card rounded-2xl overflow-hidden group"
                data-ocid={`charity.item.${i + 1}`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, oklch(18% 0.04 195 / 0.9) 0%, transparent 50%)",
                    }}
                  />
                  <h3 className="absolute bottom-3 left-4 right-4 font-display text-sm font-semibold tracking-wide text-foreground">
                    {c.name}
                  </h3>
                  {c.featured && (
                    <Badge className="absolute top-3 right-3 btn-gold text-xs border-0">
                      FEATURED
                    </Badge>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                    {c.description}
                  </p>
                  <div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-muted-foreground">Raised</span>
                      <span className="text-gold font-semibold">
                        &pound;{c.raised.toLocaleString()} / &pound;
                        {c.goal.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={(c.raised / c.goal) * 100}
                      className="h-1.5"
                    />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/charities">
              <button
                type="button"
                className="btn-gold rounded-full px-8 py-3 text-xs tracking-widest uppercase"
                data-ocid="charities.primary_button"
              >
                View All Charities
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Monthly draw banner */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8"
            style={{
              background:
                "linear-gradient(135deg, oklch(27% 0.055 185) 0%, oklch(22% 0.045 200) 100%)",
              border: "1px solid oklch(40% 0.06 185)",
            }}
            data-ocid="draw.card"
          >
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-gold mb-2">
                Upcoming Monthly Draw
              </p>
              <h3 className="font-display text-2xl font-bold tracking-wide mb-2">
                TOTAL PRIZE POOL
              </h3>
              <p className="text-3xl font-bold text-gold mb-4">
                &pound;{prizePool.toLocaleString()}
              </p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>&#127942; 5-Match: 40%</span>
                <span>&#129352; 4-Match: 35%</span>
                <span>&#129353; 3-Match: 25%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Last Winner: James O. &middot; 5-Match &middot; &pound;4,200
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">
                Draw In
              </p>
              <CountdownTimer targetDate={drawDate} />
              <Link to="/signup" className="mt-5 block">
                <button
                  type="button"
                  className="btn-gold rounded-full px-6 py-2 text-xs tracking-widest uppercase"
                  data-ocid="draw.primary_button"
                >
                  Enter Now
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Impact at a glance */}
      <section
        className="py-20 px-6"
        style={{ background: "oklch(20% 0.04 195)" }}
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">
              Track Your Game
            </p>
            <h2 className="section-title mb-6">
              YOUR IMPACT
              <br />
              AT A GLANCE
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Every score you enter is a chance to win. Track your last 5
              Stableford scores, watch your draw entries stack up, and see your
              charitable impact grow in real time.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Rolling 5-score system — automatic entry",
                "Stableford format (1–45 points)",
                "Real-time prize pool visibility",
                "Monthly charity contribution tracker",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/dashboard">
              <button
                type="button"
                className="btn-gold rounded-full px-8 py-3 text-sm tracking-widest uppercase"
                data-ocid="impact.primary_button"
              >
                Go to Dashboard
              </button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div
              className="rounded-2xl p-6 relative overflow-hidden"
              style={{
                background: "oklch(24% 0.04 195)",
                border: "1px solid oklch(34% 0.04 195)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-display text-sm tracking-widest uppercase">
                  Score Tracker
                </h4>
                <Badge className="btn-gold border-0 text-xs">ACTIVE</Badge>
              </div>
              <div className="space-y-2">
                {[
                  { score: 38, date: "Mar 18, 2026", rank: 1 },
                  { score: 35, date: "Mar 11, 2026", rank: 2 },
                  { score: 42, date: "Mar 4, 2026", rank: 3 },
                  { score: 31, date: "Feb 26, 2026", rank: 4 },
                  { score: 37, date: "Feb 19, 2026", rank: 5 },
                ].map((s) => (
                  <div
                    key={s.rank}
                    className="flex items-center justify-between py-2 px-3 rounded-lg"
                    style={{ background: "oklch(27% 0.04 195)" }}
                  >
                    <span className="text-xs text-muted-foreground w-16">
                      {s.date}
                    </span>
                    <div className="flex-1 mx-4">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          background: "oklch(34% 0.04 195)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(s.score / 45) * 100}%`,
                            background:
                              "linear-gradient(90deg, oklch(70% 0.11 75), oklch(64% 0.10 70))",
                          }}
                        />
                      </div>
                    </div>
                    <span className="font-display font-bold text-gold text-sm w-8 text-right">
                      {s.score}
                    </span>
                  </div>
                ))}
              </div>
              <div
                className="mt-4 pt-4 flex justify-between"
                style={{ borderTop: "1px solid oklch(34% 0.04 195)" }}
              >
                <span className="text-xs text-muted-foreground">Avg Score</span>
                <span className="text-sm font-bold text-gold">36.6</span>
              </div>
            </div>
            <div
              className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-20"
              style={{ background: "oklch(70% 0.11 75)" }}
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title mb-6">
              READY TO MAKE
              <br />
              YOUR MARK?
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Join thousands of golfers already competing, winning, and changing
              lives through Impact Link.
            </p>
            <Link to="/signup">
              <button
                type="button"
                className="btn-gold rounded-full px-10 py-4 text-sm tracking-widest uppercase font-semibold"
                data-ocid="cta.primary_button"
              >
                Start Your Journey Today
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
