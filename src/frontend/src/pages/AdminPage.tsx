import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart3,
  CheckCircle2,
  DollarSign,
  Edit2,
  Eye,
  Heart,
  Loader2,
  Plus,
  Settings,
  Ticket,
  Trash2,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { DrawLogic, DrawStatus, Variant_pending_paid } from "../backend";
import type { Charity, Draw, Winner } from "../backend";
import { ExternalBlob } from "../backend";
import {
  useAddCharity,
  useAllUsers,
  useCharities,
  useCreateDraw,
  useDeleteCharity,
  useIsStripeConfigured,
  useMarkWinnerPaid,
  usePublishDraw,
  usePublishedDraws,
  useSetStripeConfig,
  useTotalCharityContributions,
  useTotalUsers,
  useUpdateCharity,
  useWinnersByDraw,
} from "../hooks/useQueries";

function StripeConfigDialog() {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [countries, setCountries] = useState("GB,US,CA,AU");
  const setConfig = useSetStripeConfig();

  const handleSave = async () => {
    try {
      await setConfig.mutateAsync({
        secretKey: key,
        allowedCountries: countries.split(",").map((c) => c.trim()),
      });
      toast.success("Stripe configured!");
      setOpen(false);
    } catch {
      toast.error("Failed to configure Stripe.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="border border-gold text-gold rounded-full px-5 py-2 text-xs tracking-widest uppercase hover:bg-gold/10"
          data-ocid="admin.stripe.open_modal_button"
        >
          Configure Stripe
        </Button>
      </DialogTrigger>
      <DialogContent
        style={{
          background: "oklch(24% 0.04 195)",
          border: "1px solid oklch(34% 0.04 195)",
        }}
        data-ocid="admin.stripe.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display tracking-widest uppercase">
            Stripe Configuration
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
              Secret Key
            </Label>
            <Input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk_live_..."
              className="bg-secondary border-border"
              data-ocid="admin.stripe.input"
            />
          </div>
          <div>
            <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
              Allowed Countries (comma-separated)
            </Label>
            <Input
              value={countries}
              onChange={(e) => setCountries(e.target.value)}
              className="bg-secondary border-border"
              data-ocid="admin.stripe.input"
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={setConfig.isPending}
              className="btn-gold rounded-full px-6 text-xs tracking-widest uppercase flex-1"
              data-ocid="admin.stripe.confirm_button"
            >
              {setConfig.isPending ? (
                <Loader2 className="animate-spin mr-2" size={14} />
              ) : null}{" "}
              Save
            </Button>
            <Button
              onClick={() => setOpen(false)}
              variant="ghost"
              className="rounded-full px-6 text-xs tracking-widest uppercase"
              data-ocid="admin.stripe.cancel_button"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CharityForm({
  onSave,
  initial,
}: { onSave: (c: Charity) => void; initial?: Charity }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [events, setEvents] = useState(initial?.eventsList.join("\n") ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name required.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        id: initial?.id ?? 0n,
        name: name.trim(),
        description: desc.trim(),
        eventsList: events.split("\n").filter(Boolean),
        featured,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
          Name
        </Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-secondary border-border"
          required
          data-ocid="admin.charity.input"
        />
      </div>
      <div>
        <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
          Description
        </Label>
        <Textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="bg-secondary border-border"
          rows={3}
          data-ocid="admin.charity.textarea"
        />
      </div>
      <div>
        <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
          Events (one per line)
        </Label>
        <Textarea
          value={events}
          onChange={(e) => setEvents(e.target.value)}
          className="bg-secondary border-border"
          rows={3}
          placeholder="Golf Day - June 14, 2026"
          data-ocid="admin.charity.textarea"
        />
      </div>
      <div className="flex items-center gap-3">
        <Switch
          checked={featured}
          onCheckedChange={setFeatured}
          data-ocid="admin.charity.switch"
        />
        <Label className="text-xs tracking-widest uppercase text-muted-foreground">
          Featured
        </Label>
      </div>
      <Button
        type="submit"
        disabled={saving}
        className="btn-gold rounded-full px-6 text-xs tracking-widest uppercase w-full"
        data-ocid="admin.charity.save_button"
      >
        {saving ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
        {initial ? "Update Charity" : "Add Charity"}
      </Button>
    </form>
  );
}

function WinnerProofUpload({
  // winner,
  onSaved,
}: { winner: Winner; onSaved: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      ExternalBlob.fromBytes(bytes).withUploadProgress((p) => setProgress(p));

      toast.success("Proof uploaded!");
      onSaved();
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div>
      <Label className="cursor-pointer">
        <input
          type="file"
          accept="image/*,application/pdf"
          className="sr-only"
          onChange={handleFile}
        />
        <span
          className="text-xs text-gold underline cursor-pointer"
          data-ocid="admin.winner.upload_button"
        >
          {uploading ? `Uploading ${progress}%...` : "Upload Proof"}
        </span>
      </Label>
    </div>
  );
}

export default function AdminPage() {
  const { data: users, isLoading: usersLoading } = useAllUsers();
  const { data: totalUsers } = useTotalUsers();
  const { data: totalContributions } = useTotalCharityContributions();
  const { data: charities, isLoading: charitiesLoading } = useCharities();
  const addCharity = useAddCharity();
  const updateCharity = useUpdateCharity();
  const deleteCharity = useDeleteCharity();
  const { data: draws, isLoading: drawsLoading } = usePublishedDraws();
  const createDraw = useCreateDraw();
  const publishDraw = usePublishDraw();
  const markPaid = useMarkWinnerPaid();
  const { data: stripeConfigured } = useIsStripeConfigured();

  const [selectedDraw, setSelectedDraw] = useState<bigint | undefined>();
  const { data: drawWinners } = useWinnersByDraw(selectedDraw);

  const [editCharity, setEditCharity] = useState<Charity | null>(null);
  const [charityDialogOpen, setCharityDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [newDraw, setNewDraw] = useState({
    logic: DrawLogic.random,
    prizePool: "",
    date: "",
  });

  const handleAddCharity = async (c: Charity) => {
    try {
      await addCharity.mutateAsync(c);
      toast.success("Charity added!");
      setCharityDialogOpen(false);
    } catch {
      toast.error("Failed to add charity.");
    }
  };

  const handleUpdateCharity = async (c: Charity) => {
    try {
      await updateCharity.mutateAsync(c);
      toast.success("Charity updated!");
      setEditDialogOpen(false);
    } catch {
      toast.error("Failed to update charity.");
    }
  };

  const handleDeleteCharity = async (id: bigint) => {
    if (!confirm("Delete this charity?")) return;
    try {
      await deleteCharity.mutateAsync(id);
      toast.success("Charity deleted.");
    } catch {
      toast.error("Failed to delete.");
    }
  };

  const handleCreateDraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDraw.prizePool || !newDraw.date) {
      toast.error("Fill in all draw fields.");
      return;
    }
    try {
      const dateMs = new Date(newDraw.date).getTime() / 1000;
      await createDraw.mutateAsync({
        id: 0n,
        status: DrawStatus.pending,
        drawLogic: newDraw.logic,
        jackpot: 0n,
        drawDate: BigInt(Math.floor(dateMs)),
        winningNumbers: [],
        prizePool: BigInt(
          Math.floor(Number.parseFloat(newDraw.prizePool) * 100),
        ),
      });
      toast.success("Draw created!");
      setNewDraw({ logic: DrawLogic.random, prizePool: "", date: "" });
    } catch {
      toast.error("Failed to create draw.");
    }
  };

  const handlePublishDraw = async (id: bigint) => {
    try {
      await publishDraw.mutateAsync(id);
      toast.success("Draw published!");
    } catch {
      toast.error("Failed to publish.");
    }
  };

  const handleMarkPaid = async (id: bigint) => {
    try {
      await markPaid.mutateAsync(id);
      toast.success("Marked as paid!");
    } catch {
      toast.error("Failed to update.");
    }
  };

  const cardStyle = {
    background: "oklch(24% 0.04 195)",
    border: "1px solid oklch(34% 0.04 195)",
  };

  return (
    <main className="pt-24 pb-20 min-h-screen px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-1">
            Control Panel
          </p>
          <h1 className="font-display text-3xl font-bold tracking-widest uppercase">
            ADMIN DASHBOARD
          </h1>
        </motion.div>

        <Tabs defaultValue="analytics">
          <TabsList
            className="w-full grid grid-cols-6 mb-8 rounded-xl"
            style={{ background: "oklch(24% 0.04 195)" }}
            data-ocid="admin.tab"
          >
            {[
              {
                v: "analytics",
                icon: <BarChart3 size={14} />,
                label: "Analytics",
              },
              { v: "users", icon: <Users size={14} />, label: "Users" },
              { v: "draws", icon: <Ticket size={14} />, label: "Draws" },
              { v: "charities", icon: <Heart size={14} />, label: "Charities" },
              { v: "winners", icon: <Trophy size={14} />, label: "Winners" },
              {
                v: "settings",
                icon: <Settings size={14} />,
                label: "Settings",
              },
            ].map((t) => (
              <TabsTrigger
                key={t.v}
                value={t.v}
                className="flex items-center gap-1.5 text-xs data-[state=active]:btn-gold data-[state=active]:rounded-lg"
                data-ocid={`admin.${t.v}.tab`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                {
                  label: "Total Users",
                  value: totalUsers?.toString() ?? "—",
                  icon: <Users size={20} className="text-gold" />,
                },
                {
                  label: "Total Contributions",
                  value: `£${Number(totalContributions ?? 0n).toLocaleString()}`,
                  icon: <DollarSign size={20} className="text-gold" />,
                },
                {
                  label: "Active Draws",
                  value: draws?.length.toString() ?? "0",
                  icon: <Ticket size={20} className="text-gold" />,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl p-6"
                  style={cardStyle}
                  data-ocid="admin.analytics.card"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs tracking-widest uppercase text-muted-foreground">
                      {s.label}
                    </p>
                    {s.icon}
                  </div>
                  <p className="font-display text-3xl font-bold text-gold">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-6" style={cardStyle}>
              <h3 className="font-display text-sm tracking-widest uppercase mb-4">
                Prize Pool Distribution
              </h3>
              <div className="space-y-3">
                {[
                  { label: "5-Number Match (Jackpot)", pct: 40 },
                  { label: "4-Number Match", pct: 35 },
                  { label: "3-Number Match", pct: 25 },
                ].map((tier) => (
                  <div key={tier.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">
                        {tier.label}
                      </span>
                      <span className="text-gold">{tier.pct}%</span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: "oklch(34% 0.04 195)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${tier.pct}%`,
                          background:
                            "linear-gradient(90deg, oklch(70% 0.11 75), oklch(64% 0.10 70))",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            <div className="rounded-2xl overflow-hidden" style={cardStyle}>
              <div className="p-5 border-b border-border">
                <h3 className="font-display text-sm tracking-widest uppercase">
                  All Users
                </h3>
              </div>
              {usersLoading ? (
                <div
                  className="flex justify-center py-12"
                  data-ocid="admin.users.loading_state"
                >
                  <Loader2 className="animate-spin text-gold" size={32} />
                </div>
              ) : !users || users.length === 0 ? (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="admin.users.empty_state"
                >
                  <p>No users found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow style={{ borderColor: "oklch(34% 0.04 195)" }}>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Scores</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u, i) => (
                      <TableRow
                        key={u.email}
                        style={{ borderColor: "oklch(34% 0.04 195)" }}
                        data-ocid={`admin.users.item.${i + 1}`}
                      >
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {u.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs border-0 ${u.role === "admin" ? "btn-gold" : "bg-muted text-muted-foreground"}`}
                          >
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs border-0 ${u.subscriptionActive ? "btn-gold" : "bg-muted text-muted-foreground"}`}
                          >
                            {u.subscriptionActive ? "ACTIVE" : "INACTIVE"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {u.golfScores.length} scores
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Draws */}
          <TabsContent value="draws">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl p-6" style={cardStyle}>
                <h3 className="font-display text-sm tracking-widest uppercase mb-5">
                  Create New Draw
                </h3>
                <form onSubmit={handleCreateDraw} className="space-y-4">
                  <div>
                    <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
                      Draw Logic
                    </Label>
                    <Select
                      value={newDraw.logic}
                      onValueChange={(v) =>
                        setNewDraw((p) => ({ ...p, logic: v as DrawLogic }))
                      }
                    >
                      <SelectTrigger
                        className="bg-secondary border-border"
                        data-ocid="admin.draw.select"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent
                        style={{ background: "oklch(24% 0.04 195)" }}
                      >
                        <SelectItem value={DrawLogic.random}>Random</SelectItem>
                        <SelectItem value={DrawLogic.algorithmic}>
                          Algorithmic
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
                      Prize Pool (£)
                    </Label>
                    <Input
                      type="number"
                      value={newDraw.prizePool}
                      onChange={(e) =>
                        setNewDraw((p) => ({ ...p, prizePool: e.target.value }))
                      }
                      className="bg-secondary border-border"
                      placeholder="1000"
                      data-ocid="admin.draw.input"
                    />
                  </div>
                  <div>
                    <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-2 block">
                      Draw Date
                    </Label>
                    <Input
                      type="date"
                      value={newDraw.date}
                      onChange={(e) =>
                        setNewDraw((p) => ({ ...p, date: e.target.value }))
                      }
                      className="bg-secondary border-border"
                      data-ocid="admin.draw.input"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={createDraw.isPending}
                    className="btn-gold rounded-full px-6 text-xs tracking-widest uppercase w-full"
                    data-ocid="admin.draw.submit_button"
                  >
                    {createDraw.isPending ? (
                      <Loader2 className="animate-spin mr-2" size={14} />
                    ) : (
                      <Plus size={14} className="mr-2" />
                    )}
                    Create Draw
                  </Button>
                </form>
              </div>
              <div className="rounded-2xl p-6" style={cardStyle}>
                <h3 className="font-display text-sm tracking-widest uppercase mb-5">
                  Manage Draws
                </h3>
                {drawsLoading ? (
                  <Loader2 className="animate-spin text-gold" size={24} />
                ) : !draws || draws.length === 0 ? (
                  <p
                    className="text-sm text-muted-foreground"
                    data-ocid="admin.draws.empty_state"
                  >
                    No draws yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {draws.map((d: Draw, i: number) => (
                      <div
                        key={d.id.toString()}
                        className="flex items-center justify-between p-3 rounded-lg"
                        style={{ background: "oklch(27% 0.04 195)" }}
                        data-ocid={`admin.draws.item.${i + 1}`}
                      >
                        <div>
                          <p className="text-sm font-medium">
                            Draw #{d.id.toString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {d.drawLogic} · £
                            {Number(d.prizePool / 100n).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`text-xs border-0 ${d.status === DrawStatus.published ? "btn-gold" : "bg-muted text-muted-foreground"}`}
                          >
                            {d.status}
                          </Badge>
                          {d.status !== DrawStatus.published && (
                            <Button
                              size="sm"
                              onClick={() => handlePublishDraw(d.id)}
                              className="btn-gold rounded-full px-3 text-xs"
                              disabled={publishDraw.isPending}
                              data-ocid="admin.draw.primary_button"
                            >
                              Publish
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Charities */}
          <TabsContent value="charities">
            <div className="mb-4 flex justify-end">
              <Dialog
                open={charityDialogOpen}
                onOpenChange={setCharityDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    className="btn-gold rounded-full px-5 text-xs tracking-widest uppercase"
                    data-ocid="admin.charity.open_modal_button"
                  >
                    <Plus size={14} className="mr-2" /> Add Charity
                  </Button>
                </DialogTrigger>
                <DialogContent
                  style={{
                    background: "oklch(24% 0.04 195)",
                    border: "1px solid oklch(34% 0.04 195)",
                  }}
                  data-ocid="admin.charity.dialog"
                >
                  <DialogHeader>
                    <DialogTitle className="font-display tracking-widest uppercase">
                      Add Charity
                    </DialogTitle>
                  </DialogHeader>
                  <CharityForm onSave={handleAddCharity} />
                </DialogContent>
              </Dialog>
            </div>
            {charitiesLoading ? (
              <Loader2 className="animate-spin text-gold" size={32} />
            ) : !charities || charities.length === 0 ? (
              <p
                className="text-muted-foreground"
                data-ocid="admin.charities.empty_state"
              >
                No charities yet.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {charities.map((c, i) => (
                  <div
                    key={c.id.toString()}
                    className="rounded-2xl p-5"
                    style={cardStyle}
                    data-ocid={`admin.charities.item.${i + 1}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-display text-sm tracking-wide">
                          {c.name}
                        </h4>
                        {c.featured && (
                          <Badge className="btn-gold text-xs border-0 mt-1">
                            FEATURED
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditCharity(c);
                            setEditDialogOpen(true);
                          }}
                          className="text-muted-foreground hover:text-foreground"
                          data-ocid="admin.charity.edit_button"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCharity(c.id)}
                          className="text-muted-foreground hover:text-destructive"
                          data-ocid="admin.charity.delete_button"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {c.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent
                style={{
                  background: "oklch(24% 0.04 195)",
                  border: "1px solid oklch(34% 0.04 195)",
                }}
                data-ocid="admin.charity.dialog"
              >
                <DialogHeader>
                  <DialogTitle className="font-display tracking-widest uppercase">
                    Edit Charity
                  </DialogTitle>
                </DialogHeader>
                {editCharity && (
                  <CharityForm
                    onSave={handleUpdateCharity}
                    initial={editCharity}
                  />
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Winners */}
          <TabsContent value="winners">
            <div className="space-y-4">
              <div className="rounded-2xl p-5" style={cardStyle}>
                <Label className="text-xs tracking-widest uppercase text-muted-foreground mb-3 block">
                  Filter by Draw
                </Label>
                <Select
                  value={selectedDraw?.toString() ?? ""}
                  onValueChange={(v) =>
                    setSelectedDraw(v ? BigInt(v) : undefined)
                  }
                >
                  <SelectTrigger
                    className="bg-secondary border-border"
                    data-ocid="admin.winners.select"
                  >
                    <SelectValue placeholder="Select a draw..." />
                  </SelectTrigger>
                  <SelectContent style={{ background: "oklch(24% 0.04 195)" }}>
                    {(draws ?? []).map((d: Draw) => (
                      <SelectItem key={d.id.toString()} value={d.id.toString()}>
                        Draw #{d.id.toString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!drawWinners || drawWinners.length === 0 ? (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="admin.winners.empty_state"
                >
                  <p>
                    {selectedDraw
                      ? "No winners for this draw."
                      : "Select a draw to view winners."}
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden" style={cardStyle}>
                  <Table>
                    <TableHeader>
                      <TableRow style={{ borderColor: "oklch(34% 0.04 195)" }}>
                        <TableHead>User</TableHead>
                        <TableHead>Match</TableHead>
                        <TableHead>Prize</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Proof</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drawWinners.map((w: Winner, i: number) => (
                        <TableRow
                          key={w.userId.toString() + String(i)}
                          style={{ borderColor: "oklch(34% 0.04 195)" }}
                          data-ocid={`admin.winners.item.${i + 1}`}
                        >
                          <TableCell className="text-sm font-mono text-muted-foreground">
                            {w.userId.toString().slice(0, 12)}...
                          </TableCell>
                          <TableCell>
                            <Badge className="btn-gold text-xs border-0">
                              {Number(w.matchCount)}-Match
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gold font-bold">
                            £{Number(w.prizeAmount).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`text-xs border-0 ${w.paymentStatus === Variant_pending_paid.paid ? "btn-gold" : "bg-muted text-muted-foreground"}`}
                            >
                              {w.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {w.proofBlobId ? (
                              <a
                                href={ExternalBlob.fromURL(
                                  w.proofBlobId,
                                ).getDirectURL()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gold text-xs underline"
                              >
                                View
                              </a>
                            ) : (
                              <WinnerProofUpload
                                winner={w}
                                onSaved={() => {}}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {w.paymentStatus !== Variant_pending_paid.paid && (
                              <Button
                                size="sm"
                                onClick={() => handleMarkPaid(w.drawId)}
                                className="btn-gold rounded-full px-3 text-xs"
                                disabled={markPaid.isPending}
                                data-ocid="admin.winner.primary_button"
                              >
                                Mark Paid
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <div className="max-w-2xl space-y-6">
              <div
                className="rounded-2xl p-6"
                style={cardStyle}
                data-ocid="admin.settings.card"
              >
                <div className="flex items-center gap-3 mb-1">
                  <Settings size={16} className="text-gold" />
                  <h3 className="font-display text-sm tracking-widest uppercase">
                    Stripe Configuration
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mb-5">
                  Connect your Stripe account to enable subscription payments
                  and credit card processing.
                </p>
                <div
                  className="flex items-center justify-between p-4 rounded-xl mb-5"
                  style={{ background: "oklch(27% 0.04 195)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        stripeConfigured ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {stripeConfigured
                          ? "Stripe Connected"
                          : "Stripe Not Configured"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stripeConfigured
                          ? "Payment processing is active."
                          : "Set up payments to enable subscriptions."}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`text-xs border-0 ${
                      stripeConfigured
                        ? "btn-gold"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {stripeConfigured ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </div>
                <StripeConfigDialog />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
