// ═══════════════════════════════════════════════════════════════
// DYNAMIC INDUSTRY CONFIGURATION SYSTEM
// ═══════════════════════════════════════════════════════════════
// Defines color palettes, promotional banners, feature items,
// and FAQ items for every industry storefront.
// ═══════════════════════════════════════════════════════════════

export interface IndustryFeature {
  icon: string;
  title: string;
  desc: string;
}

export interface IndustryFAQ {
  q: string;
  a: string;
}

export interface IndustryConfig {
  id: string;
  name: string;
  primaryColor: string;
  primaryRgb: string;
  accentColor: string;
  bgDark: string;
  bgLight: string;
  surfaceDark: string;
  surfaceLight: string;
  textDark: string;
  textLight: string;
  promoTitle: string;
  promoSubtitle: string;
  promoBadge: string;
  promoCode: string;
  tagline: string;
  mascotName?: string;
  mascotIcon?: string;
  mascotTitle?: string;
  features: IndustryFeature[];
  faqs: IndustryFAQ[];
}

// ─── 14 Core Industry Configs ─────────────────────────────────

export const INDUSTRY_CONFIGS: Record<string, IndustryConfig> = {
  automotive: {
    id: "automotive",
    name: "Automotive & Tuning",
    primaryColor: "#D62828",
    primaryRgb: "214, 40, 40",
    accentColor: "#F77F00",
    bgDark: "#0B0C10",
    bgLight: "#FFF7F5",
    surfaceDark: "#15171E",
    surfaceLight: "#FFFFFF",
    textDark: "#F1F5F9",
    textLight: "#1E293B",
    promoTitle: "FREE ENGINE DIAGNOSIS + 20% OFF BRAKE SERVICE",
    promoSubtitle: "Book any maintenance package this week and receive a complimentary 50-point safety inspection.",
    promoBadge: "LIMITED TIME CAMPAIGN",
    promoCode: "AUTO2026",
    tagline: "PERFORMANCE ACCESSORIES & CERTIFIED TUNING",
    mascotName: "Axel",
    mascotIcon: "👨‍🔧",
    mascotTitle: "Master Mechanic",
    features: [
      { icon: "🔧", title: "Certified Mechanics", desc: "ASE-certified technicians operating with precision digital diagnostics." },
      { icon: "🛡️", title: "Genuine OEM Parts", desc: "100% factory-authentic components backed by official manufacturer warranties." },
      { icon: "⚡", title: "Express Delivery", desc: "Same-day dispatched parts with real-time GPS courier tracking." },
      { icon: "🔒", title: "2-Year Warranty", desc: "Comprehensive warranty on all structural repairs and electrical components." },
      { icon: "💳", title: "0% Interest EMI", desc: "Flexible monthly payment options available on major banking partners." },
      { icon: "🎧", title: "24/7 Service Support", desc: "Round-the-clock emergency roadside breakdown assistance hotline." },
    ],
    faqs: [
      { q: "Are all spare parts sold on this store authentic OEM?", a: "Yes, 100% of our replacement parts and accessories are sourced directly from certified original manufacturers with factory serial verification." },
      { q: "How long does standard delivery take for mechanical parts?", a: "Metro orders are delivered within 24 hours. Regional shipments typically take 2-3 business days with express tracking." },
      { q: "Can I book a service appointment online?", a: "Absolutenly! Choose your required service, pick an available time slot on checkout, and our advisor will confirm your arrival." },
      { q: "Do you offer warranty coverage on installed parts?", a: "All mechanical items come with a standard 12 to 24-month manufacturer replacement warranty." },
    ],
  },

  electronics: {
    id: "electronics",
    name: "Electronics & Tech",
    primaryColor: "#0077B6",
    primaryRgb: "0, 119, 182",
    accentColor: "#00B4D8",
    bgDark: "#0A1118",
    bgLight: "#F0F8FF",
    surfaceDark: "#121E2B",
    surfaceLight: "#FFFFFF",
    textDark: "#E0F2FE",
    textLight: "#0F172A",
    promoTitle: "TECH EXCHANGE — UP TO $300 OFF ON OLD GADGETS",
    promoSubtitle: "Trade in your previous display monitor or accessories for instant discount credits.",
    promoBadge: "MEGA TECH SALE",
    promoCode: "TECHUP300",
    tagline: "NEXT-GEN HARDWARE & SMART DIGITAL GEAR",
    mascotName: "Chip",
    mascotIcon: "🤖",
    mascotTitle: "Tech AI Assistant",
    features: [
      { icon: "📱", title: "Original Brand Gear", desc: "Directly authorized retailer for leading global electronics brands." },
      { icon: "🛡️", title: "Extended Warranty", desc: "Up to 3 years total replacement protection against accidental damage." },
      { icon: "🚀", title: "Ultra Fast Shipping", desc: "Priority air express courier with insured transit protection." },
      { icon: "💳", title: "Instant 0% EMI", desc: "Pay in up to 12 interest-free installments with instant approval." },
      { icon: "🔄", title: "14-Day Easy Return", desc: "Hassle-free 100% refund policy if unopened or defective." },
      { icon: "💬", title: "Tech Assistant Live", desc: "Our hardware engineers are available live to guide your setup." },
    ],
    faqs: [
      { q: "Does the monitor include international manufacturer warranty?", a: "Yes, all our high-tech monitors and laptops include international official manufacturer warranty cards." },
      { q: "What happens if a product arrives damaged in transit?", a: "All shipments are fully insured. We dispatch a free replacement within 24 hours of receiving damaged delivery proof." },
      { q: "Do you offer bulk enterprise pricing?", a: "Yes, contact our corporate tech advisor for custom volume discounts on office automation gear." },
      { q: "Are power adapters compatible with local standards?", a: "Every device is shipped with regional certified plug adapters and multi-voltage (100-240V) support." },
    ],
  },

  healthcare: {
    id: "healthcare",
    name: "Healthcare & Wellness",
    primaryColor: "#0FA3B1",
    primaryRgb: "15, 163, 177",
    accentColor: "#ED6A5A",
    bgDark: "#091416",
    bgLight: "#F4FAFA",
    surfaceDark: "#112428",
    surfaceLight: "#FFFFFF",
    textDark: "#E6F8F9",
    textLight: "#132E35",
    promoTitle: "FREE HEALTH CONSULTATION & WELLNESS CHECKUP",
    promoSubtitle: "Schedule a tele-health consultation with a licensed specialist with any diagnostic equipment purchase.",
    promoBadge: "WELLNESS INITIATIVE",
    promoCode: "HEALTHFREE",
    tagline: "CLINICAL GRADE EQUIPMENT & WELLNESS CARE",
    mascotName: "Dr. Clara",
    mascotIcon: "🩺",
    mascotTitle: "Medical Wellness Specialist",
    features: [
      { icon: "🩺", title: "Clinical Grade", desc: "FDA & CE certified medical devices tested for hospital-grade precision." },
      { icon: "👨‍⚕️", title: "Licensed Doctors", desc: "Consult directly with experienced medical practitioners online." },
      { icon: "📦", title: "Discreet Packaging", desc: "All personal healthcare supplies shipped in sealed neutral boxes." },
      { icon: "⚡", title: "24-Hour Express", desc: "Urgent medical supplies dispatched with priority courier dispatch." },
      { icon: "🛡️", title: "Sterilized Standard", desc: "Strict hygiene protocols maintained across all fulfillment facilities." },
      { icon: "📋", title: "Insurance Claim", desc: "Receive itemized medical invoices for easy health insurance reimbursement." },
    ],
    faqs: [
      { q: "Are home diagnostic devices calibrated accurately?", a: "Yes, all clinical equipment is pre-calibrated according to ISO 13485 medical device standards." },
      { q: "How do I claim health insurance for purchases?", a: "We provide an official tax invoice with product medical codes suitable for insurance submission." },
      { q: "Can I consult a doctor before purchasing equipment?", a: "Yes! Click on Speak with Advisor to start a live chat with our medical staff." },
      { q: "What is the shelf life of wellness supplements?", a: "All health products guaranteed minimum 18-month unexpired shelf life upon delivery." },
    ],
  },

  "food-beverages": {
    id: "food-beverages",
    name: "Food & Gourmet",
    primaryColor: "#2D6A4F",
    primaryRgb: "45, 106, 79",
    accentColor: "#DDA15E",
    bgDark: "#0B1510",
    bgLight: "#F5FAF7",
    surfaceDark: "#14261D",
    surfaceLight: "#FFFFFF",
    textDark: "#ECFDF5",
    textLight: "#143823",
    promoTitle: "BUY 2 GET 1 FREE ON ALL ORGANIC BLENDS",
    promoSubtitle: "Enjoy artisanal single-origin coffees and gourmet snacks fresh from our roastery.",
    promoBadge: "FRESH HARVEST",
    promoCode: "FRESHORGANIC",
    tagline: "ARTISANAL INGREDIENTS & GOURMET SPECIALTIES",
    mascotName: "Chef Oliver",
    mascotIcon: "👨‍🍳",
    mascotTitle: "Master Barista & Baker",
    features: [
      { icon: "🌱", title: "100% Organic", desc: "Ethically grown without artificial pesticides or synthetic chemicals." },
      { icon: "☕", title: "Freshly Roasted", desc: "Coffee beans roasted weekly in small batches to preserve dark chocolate aroma." },
      { icon: "❄️", title: "Cold-Chain Logistics", desc: "Temperature-controlled refrigerated delivery to guarantee peak freshness." },
      { icon: "🏆", title: "Award Winning", desc: "Recognized by international culinary tasting panels for supreme flavor." },
      { icon: "♻️", title: "Eco Packaging", desc: "Compostable bags and recyclable containers used across all products." },
      { icon: "👩‍🍳", title: "Chef Approved", desc: "Curated and recommended by top master chefs and baristas." },
    ],
    faqs: [
      { q: "When were these coffee beans roasted?", a: "All coffee bags state the roast date on the valve seal; we never ship beans older than 7 days from roasting." },
      { q: "How is fresh food packaged for transit?", a: "We utilize insulated eco-coolers with gel packs ensuring safe temperature control during 48-hour transit." },
      { q: "Are products certified organic?", a: "Yes, certified by international organic agriculture bodies with full traceability to small farm cooperatives." },
      { q: "Do you offer wholesale cafe supply?", a: "Yes! Contact our gourmet supply division for bulk roastery pricing and espresso gear." },
    ],
  },

  construction: {
    id: "construction",
    name: "Construction & Industrial",
    primaryColor: "#D97706",
    primaryRgb: "217, 119, 6",
    accentColor: "#B45309",
    bgDark: "#13100B",
    bgLight: "#FFFDF5",
    surfaceDark: "#201B12",
    surfaceLight: "#FFFFFF",
    textDark: "#FEF3C7",
    textLight: "#451A03",
    promoTitle: "BULK ORDER SPECIAL — 15% OFF CEMENT & STEEL",
    promoSubtitle: "Heavy machinery and structural building materials supplied directly to project sites.",
    promoBadge: "BUILDER CONTRACT",
    promoCode: "BUILD2026",
    tagline: "HEAVY MACHINERY & CERTIFIED BUILDING MATERIALS",
    mascotName: "Mason",
    mascotIcon: "👷",
    mascotTitle: "Site Chief Engineer",
    features: [
      { icon: "🏗️", title: "Site Delivery", desc: "Direct flatbed crane truck delivery straight to your construction site." },
      { icon: "🧱", title: "IS/ISO Certified", desc: "All structural steel, cement, and fasteners meet international safety ratings." },
      { icon: "👷", title: "Site Engineers", desc: "On-staff civil engineers available to calculate material requirements." },
      { icon: "📦", title: "Bulk Wholesale", desc: "Tiered volume discounts for commercial real estate developers." },
      { icon: "⚡", title: "Emergency Supply", desc: "Same-day dispatch for critical site inventory shortage emergencies." },
      { icon: "📄", title: "Lab Certificates", desc: "Tensile strength and chemical analysis lab test reports included." },
    ],
    faqs: [
      { q: "Can you deliver heavy materials directly onto scaffolding or upper floors?", a: "Yes, our boom crane delivery trucks can lift palletized materials up to 4 stories high." },
      { q: "Do fasteners come with material test certificates?", a: "All Grade 316 Stainless Steel bolts include mill test certificates (MTC) adhering to ISO standards." },
      { q: "What is the minimum quantity for site delivery?", a: "We handle orders from individual boxes up to full trailer loads of 30 metric tons." },
      { q: "Do you offer credit terms for contractor accounts?", a: "Qualified construction firms can apply for 30-day revolving credit facilities." },
    ],
  },

  restaurants: {
    id: "restaurants",
    name: "Restaurants & Dining",
    primaryColor: "#C9184A",
    primaryRgb: "201, 24, 74",
    accentColor: "#FF758F",
    bgDark: "#150A0C",
    bgLight: "#FFF5F7",
    surfaceDark: "#221114",
    surfaceLight: "#FFFFFF",
    textDark: "#FFE4E6",
    textLight: "#4C0519",
    promoTitle: "WEEKEND FAMILY COMBO — 25% OFF CHEF SPECIALS",
    promoSubtitle: "Savor wood-fired pizzas, gourmet burgers, and authentic curries delivered hot.",
    promoBadge: "HOT CHEF SPECIAL",
    promoCode: "TASTE25",
    tagline: "AUTHENTIC RECIPES & EXPRESS TABLE DELIVERY",
    features: [
      { icon: "🔥", title: "Piping Hot Delivery", desc: "Thermal heat bags ensure food arrives at oven-fresh temperature." },
      { icon: "👨‍🍳", title: "Master Chefs", desc: "Crafted by award-winning culinary team using fresh local produce." },
      { icon: "🥗", title: "Custom Dietary", desc: "Vegan, gluten-free, and keto options clearly marked across menu." },
      { icon: "⏱️", title: "30-Min Guarantee", desc: "Guaranteed quick delivery within 30 minutes or receive store credits." },
      { icon: "🧼", title: "5-Star Kitchen", desc: "Hygienically prepared in ISO-certified clean kitchen environment." },
      { icon: "🍷", title: "Pairing Advice", desc: "Expert beverage pairing recommendations for every main course." },
    ],
    faqs: [
      { q: "How is the food kept warm during delivery?", a: "We use insulated thermal bags equipped with active heating pads to maintain exact temperature." },
      { q: "Can I customize ingredients for allergies?", a: "Yes, add special dietary instructions at checkout; our kitchen handles allergies with isolated cookware." },
      { q: "Do you cater for private corporate events?", a: "We provide full-service catering menus for events ranging from 10 to 500 guests." },
      { q: "Is table reservation available online?", a: "Yes! Use our instant booking tab to select your table and pre-order meals." },
    ],
  },

  retail: {
    id: "retail",
    name: "Retail & General Store",
    primaryColor: "#EA580C",
    primaryRgb: "234, 88, 12",
    accentColor: "#F97316",
    bgDark: "#140D08",
    bgLight: "#FFF8F5",
    surfaceDark: "#231710",
    surfaceLight: "#FFFFFF",
    textDark: "#FFEDD5",
    textLight: "#431407",
    promoTitle: "FREE SHIPPING ON ALL ORDERS ABOVE $50",
    promoSubtitle: "Discover thousands of everyday household essentials, gifts, and lifestyle items.",
    promoBadge: "EVERYDAY VALUE",
    promoCode: "FREESHIP50",
    tagline: "EVERYDAY ESSENTIALS & PREMIUM GIFTS",
    features: [
      { icon: "🛍️", title: "Vast Selection", desc: "Thousands of verified lifestyle products under one curated roof." },
      { icon: "🚚", title: "Free Express Shipping", desc: "Free 2-day delivery on all qualifying retail cart orders." },
      { icon: "🎁", title: "Gift Wrapping", desc: "Complimentary luxury gift box packaging with custom greeting notes." },
      { icon: "⭐", title: "Price Match", desc: "We match any official retail competitor's lower price instantly." },
      { icon: "🔄", title: "30-Day Returns", desc: "No questions asked easy 30-day money-back guarantee." },
      { icon: "💎", title: "Reward Points", desc: "Earn 5% cashback store credits on every completed order." },
    ],
    faqs: [
      { q: "What is your return policy for general retail goods?", a: "Return any unused item in its original box within 30 days for a full refund or exchange." },
      { q: "Do you ship internationally?", a: "Yes, we ship to over 120 countries worldwide with duties prepaid options at checkout." },
      { q: "How do I redeem my loyalty points?", a: "Your points balance appears automatically during cart checkout to discount your total." },
      { q: "Can I request custom gift wrapping?", a: "Yes! Check the 'Add Gift Wrapping' option on the cart page for custom ribbons and cards." },
    ],
  },

  hospitality: {
    id: "hospitality",
    name: "Hospitality & Hotels",
    primaryColor: "#B45309",
    primaryRgb: "180, 83, 9",
    accentColor: "#D97706",
    bgDark: "#130F0A",
    bgLight: "#FFFCF5",
    surfaceDark: "#211A12",
    surfaceLight: "#FFFFFF",
    textDark: "#FEF3C7",
    textLight: "#451A03",
    promoTitle: "COMPLIMENTARY ROOM UPGRADE & SPA VOUCHER",
    promoSubtitle: "Book luxury suites directly to receive breakfast, airport transfer, and spa privileges.",
    promoBadge: "LUXURY RETREAT",
    promoCode: "VIPSTAY",
    tagline: "WORLD-CLASS SUITES & CONCIERGE HOSPITALITY",
    features: [
      { icon: "🛎️", title: "24/7 Concierge", desc: "Personal butler and guest services on call day and night." },
      { icon: "🥐", title: "Free Breakfast", desc: "Gourmet buffet breakfast included with all direct suite bookings." },
      { icon: "🚗", title: "Airport Pickup", desc: "Chauffeur-driven luxury sedan transfer to and from the airport." },
      { icon: "🏊", title: "Infinity Pool", desc: "Access to rooftop heated infinity pool and wellness spa facility." },
      { icon: "📶", title: "Ultra High-Speed Wi-Fi", desc: "Dedicated gigabit fiber connection in every suite and lounge." },
      { icon: "🔑", title: "Keyless Mobile Entry", desc: "Check-in online and unlock your suite directly with your phone." },
    ],
    faqs: [
      { q: "What time is standard check-in and check-out?", a: "Standard check-in is 2:00 PM and check-out is 12:00 PM. VIP direct bookings receive free late check-out till 3:00 PM." },
      { q: "Is airport shuttle service included?", a: "Complimentary luxury chauffeur pickup is included for all executive suites." },
      { q: "Can I cancel or modify my reservation without penalty?", a: "Free cancellation up to 24 hours prior to arrival on all flexible rate bookings." },
      { q: "Are pets allowed in the suites?", a: "We offer dedicated pet-friendly suites with luxury beds and gourmet pet menus." },
    ],
  },

  fashion: {
    id: "fashion",
    name: "Fashion & Lifestyle",
    primaryColor: "#9333EA",
    primaryRgb: "147, 51, 234",
    accentColor: "#C084FC",
    bgDark: "#120A1A",
    bgLight: "#FAF5FF",
    surfaceDark: "#1F122B",
    surfaceLight: "#FFFFFF",
    textDark: "#F3E8FF",
    textLight: "#3B0764",
    promoTitle: "NEW SEASON ARRIVALS — 30% OFF BOUTIQUE COLLECTION",
    promoSubtitle: "Discover runway-inspired designer dresses, footwear, and luxury accessories.",
    promoBadge: "RUNWAY COLLECTION",
    promoCode: "FASHION30",
    tagline: "HIGH-STREET STYLES & LUXURY APPAREL",
    features: [
      { icon: "🧵", title: "Designer Tailoring", desc: "Hand-crafted garments stitched from premium organic silk, linen, and wool." },
      { icon: "👗", title: "Virtual Fitting", desc: "Interactive AI size advisor ensures flawless fit recommendation." },
      { icon: "🚚", title: "Express Garment Delivery", desc: "Delivered on protective wooden hangers inside eco garment bags." },
      { icon: "✨", title: "Limited Edition", desc: "Exclusive small-batch capsule drops unavailable in mass stores." },
      { icon: "🔄", title: "Free Size Exchange", desc: "Free pickup and instant size swap if your garment needs fitting adjust." },
      { icon: "💬", title: "Personal Stylist", desc: "Book a 1-on-1 virtual consultation with our fashion editorial team." },
    ],
    faqs: [
      { q: "How do I choose the correct garment size?", a: "Use our interactive Size Advisor tab on any item or check the detailed measurements table." },
      { q: "What fabrics are used in your boutique collection?", a: "We prioritize 100% natural organic cotton, mulberry silk, and sustainable merino wool." },
      { q: "Is fitting exchange free of cost?", a: "Yes! If a size doesn't fit perfectly, we dispatch your exchange free within 48 hours." },
      { q: "Where are these clothes manufactured?", a: "Our garments are ethically crafted in small certified European and artisan workshops." },
    ],
  },

  pharmaceutical: {
    id: "pharmaceutical",
    name: "Pharmaceutical & Care",
    primaryColor: "#0284C7",
    primaryRgb: "2, 132, 199",
    accentColor: "#38BDF8",
    bgDark: "#08131A",
    bgLight: "#F0F9FF",
    surfaceDark: "#10202B",
    surfaceLight: "#FFFFFF",
    textDark: "#E0F2FE",
    textLight: "#0C4A6E",
    promoTitle: "EXPRESS RX PRESCRIPTION DISPATCH IN UNDER 2 HOURS",
    promoSubtitle: "Upload your prescription or consult our licensed pharmacists for instant medicine delivery.",
    promoBadge: "PHARMACY DIRECT",
    promoCode: "RXEXPRESS",
    tagline: "CERTIFIED MEDICINES & PHARMACEUTICAL CARE",
    features: [
      { icon: "💊", title: "Licensed Pharmacy", desc: "100% verified genuine pharmaceutical drugs from licensed distributors." },
      { icon: "📋", title: "Rx Prescription Upload", desc: "Snap a photo of your doctor note for quick pharmacist validation." },
      { icon: "❄️", title: "Cold Storage Rx", desc: "Insulins and vaccines shipped in cold thermal temperature controls." },
      { icon: "⏰", title: "Refill Reminders", desc: "Automated monthly refill service so you never run out of vital meds." },
      { icon: "👨‍⚕️", title: "Pharmacist Chat", desc: "Free live drug interaction & dosage guidance with a registered pharmacist." },
      { icon: "🔒", title: "Tamper Proof", desc: "All medicine bottles sealed with tamper-evident safety seals." },
    ],
    faqs: [
      { q: "How do I submit my prescription?", a: "Simply upload a picture during checkout or email it to our pharmacy team." },
      { q: "Are cold-chain medicines safe during summer transit?", a: "Yes, all temperature-sensitive Rx items are packed in medical insulated coolers with gel packs." },
      { q: "Can I speak to a pharmacist about side effects?", a: "Yes, our licensed pharmacists are available 24/7 via phone or instant web chat." },
      { q: "Do you supply OTC wellness vitamins?", a: "Yes, we stock complete ranges of certified vitamins, first aid supplies, and skincare." },
    ],
  },

  opticals: {
    id: "opticals",
    name: "Opticals & Eyewear",
    primaryColor: "#0D9488",
    primaryRgb: "13, 148, 136",
    accentColor: "#2DD4BF",
    bgDark: "#081414",
    bgLight: "#F0FDF4",
    surfaceDark: "#102222",
    surfaceLight: "#FFFFFF",
    textDark: "#CCFBF1",
    textLight: "#134E4A",
    promoTitle: "BUY 1 FRAME GET 50% OFF SECOND PAIR",
    promoSubtitle: "Premium titanium frames, prescription anti-glare lenses, and polarized sunglasses.",
    promoBadge: "EYEWEAR OFFER",
    promoCode: "VISION50",
    tagline: "PRECISION LENSES & DESIGNER FRAMES",
    features: [
      { icon: "👓", title: "Anti-Glare Lenses", desc: "Multi-layer anti-reflective and blue-light filter coatings included free." },
      { icon: "🔬", title: "Digital Prescription", desc: "Custom robotic lens cutting matching your exact cylindrical vision power." },
      { icon: "🕶️", title: "Polarized UV400", desc: "100% UV radiation protection across all designer sunwear frames." },
      { icon: "🛡️", title: "Scratch Resistance", desc: "Hard diamond-coat protective barrier against accidental scratches." },
      { icon: "🏠", title: "Home Try-On", desc: "Order 4 frames to test at home for 5 days before deciding." },
      { icon: "👨‍⚕️", title: "Optician Certified", desc: "Verified pupil distance (PD) calibration by certified opticians." },
    ],
    faqs: [
      { q: "How do I enter my eye prescription?", a: "You can enter your SPH, CYL, and AXIS values manually or attach your prescription photo." },
      { q: "Do frames include hard protective cases?", a: "Every pair of glasses ships with an authentic hardshell case and microfiber cleaning cloth." },
      { q: "What is your warranty on progressive lenses?", a: "We offer a 30-day progressive lens adaptation guarantee; if not comfortable, we replace lenses free." },
      { q: "Are blue-light filter lenses suitable for computer work?", a: "Yes! Our digital screen lenses filter 99% of harmful blue light, reducing eye strain." },
    ],
  },

  "kids-fashion": {
    id: "kids-fashion",
    name: "Kids & Baby Apparel",
    primaryColor: "#F43F5E",
    primaryRgb: "244, 63, 94",
    accentColor: "#FB7185",
    bgDark: "#190B10",
    bgLight: "#FFF1F2",
    surfaceDark: "#28121A",
    surfaceLight: "#FFFFFF",
    textDark: "#FFE4E6",
    textLight: "#881337",
    promoTitle: "KIDS BACK-TO-SCHOOL SPECIAL — BUY 3 GET 1 FREE",
    promoSubtitle: "Ultra-soft hypoallergenic baby onesies, colorful jackets, and durable playwear.",
    promoBadge: "KIDS CARNIVAL",
    promoCode: "KIDSMAGIC",
    tagline: "HYPOALLERGENIC FABRICS & PLAYFUL DESIGNS",
    features: [
      { icon: "🧸", title: "100% Bio Cotton", desc: "Ultra-soft non-toxic organic cotton safe for delicate sensitive skin." },
      { icon: "🛡️", title: "Tagless Comfort", desc: "Smooth flatlock seams without itchy tags for all-day seamless comfort." },
      { icon: "🧺", title: "Machine Washable", desc: "Durable colorfast fabrics built to withstand frequent warm washing." },
      { icon: "🌈", title: "Vibrant Non-Toxic", desc: "Oeko-Tex Standard 100 certified eco dyes completely safe for babies." },
      { icon: "👟", title: "Flexible Footwear", desc: "Ergonomic barefoot soles supporting natural growing foot development." },
      { icon: "🎁", title: "Baby Shower Gifts", desc: "Curated gift sets packaged in decorative keepsake gift boxes." },
    ],
    faqs: [
      { q: "Are these baby clothes hypoallergenic?", a: "Yes, 100% certified organic cotton free from toxic chemicals, dyes, or synthetic pesticides." },
      { q: "How true are the kids size charts?", a: "Our size guide aligns with standard age and height ranges; if between sizes, choose one size up." },
      { q: "Are shoes suitable for toddlers learning to walk?", a: "Our shoes feature flexible non-slip rubber soles specially designed for early steps." },
      { q: "Can I return items if the size is wrong?", a: "Yes, we provide free 30-day returns and exchanges on all kids clothing." },
    ],
  },

  "men-fashion": {
    id: "men-fashion",
    name: "Men's Apparel & Suits",
    primaryColor: "#334155",
    primaryRgb: "51, 65, 85",
    accentColor: "#475569",
    bgDark: "#0B0E14",
    bgLight: "#F8FAFC",
    surfaceDark: "#161D27",
    surfaceLight: "#FFFFFF",
    textDark: "#F1F5F9",
    textLight: "#0F172A",
    promoTitle: "TAILORED SUIT & FORMAL ACCESSORY BUNDLE",
    promoSubtitle: "Save 25% on Italian wool suits, crisp Egyptian cotton shirts, and genuine leather loafers.",
    promoBadge: "GENTLEMAN ESSENTIALS",
    promoCode: "SUITUP25",
    tagline: "TAILORED FORMALS & REFINED CASUALWEAR",
    features: [
      { icon: "👔", title: "Italian Wool", desc: "Super 120s fine wool suits tailored for timeless fit and breathability." },
      { icon: "👞", title: "Handcrafted Leather", desc: "Full-grain calfskin leather shoes with Goodyear welted soles." },
      { icon: "📐", title: "Custom Tailoring", desc: "Sleeve and trouser length alterations available prior to shipping." },
      { icon: "🌧️", title: "Stain Resistant", desc: "Nano-coat treatment shielding shirts from accidental spills." },
      { icon: "💼", title: "Executive Accessories", desc: "Matching silk ties, pocket squares, cuff links, and leather belts." },
      { icon: "🚚", title: "Garment Delivery", desc: "Dispatched inside luxury wooden hangers and breathable suit bags." },
    ],
    faqs: [
      { q: "Do you offer suit alteration services?", a: "Yes, select custom hem measurements on checkout and our master tailor will adjust your trousers." },
      { q: "What thread count are the formal shirts?", a: "Our shirts use 2-ply 120s Egyptian Giza cotton for a silk-soft luxurious drape." },
      { q: "How should I clean my Italian wool suit?", a: "Dry clean only; use a natural bristle garment brush after wearing to keep wool fresh." },
      { q: "Are leather shoes true to size?", a: "Yes, standard European sizing. If wide-footed, order half a size larger." },
    ],
  },

  "women-fashion": {
    id: "women-fashion",
    name: "Women's Couture & Beauty",
    primaryColor: "#EC4899",
    primaryRgb: "236, 72, 153",
    accentColor: "#F472B6",
    bgDark: "#180B13",
    bgLight: "#FDF2F8",
    surfaceDark: "#27121F",
    surfaceLight: "#FFFFFF",
    textDark: "#FCE7F3",
    textLight: "#831843",
    promoTitle: "EXCLUSIVE DESIGNER COUTURE COLLECTION",
    promoSubtitle: "Explore glamorous evening gowns, silk blouses, luxury handbags, and vegan cosmetics.",
    promoBadge: "COUTURE PREVIEW",
    promoCode: "GLAMOUR2026",
    tagline: "BOUTIQUE DRESSES & LUXURY COSMETICS",
    features: [
      { icon: "👗", title: "Haute Couture", desc: "Exclusive runway gown designs crafted from mulberry silk and fine lace." },
      { icon: "💄", title: "Vegan Cosmetics", desc: "Cruelty-free 100% natural beauty products free from parabens." },
      { icon: "💎", title: "Handcrafted Jewelry", desc: "18k gold-plated jewelry adorned with Swarovski crystal elements." },
      { icon: "👠", title: "Cushioned Heels", desc: "Designer footwear fitted with memory foam insoles for comfort." },
      { icon: "🎁", title: "Luxury Unboxing", desc: "Packaged inside signature magnetic ribbon boxes with satin pouches." },
      { icon: "✨", title: "Personal Style Guide", desc: "Receive complimentary seasonal lookbook styling recommendations." },
    ],
    faqs: [
      { q: "Are cosmetics cruelty-free?", a: "100% of our beauty and skincare range is certified vegan and never tested on animals." },
      { q: "What is your dress exchange policy?", a: "We offer free return pickups and size exchanges within 14 days of delivery." },
      { q: "Are jewelry pieces hypoallergenic?", a: "Yes, all jewelry is nickel-free, lead-free, and safe for sensitive skin." },
      { q: "Can I request custom evening gown sizing?", a: "Click Speak with Advisor to share your measurements with our couture design team." },
    ],
  },
};

