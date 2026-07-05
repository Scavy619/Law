// Central place for brand/contact/lawyer info so it's easy to update in one spot.
export const site = {
  brandName: "Shivam Parashar",
  brandTitle: "Adv. Shivam Parashar",
  tagline: "Advocate, Delhi",
  city: "New Delhi",

  // TODO: replace email/address with real details before launch
  phone: "+919472761482",
  phoneDisplay: "+91 94727 61482",
  whatsapp: "919472761482", // digits only, used for wa.me links
  email: "contact@shivamparasharlaw.in",
  address: "New Delhi, India",

  social: {
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com",
  },
};

export const whatsappLink = (message = "Hi Shivam, I'd like to ask about my legal situation.") =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;

export const lawyerProfile = {
  name: "Adv. Shivam Parashar",
  degree: "B.A. LL.B, Vivekananda Law College, Delhi",
  experience: "2 Years",
  specialities: [
    "Criminal Law",
    "Family & Divorce",
    "Corporate Law",
    "Civil Litigation",
    "Property Law",
    "Tax Law",
  ],
  shortBio:
    "A Delhi-based advocate handling criminal, civil, family, corporate, property, and tax matters — with a hands-on, client-first approach and direct personal attention on every case.",
  fullBio: [
    "Advocate Shivam Parashar is a Delhi-based lawyer with a growing general practice spanning criminal, civil, family, corporate, property, and tax matters. A graduate of Vivekananda Law College, Delhi, he combines thorough preparation with clear, jargon-free communication.",
    "Whether you're facing a criminal charge, navigating a family dispute, resolving a property matter, or need contract and compliance support for your business, Shivam takes the time to understand your specific situation before recommending a course of action.",
    "Clients work directly with Shivam — not a rotating cast of associates — so you always know who's handling your matter and can reach them when it matters.",
  ],
};
