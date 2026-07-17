import perfumeHero from "@/assets/perfume-hero.jpg";
import accessoriesHero from "@/assets/accessories-hero.jpg";
import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";

import n40Charger from "@/assets/tech/n40-charger.jpg";
import c112aAdapter from "@/assets/tech/c112a-adapter.jpg";
import x14Lightning from "@/assets/tech/x14-lightning.jpg";
import ds35Speaker from "@/assets/tech/ds35-speaker.jpg";
import es50Earbuds from "@/assets/tech/es50-earbuds.jpg";
import j95Powerbank from "@/assets/tech/j95-powerbank.jpg";
import y20Smartwatch from "@/assets/tech/y20-smartwatch.jpg";
import beautyHairdryer from "@/assets/tech/beauty-hairdryer.jpg";
import ringLight from "@/assets/tech/ring-light.jpg";

export type Category = "parfum" | "tech";

/** Perfume sub-category slugs powering the perfume sub-navbar + filter pills. */
export type ParfumSubCategory =
  | "for-her"
  | "for-him"
  | "attars"
  | "testers"
  | "new-arrivals"
  | "limited-edition";

/** Tech sub-category slugs powering the tech sub-navbar + filter pills. */
export type TechSubCategory =
  | "chargers"
  | "power-banks"
  | "earphones"
  | "speakers"
  | "smartwatches"
  | "adapters"
  | "lightning-chargers"
  | "wires"
  | "beauty-care"
  | "other-hoco";

export type FragranceNotes = { top: string[]; heart: string[]; base: string[] };
export type TechSpecs = Record<string, string>;
export type Review = { name: string; title: string; rating: number; body: string; date: string };
export type PublishStatus = "published" | "draft";

export type Product = {
  id: string;
  category: Category;
  subCategory?: TechSubCategory | ParfumSubCategory;

  name: string;
  line: string;
  price: number;
  tag: string;
  images: string[];
  short: string;
  description: string;
  notes?: FragranceNotes;
  concentration?: string;
  volumes?: string[];
  perfumer?: string;
  ingredients?: string;
  specs?: TechSpecs;
  compatibility?: string[];
  inTheBox?: string[];
  reviews: Review[];
  rating: number;

  /** Inventory + publish fields (shared catalog / admin panel) */
  stock?: number;
  status?: PublishStatus;
  updatedAt?: string;
  sku?: string;
};

const baseReviews: Review[] = [
  { name: "Aria L.", title: "Editor-in-Chief, NOIR", rating: 5, date: "2 weeks ago", body: "Doesn't announce itself. It lingers like a memory I can't place." },
  { name: "Khaled M.", title: "Architect, Dubai", rating: 5, date: "1 month ago", body: "Restraint elevated to obsession. Sillage is intimate, longevity is endless." },
  { name: "Sofia R.", title: "Verified buyer", rating: 4, date: "3 months ago", body: "Packaging alone is worth keeping. Everything inside is even better." },
];

const techReviews: Review[] = [
  { name: "Marcus D.", title: "Industrial designer", rating: 5, date: "1 week ago", body: "Build quality is absurd. Every detail considered." },
  { name: "Elena V.", title: "Verified buyer", rating: 5, date: "3 weeks ago", body: "Replaced three lesser accessories. Should have bought it first." },
  { name: "Khaled M.", title: "Architect, Dubai", rating: 5, date: "2 months ago", body: "I own three — one for each city." },
];

/** Minimal tech product factory to keep this file lean. */
function tech(
  id: string,
  sub: TechSubCategory,
  name: string,
  line: string,
  price: number,
  tag: string,
  img: string,
  short: string,
  description: string,
  specs: TechSpecs = {},
  compatibility: string[] = ["iPhone", "Android", "USB-C devices"],
  inTheBox: string[] = [name, "USB-C cable", "User manual", "Authenticity card"],
): Product {
  return {
    id, category: "tech", subCategory: sub, name, line, price, tag,
    images: [img, img, img, img],
    short, description,
    specs, compatibility, inTheBox,
    rating: 4.8, reviews: techReviews,
  };
}

