import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Search } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Charity } from "../backend";
import { useCharities } from "../hooks/useQueries";

const CHARITY_IMAGES = [
  "/assets/generated/charity-education.dim_600x400.jpg",
  "/assets/generated/charity-water.dim_600x400.jpg",
  "/assets/generated/charity-health.dim_600x400.jpg",
];

const STATIC_CHARITIES: Charity[] = [
  {
    id: 1n,
    name: "Future Scholars Fund",
    description:
      "Providing quality education to underprivileged children across Sub-Saharan Africa through scholarships, school supplies, and infrastructure development.",
    eventsList: [
      "Annual Golf Day – June 14, 2026",
      "Charity Gala – Sept 5, 2026",
    ],
    featured: true,
  },
  {
    id: 2n,
    name: "Clean Water Initiative",
    description:
      "Building sustainable clean water infrastructure in rural communities, eliminating waterborne disease and improving quality of life for thousands.",
    eventsList: ["Golf Tournament – July 20, 2026"],
    featured: true,
  },
  {
    id: 3n,
    name: "Global Health Alliance",
    description:
      "Delivering critical medical care, vaccinations, and health education to communities with limited access to healthcare services worldwide.",
    eventsList: ["Charity Cup – Aug 10, 2026", "Annual Dinner – Nov 22, 2026"],
    featured: true,
  },
  {
    id: 4n,
    name: "Ocean Conservation Trust",
    description:
      "Protecting marine ecosystems through research, education, and direct conservation action on the world's most threatened ocean regions.",
    eventsList: ["Coastal Golf Day – May 18, 2026"],
    featured: false,
  },
  {
    id: 5n,
    name: "Hunger Relief Network",
    description:
      "Coordinating food distribution and sustainable agriculture programs to combat hunger in conflict-affected and poverty-stricken regions.",
    eventsList: ["Fundraiser Round – Oct 8, 2026"],
    featured: false,
  },
  {
    id: 6n,
    name: "Shelter First",
    description:
      "Providing emergency and transitional housing to displaced families, veterans, and individuals experiencing homelessness in urban areas.",
    eventsList: ["Golf Classic – Apr 30, 2026"],
    featured: false,
  },
];

export default function CharitiesPage() {
  const { data: backendCharities, isLoading } = useCharities();
  const [search, setSearch] = useState("");
  const [filterFeatured, setFilterFeatured] = useState(false);

  const charities =
    backendCharities && backendCharities.length > 0
      ? backendCharities
      : STATIC_CHARITIES;

  const filtered = charities.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchFeatured = !filterFeatured || c.featured;
    return matchSearch && matchFeatured;
  });

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">
            Our Partners
          </p>
          <h1 className="section-title mb-4">CHARITY DIRECTORY</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Every subscription you make contributes to one of these incredible
            organisations. Choose the cause that speaks to your heart.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search charities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
              data-ocid="charities.search_input"
            />
          </div>
          <button
            type="button"
            onClick={() => setFilterFeatured(!filterFeatured)}
            className={`px-5 py-2 rounded-full text-xs tracking-widest uppercase font-medium border transition-colors ${
              filterFeatured
                ? "btn-gold border-transparent"
                : "border-gold text-gold hover:bg-gold/10"
            }`}
            data-ocid="charities.toggle"
          >
            {filterFeatured ? "All Charities" : "Featured Only"}
          </button>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="teal-card rounded-2xl h-80 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-20 text-muted-foreground"
            data-ocid="charities.empty_state"
          >
            <p className="text-lg font-display tracking-widest uppercase mb-2">
              No Charities Found
            </p>
            <p className="text-sm">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {filtered.map((c, i) => (
              <motion.article
                key={c.id.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="teal-card rounded-2xl overflow-hidden group"
                data-ocid={`charities.item.${i + 1}`}
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={CHARITY_IMAGES[i % CHARITY_IMAGES.length]}
                    alt={c.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, oklch(18% 0.04 195 / 0.8) 0%, transparent 50%)",
                    }}
                  />
                  {c.featured && (
                    <Badge className="absolute top-3 left-3 btn-gold text-xs border-0">
                      FEATURED
                    </Badge>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-sm font-semibold tracking-wide mb-2">
                    {c.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                    {c.description}
                  </p>
                  {c.eventsList.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold tracking-widest uppercase text-gold mb-2">
                        Upcoming Events
                      </p>
                      <ul className="space-y-1">
                        {c.eventsList.slice(0, 2).map((ev) => (
                          <li
                            key={ev}
                            className="text-xs text-muted-foreground flex items-center gap-2"
                          >
                            <span className="w-1 h-1 rounded-full bg-gold flex-shrink-0" />
                            {ev}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">
                        Impact Progress
                      </span>
                      <span className="text-gold font-semibold">68%</span>
                    </div>
                    <Progress value={68} className="h-1" />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