// ─── Persona → Industry Config Mapping (41 → 14) ────────────

const PERSONA_CONFIG_MAP: Record<string, string> = {
  automotive: "automotive",
  electronics: "electronics",
  food: "food-beverages",
  healthcare: "healthcare",
  construction: "construction",
  restaurants: "restaurants",
  retail: "retail",
  hospitality: "hospitality",
  fashion: "fashion",
  pharmaceutical: "pharmaceutical",
  opticals: "opticals",
  kids_fashion: "kids-fashion",
  men_fashion: "men-fashion",
  women_fashion: "women-fashion",

  // Tech-adjacent
  technology: "electronics",
  telecom: "electronics",
  gaming: "electronics",
  media: "electronics",

  // Fashion-adjacent
  textiles: "fashion",
  cosmetics: "women-fashion",
  jewelry: "women-fashion",

  // Vehicle/transport-adjacent
  logistics: "automotive",
  transportation: "automotive",
  maritime: "automotive",
  aviation: "automotive",
  aerospace: "automotive",

  // Industrial
  manufacturing: "construction",
  energy: "construction",
  renewable_energy: "construction",
  chemicals: "construction",
  mining: "construction",
  utilities: "construction",
  waste_management: "construction",

  // Professional/service
  education: "retail",
  legal: "retail",
  consulting: "retail",
  insurance: "retail",
  nonprofit: "retail",
  government: "retail",
  finance: "retail",
  publishing: "retail",
  packaging: "retail",

  // Nature/organic
  agriculture: "food-beverages",
  sports: "food-beverages",

  // Medical-adjacent
  veterinary: "healthcare",

  // Real estate
  real_estate: "construction",
};

// ─── Public API ──────────────────────────────────────────────

/**
 * Retrieve the full industry configuration (colors, promos, features, FAQs).
 */
export function getIndustryConfig(industryId?: string): IndustryConfig {
  const defaultMascot = {
    mascotName: "Store Advisor",
    mascotIcon: "⭐",
    mascotTitle: "Verified Representative",
  };
  if (!industryId) {
    return { ...defaultMascot, ...INDUSTRY_CONFIGS.automotive };
  }
  const normalized = industryId.toLowerCase().replace(/[\s-]+/g, "_");
  const targetId = PERSONA_CONFIG_MAP[normalized] || "automotive";
  const conf = INDUSTRY_CONFIGS[targetId] || INDUSTRY_CONFIGS.automotive;
  return {
    ...defaultMascot,
    ...conf,
  };
}