export const products: Product[] = [
  // -------- Parfum --------
  {
    id: "oud-imperial", category: "parfum", subCategory: "for-him", name: "Oud Imperial", line: "Maison Noir",
    price: 480, tag: "Iconic", images: [p3, perfumeHero, p1, p2],
    short: "A smoked oud rendered in liquid amber. The signature of the house.",
    description: "Composed over eighteen months in our Grasse atelier, Oud Imperial pairs Laotian oud with smoked papyrus and Damask rose absolute over dry, resinous benzoin.",
    notes: { top: ["Bergamot", "Pink Pepper", "Saffron"], heart: ["Laotian Oud", "Damask Rose", "Smoked Papyrus"], base: ["Benzoin", "Patchouli", "White Musk"] },
    concentration: "Extrait de Perfume 30%", volumes: ["50ml", "100ml", "200ml"],
    perfumer: "Élise Marchand",
    ingredients: "Alcohol Denat., Perfume (Fragrance), Aqua, Limonene, Linalool, Citral, Geraniol, Eugenol, Coumarin.",
    rating: 4.9, reviews: baseReviews,
  },
  {
    id: "velours-dambre", category: "parfum", subCategory: "new-arrivals", name: "Velours d'Ambre", line: "Édition Privée",
    price: 320, tag: "New", images: [p1, p2, p3, perfumeHero],
    short: "Velvet amber, vanilla orchid and a hush of leather.",
    description: "Mandarin and pink berry open, vanilla orchid and tonka settle, amber suede and white sandalwood close.",
    notes: { top: ["Mandarin", "Pink Berry", "Cardamom"], heart: ["Vanilla Orchid", "Tonka Bean", "Iris"], base: ["Amber", "Suede", "White Sandalwood"] },
    concentration: "Eau de Perfume 22%", volumes: ["50ml", "100ml"],
    perfumer: "Henri Vasseur", ingredients: "Alcohol Denat., Perfume, Aqua, Linalool, Coumarin, Benzyl Salicylate.",
    rating: 4.8, reviews: baseReviews,
  },
  {
    id: "nuit-cristalline", category: "parfum", subCategory: "limited-edition", name: "Nuit Cristalline", line: "Haute Perfumery",
    price: 540, tag: "Limited", images: [p2, p1, p3, perfumeHero],
    short: "Cold iris, frozen violet, a single drop of incense.",
    description: "Limited edition of 1200 numbered flacons built around cold iris, dewed violet and Somalian incense.",
    notes: { top: ["Aldehydes", "Violet Leaf", "Bergamot"], heart: ["Iris Pallida", "Orris Butter", "Damascena Rose"], base: ["Somalian Incense", "Cashmeran", "Vetiver"] },
    concentration: "Extrait de Perfume 28%", volumes: ["75ml"],
    perfumer: "Élise Marchand", ingredients: "Alcohol Denat., Perfume, Aqua, Limonene, Linalool, Eugenol.",
    rating: 5.0, reviews: baseReviews,
  },
  {
    id: "rose-obscure", category: "parfum", subCategory: "for-her", name: "Rose Obscure", line: "Maison Noir",
    price: 290, tag: "Bestseller", images: [p1, p3, p2, perfumeHero],
    short: "Black rose, blood orange and a smoked vanilla base.",
    description: "Blood orange and pink pepper open onto smoked Turkish rose, settled in dark vanilla and oud wood.",
    notes: { top: ["Blood Orange", "Pink Pepper", "Cassis"], heart: ["Turkish Rose", "Smoked Tea", "Saffron"], base: ["Dark Vanilla", "Oud Wood", "Tonka"] },
    concentration: "Eau de Perfume 20%", volumes: ["50ml", "100ml"],
    perfumer: "Henri Vasseur", ingredients: "Alcohol Denat., Perfume, Aqua, Citral, Geraniol, Coumarin.",
    rating: 4.7, reviews: baseReviews,
  },
  {
    id: "attar-al-noor", category: "parfum", subCategory: "attars", name: "Attar Al Noor", line: "Attars Rares",
    price: 220, tag: "Attar", images: [p2, p3, p1, perfumeHero],
    short: "Pure oil attar of white oud, saffron and Taif rose.",
    description: "A traditional alcohol-free attar aged in sandalwood casks. Warm, resinous and intimate on the skin.",
    notes: { top: ["Saffron", "Cardamom"], heart: ["Taif Rose", "White Oud"], base: ["Sandalwood", "Amber"] },
    concentration: "Pure Attar Oil 100%", volumes: ["6ml", "12ml"],
    perfumer: "Élise Marchand", ingredients: "Perfume Oil (Sandalwood base), Natural Isolates.",
    rating: 4.9, reviews: baseReviews,
  },
  {
    id: "attar-oud-royal", category: "parfum", subCategory: "attars", name: "Oud Royal Attar", line: "Attars Rares",
    price: 260, tag: "Attar", images: [p3, p2, p1, perfumeHero],
    short: "Aged Hindi oud attar with musk and amber.",
    description: "Aged Hindi oud pressed into a sandalwood carrier oil — dense, animalic and long-wearing.",
    notes: { top: ["Cinnamon"], heart: ["Hindi Oud", "Rose"], base: ["Musk", "Amber", "Sandalwood"] },
    concentration: "Pure Attar Oil 100%", volumes: ["6ml", "12ml"],
    perfumer: "Henri Vasseur", ingredients: "Perfume Oil (Sandalwood base), Natural Isolates.",
    rating: 4.9, reviews: baseReviews,
  },
  {
    id: "discovery-tester-set", category: "parfum", subCategory: "testers", name: "Discovery Tester Set", line: "Testers",
    price: 60, tag: "Tester", images: [p1, p2, p3, perfumeHero],
    short: "Six 2ml testers to explore the maison.",
    description: "Sample vials of six signature extraits presented in a linen-wrapped box — the ideal introduction to the house.",
    concentration: "Assorted Extraits", volumes: ["6 × 2ml"],
    perfumer: "Assorted", ingredients: "See individual formulas.",
    rating: 4.8, reviews: baseReviews,
  },
  {
    id: "monsieur-bois-tester", category: "parfum", subCategory: "testers", name: "Monsieur Bois Tester", line: "Testers",
    price: 25, tag: "Tester", images: [p3, p1, p2, perfumeHero],
    short: "A 5ml travel tester of our woody signature.",
    description: "A travel-format tester of the Monsieur Bois extrait — cedar, vetiver and smoked leather.",
    concentration: "Extrait de Perfume 25%", volumes: ["5ml"],
    perfumer: "Henri Vasseur", ingredients: "Alcohol Denat., Perfume, Aqua, Coumarin.",
    rating: 4.7, reviews: baseReviews,
  },
  {
    id: "aurora-fleur", category: "parfum", subCategory: "for-her", name: "Aurora Fleur", line: "Édition Florale",
    price: 260, tag: "New", images: [p2, p1, p3, perfumeHero],
    short: "Peony, lychee and white musk — luminous and modern.",
    description: "A luminous floral for daylight — dewy peony, ripe lychee and airy white musk.",
    notes: { top: ["Lychee", "Bergamot"], heart: ["Peony", "Magnolia", "Freesia"], base: ["White Musk", "Cedar"] },
    concentration: "Eau de Perfume 20%", volumes: ["50ml", "100ml"],
    perfumer: "Élise Marchand", ingredients: "Alcohol Denat., Perfume, Aqua, Linalool, Citronellol.",
    rating: 4.8, reviews: baseReviews,
  },
  {
    id: "monsieur-bois", category: "parfum", subCategory: "for-him", name: "Monsieur Bois", line: "Maison Noir",
    price: 340, tag: "Bestseller", images: [p3, p1, p2, perfumeHero],
    short: "Cedar, vetiver and smoked leather — a woody signature.",
    description: "A masculine woody built on Virginia cedar, Haitian vetiver and smoked leather accord.",
    notes: { top: ["Grapefruit", "Black Pepper"], heart: ["Virginia Cedar", "Haitian Vetiver"], base: ["Smoked Leather", "Amber", "Musk"] },
    concentration: "Extrait de Perfume 25%", volumes: ["50ml", "100ml"],
    perfumer: "Henri Vasseur", ingredients: "Alcohol Denat., Perfume, Aqua, Coumarin, Eugenol.",
    rating: 4.8, reviews: baseReviews,
  },


  // -------- Tech / HOCO --------
  tech("hc36-speaker", "speakers", "HC36 Brocade BT Speaker", "Audio", 79, "New", ds35Speaker,
    "Hand-tuned 360° wireless speaker with brocade fabric grille.",
    "Premium HOCO bluetooth speaker featuring rich 360° audio, 12-hour battery and elegant fabric-wrapped chassis.",
    { Driver: "10W full-range", Battery: "12h", Bluetooth: "5.3", Range: "10m" }),

  tech("hw28-car-holder", "other-hoco", "HW28 Wireless Car Holder", "Car", 59, "Bestseller", accessoriesHero,
    "Auto-clamping wireless charging car mount.",
    "Smart auto-clamp car holder with 15W magnetic wireless charging.",
    { Output: "15W Qi", Mount: "Air vent + dashboard" }),

  tech("k23-gimbal", "other-hoco", "K23 Auto Face Tracking Gimbal", "Camera", 89, "Flagship", ringLight,
    "AI face-tracking smartphone gimbal.",
    "3-axis stabilizer with auto face/object tracking, foldable design.",
    { Axes: "3", Battery: "8h", Tracking: "AI face + object" }),

  tech("q48-powerbank", "power-banks", "Q48 Magnetic Power Bank 10000mAh", "Power", 69, "New", j95Powerbank,
    "MagSafe-compatible 10000mAh magnetic power bank.",
    "Magnetic wireless 15W charging with fast PD 20W wired output.",
    { Capacity: "10000mAh", Wireless: "15W", Wired: "PD 20W" }),

  tech("m115-earphones", "earphones", "M115 Lightning Earphones", "Audio", 19, "Essential", es50Earbuds,
    "Plug-and-play lightning earphones with HiFi audio.",
    "High-resolution lightning earphones with in-line mic and remote.",
    { Driver: "10mm dynamic", Connector: "Lightning" }),

  tech("ph31-stand", "other-hoco", "PH31 Universal Lazy Stand", "Mounts", 29, "Popular", accessoriesHero,
    "Aluminum desk stand for phones & tablets.",
    "Adjustable angle stand machined from aluminum with anti-slip silicone pads.",
    { Material: "Aluminum", Compatibility: "4\"–13\" devices" }),

  tech("z54b-charger", "chargers", "Z54B PD60W Car Charger", "Car", 39, "Fast Charge", n40Charger,
    "PD 60W dual-port fast car charger.",
    "Type-C PD 60W + USB-A QC 30W, all-metal body, LED indicator.",
    { Output: "PD 60W + QC 30W", Ports: "USB-C + USB-A" }),

  tech("k26-gimbal", "other-hoco", "K26 Smart Camera Gimbal", "Camera", 79, "Limited", ringLight,
    "Compact gimbal with smart AI modes.",
    "Foldable 3-axis gimbal with gesture control and smart shooting modes.",
    { Axes: "3", Battery: "10h" }),

  tech("x109-cable", "wires", "X109 Braided Type-C Cable", "Wires", 15, "New", x14Lightning,
    "1m braided fast-charge Type-C cable.",
    "Nylon braided cable rated for 100W PD charging and 480Mbps data.",
    { Length: "1m", Output: "100W PD" }),

  tech("n40-charger", "chargers", "N40 Dual USB Wall Charger", "Chargers", 29, "New", n40Charger,
    "Compact dual-USB wall charger.",
    "Two USB-A ports with smart current distribution up to 2.4A per port.",
    { Output: "2 × 2.4A", Ports: "Dual USB-A" }),

  tech("c112a-adapter", "adapters", "C112A USB Travel Adapter", "Adapters", 35, "Travel", c112aAdapter,
    "Universal travel adapter with USB-A and USB-C.",
    "Worldwide compatible adapter with built-in PD 20W USB-C and USB-A ports.",
    { Plugs: "EU/UK/US/AU", Output: "20W USB-C + 12W USB-A" }),

  tech("x14-lightning", "lightning-chargers", "X14 Lightning Fast Cable", "Lightning Chargers", 18, "Essential", x14Lightning,
    "1m fast-charging lightning cable.",
    "Premium braided lightning cable supporting 2.4A fast charging for iPhone & iPad.",
    { Length: "1m", Output: "2.4A" }),

  tech("ds35-speaker", "speakers", "DS35 Bluetooth Tower Speaker", "Audio", 99, "Featured", ds35Speaker,
    "Cylindrical tower speaker with light blue ambient ring.",
    "Premium 20W stereo speaker with ambient LED ring and 16-hour playtime.",
    { Power: "20W stereo", Battery: "16h", Bluetooth: "5.3" }),

  tech("es50-earbuds", "earphones", "ES50 True Wireless Earbuds", "Audio", 79, "Wireless", es50Earbuds,
    "Compact TWS earbuds with charging case.",
    "Ergonomic in-ear TWS buds with active noise reduction and 30-hour total playtime.",
    { Battery: "6h buds · 30h case", Bluetooth: "5.3", ANC: "Yes" }),

  tech("j95-powerbank", "power-banks", "J95 20000mAh Power Bank", "Power", 89, "High Capacity", j95Powerbank,
    "20000mAh PD power bank for long journeys.",
    "High-capacity power bank with USB-C PD 22.5W bi-directional charging.",
    { Capacity: "20000mAh", Output: "PD 22.5W" }),

  tech("y20-smartwatch", "smartwatches", "Y20 Smartwatch", "Wearables", 129, "New", y20Smartwatch,
    "Modern fitness smartwatch with silver case.",
    "Round AMOLED smartwatch with heart rate, SpO2 and 7-day battery life.",
    { Display: "1.43\" AMOLED", Battery: "7 days", Sensors: "HR / SpO2 / Sleep" }),

  tech("beauty-hairdryer", "beauty-care", "Hoco Beauty Hair Dryer", "Beauty Care", 149, "Beauty Care", beautyHairdryer,
    "Ionic salon-grade hair dryer with rose-gold accents.",
    "Negative-ion fast-dry hair dryer with three heat settings and cool shot.",
    { Power: "1800W", Modes: "3 heat / 2 speed", Tech: "Negative ion" }),

  tech("ring-light", "other-hoco", "Hoco Selfie Ring Light", "Beauty Care", 25, "Creator", ringLight,
    "Clip-on selfie ring light with three color modes.",
    "Phone-mount ring light with warm, cool and natural modes for content creation.",
    { Modes: "3 color temperatures", Mount: "Universal clip" }),
];

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function getRelated(p: Product, n = 3) {
  return products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, n);
}

export function productsByCategory(c: Category) {
  return products.filter((p) => p.category === c);
}
