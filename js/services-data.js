/* =========================================================
   VICTORIAS LUXURY SPA & WELLNESS — Service & Pricing Data
   Single source of truth for the menu display AND the
   booking widget's deposit calculation.
   Edit prices/services here — the whole site updates.
   ========================================================= */

const DEPOSIT_RATE = 0.30;   // 30% of service price
const DEPOSIT_MIN  = 100;    // R100 minimum deposit

const SERVICE_CATEGORIES = [
  {
    id: "facials",
    name: "Signature Facials",
    items: [
      { id: "victoria-glow-facial", name: "Victoria Glow Facial", price: 850, duration: "60 min", desc: "A deeply hydrating facial designed to brighten, refresh and restore your natural glow." },
      { id: "royal-radiance-facial", name: "Royal Radiance Facial", price: 1150, duration: "75 min", desc: "A premium rejuvenating facial featuring deep cleansing, exfoliation, hydration and a luxurious facial massage." },
      { id: "deep-cleansing-facial", name: "Deep Cleansing Facial", price: 750, duration: "60 min", desc: "Ideal for congested and oily skin, with deep cleansing, exfoliation and purification." },
      { id: "hydration-therapy-facial", name: "Hydration Therapy Facial", price: 800, duration: "60 min", desc: "An intensive moisture treatment for dry, tired or dehydrated skin." },
      { id: "express-glow-facial", name: "Express Glow Facial", price: 500, duration: "30 min", desc: "A quick refresh designed to cleanse, hydrate and revive your skin." }
    ]
  },
  {
    id: "massage",
    name: "Massage Therapy",
    items: [
      { id: "swedish-60", name: "Swedish Full Body Massage", price: 850, duration: "60 min" },
      { id: "swedish-90", name: "Swedish Full Body Massage", price: 1150, duration: "90 min" },
      { id: "deep-tissue-60", name: "Deep Tissue Massage", price: 950, duration: "60 min" },
      { id: "deep-tissue-90", name: "Deep Tissue Massage", price: 1250, duration: "90 min" },
      { id: "hot-stone", name: "Hot Stone Massage", price: 1050, duration: "60 min" },
      { id: "aromatherapy", name: "Aromatherapy Massage", price: 900, duration: "60 min" },
      { id: "back-neck-shoulder", name: "Back, Neck & Shoulder Massage", price: 550, duration: "30 min" },
      { id: "foot-lower-leg", name: "Foot & Lower Leg Massage", price: 450, duration: "30 min" },
      { id: "couples-massage", name: "Couples Massage Experience", price: 1850, duration: "60 min", note: "For two" }
    ]
  },
  {
    id: "body",
    name: "Body Treatments",
    items: [
      { id: "full-body-scrub", name: "Luxury Full Body Scrub", price: 750, duration: "45 min", desc: "A full-body exfoliation treatment leaving the skin smooth and renewed." },
      { id: "detox-wrap", name: "Detoxifying Body Wrap", price: 950, duration: "60 min", desc: "A nourishing body treatment designed to cleanse, hydrate and refresh the skin." },
      { id: "victoria-body-polish", name: "Victoria Body Polish", price: 850, duration: "60 min", desc: "Exfoliation followed by rich moisturising oils for silky, radiant skin." },
      { id: "back-cleanse", name: "Back Cleanse Treatment", price: 650, duration: "45 min", desc: "Deep cleansing and exfoliation designed specifically for the back." }
    ]
  },
  {
    id: "hands-feet",
    name: "Hands & Feet",
    items: [
      { id: "luxury-manicure", name: "Luxury Manicure", price: 450 },
      { id: "gel-manicure", name: "Gel Manicure", price: 550 },
      { id: "luxury-pedicure", name: "Luxury Pedicure", price: 550 },
      { id: "gel-pedicure", name: "Gel Pedicure", price: 650 },
      { id: "gel-soak-off", name: "Gel Soak-Off", price: 150 },
      { id: "hands-feet-combo", name: "Hands & Feet Luxury Combo", price: 950 },
      { id: "paraffin-hand", name: "Paraffin Hand Treatment", price: 250 },
      { id: "paraffin-foot", name: "Paraffin Foot Treatment", price: 300 }
    ]
  },
  {
    id: "beauty",
    name: "Beauty Treatments",
    items: [
      { id: "eyebrow-shape", name: "Eyebrow Shape", price: 150 },
      { id: "eyebrow-tint", name: "Eyebrow Tint", price: 180 },
      { id: "lash-tint", name: "Lash Tint", price: 200 },
      { id: "brow-shape-tint", name: "Brow Shape & Tint", price: 300 },
      { id: "classic-lash", name: "Classic Lash Extensions", price: 650 },
      { id: "hybrid-lash", name: "Hybrid Lash Extensions", price: 750 },
      { id: "volume-lash", name: "Volume Lash Extensions", price: 850 }
    ]
  },
  {
    id: "waxing",
    name: "Waxing",
    items: [
      { id: "wax-eyebrows", name: "Eyebrows", price: 150 },
      { id: "wax-upper-lip", name: "Upper Lip", price: 120 },
      { id: "wax-underarms", name: "Underarms", price: 220 },
      { id: "wax-half-arms", name: "Half Arms", price: 280 },
      { id: "wax-full-arms", name: "Full Arms", price: 380 },
      { id: "wax-half-legs", name: "Half Legs", price: 350 },
      { id: "wax-full-legs", name: "Full Legs", price: 500 },
      { id: "wax-bikini", name: "Bikini Wax", price: 300 },
      { id: "wax-brazilian", name: "Brazilian Wax", price: 450 }
    ]
  },
  {
    id: "packages",
    name: "Victorias Signature Packages",
    isPackage: true,
    items: [
      { id: "royal-escape", name: "The Royal Escape", price: 1650, duration: "Approx. 2 hours", includes: ["60-minute Swedish Massage", "Express Glow Facial", "Herbal Tea or Refreshment"] },
      { id: "victoria-glow-experience", name: "Victoria Glow Experience", price: 2100, duration: "Approx. 2½ hours", includes: ["Victoria Glow Facial", "Full Body Scrub", "Back, Neck & Shoulder Massage", "Complimentary Refreshment"] },
      { id: "ultimate-luxury-retreat", name: "Ultimate Luxury Retreat", price: 2850, duration: "Approx. 3½ hours", includes: ["60-minute Full Body Massage", "Royal Radiance Facial", "Luxury Manicure", "Luxury Pedicure", "Complimentary Refreshment & Light Treat"] },
      { id: "couples-luxury-escape", name: "Couples Luxury Escape", price: 3200, duration: "Approx. 2 hours", note: "For two", includes: ["Couples Full Body Massage", "Express Facial for Each Guest", "Private Relaxation Time", "Complimentary Sparkling Non-Alcoholic Drink & Treats"] },
      { id: "bride-to-be", name: "Bride-to-Be Luxury Package", price: 2650, includes: ["Victoria Glow Facial", "Full Body Polish", "Luxury Manicure", "Luxury Pedicure", "Complimentary Refreshment"] }
    ]
  },
  {
    id: "addons",
    name: "Wellness Add-Ons",
    items: [
      { id: "scalp-massage", name: "Scalp Massage", price: 250 },
      { id: "addon-foot-massage", name: "Foot Massage", price: 250 },
      { id: "hot-stone-upgrade", name: "Hot Stone Upgrade", price: 200 },
      { id: "aromatherapy-upgrade", name: "Aromatherapy Oil Upgrade", price: 150 },
      { id: "hydrating-mask", name: "Hydrating Face Mask", price: 180 },
      { id: "eye-treatment", name: "Eye Treatment", price: 150 },
      { id: "paraffin-treatment", name: "Paraffin Treatment", price: 250, note: "From R250" }
    ]
  }
];

function calcDeposit(price) {
  return Math.max(DEPOSIT_MIN, Math.round((price * DEPOSIT_RATE) / 10) * 10);
}

function formatZAR(amount) {
  return "R" + amount.toLocaleString("en-ZA");
}
