// Curated, cross-referenced Indian law section lookup.
//
// BNS/IPC mappings sourced from the official BNS-to-IPC correspondence table
// published by CAPT Bhopal (Bureau of Police Research & Development, Govt. of India).
// Constitution articles are settled, well-established provisions.
//
// This is a general-orientation reference, not exhaustive and not legal advice —
// always confirm specifics with the advocate before relying on a section number.

export const lawCategories = [
  "All",
  "Offences Against the Body",
  "Offences Against Women",
  "Property Offences",
  "Public Order",
  "Reputation & Intimidation",
  "Fundamental Rights",
];

export const lawSections = [
  // ---- Offences Against the Body ----
  {
    act: "BNS 2023",
    section: "100",
    oldRef: "IPC 299",
    title: "Culpable Homicide",
    category: "Offences Against the Body",
    summary:
      "Defines causing death with the intention or knowledge that it's likely to cause death — the base offence that murder is a more serious form of.",
    keywords: ["culpable homicide", "death", "intention"],
  },
  {
    act: "BNS 2023",
    section: "101",
    oldRef: "IPC 300",
    title: "Murder",
    category: "Offences Against the Body",
    summary:
      "Defines when a culpable homicide is serious enough to be classed as murder — broadly, killing done with clear intent or knowledge that it would almost certainly cause death.",
    keywords: ["murder", "killing", "homicide"],
  },
  {
    act: "BNS 2023",
    section: "103(1)",
    oldRef: "IPC 302",
    title: "Punishment for Murder",
    category: "Offences Against the Body",
    summary:
      "Punishment is death or life imprisonment, plus a fine. This is the section most people mean when they say \"302\".",
    keywords: ["murder punishment", "302", "death sentence", "life imprisonment"],
  },
  {
    act: "BNS 2023",
    section: "105",
    oldRef: "IPC 304",
    title: "Culpable Homicide Not Amounting to Murder",
    category: "Offences Against the Body",
    summary:
      "Covers killings that don't meet the strict definition of murder — for example, death caused in a sudden fight without premeditation. Carries a lower minimum sentence than murder.",
    keywords: ["304", "manslaughter", "sudden fight", "no premeditation"],
  },
  {
    act: "BNS 2023",
    section: "109",
    oldRef: "IPC 307",
    title: "Attempt to Murder",
    category: "Offences Against the Body",
    summary:
      "Covers acts done with the intention or knowledge to cause death, where the victim survives. Carries serious imprisonment even though death didn't occur.",
    keywords: ["attempt to murder", "307", "attempted killing"],
  },
  {
    act: "BNS 2023",
    section: "114",
    oldRef: "IPC 319",
    title: "Hurt",
    category: "Offences Against the Body",
    summary: "Defines \"hurt\" as causing bodily pain, disease, or infirmity to another person.",
    keywords: ["hurt", "injury", "assault"],
  },
  {
    act: "BNS 2023",
    section: "115(2)",
    oldRef: "IPC 323",
    title: "Punishment for Voluntarily Causing Hurt",
    category: "Offences Against the Body",
    summary:
      "Basic penalty for intentionally injuring someone (short of grievous hurt) — usually imprisonment up to one year, fine, or both.",
    keywords: ["voluntarily causing hurt", "323", "simple injury"],
  },
  {
    act: "BNS 2023",
    section: "116",
    oldRef: "IPC 320",
    title: "Grievous Hurt (Definition)",
    category: "Offences Against the Body",
    summary:
      "Lists what counts as \"grievous\" — e.g. permanent disfigurement, fracture, loss of a limb or sense. The bar was lowered from 20 to 15 days of suffering to qualify.",
    keywords: ["grievous hurt", "320", "serious injury", "fracture"],
  },
  {
    act: "BNS 2023",
    section: "117(2)",
    oldRef: "IPC 325",
    title: "Punishment for Voluntarily Causing Grievous Hurt",
    category: "Offences Against the Body",
    summary: "Punishment for causing grievous hurt — imprisonment up to 7 years plus fine.",
    keywords: ["grievous hurt punishment", "325"],
  },

  // ---- Offences Against Women ----
  {
    act: "BNS 2023",
    section: "63",
    oldRef: "IPC 375",
    title: "Rape (Definition)",
    category: "Offences Against Women",
    summary:
      "Defines rape and the circumstances/absence of consent that constitute it. The age-of-consent exception for marriage was raised from 15 to 18 years under BNS.",
    keywords: ["rape", "375", "sexual assault", "consent"],
  },
  {
    act: "BNS 2023",
    section: "64",
    oldRef: "IPC 376",
    title: "Punishment for Rape",
    category: "Offences Against Women",
    summary: "Minimum 10 years' rigorous imprisonment, extendable to life, plus fine.",
    keywords: ["376", "rape punishment"],
  },
  {
    act: "BNS 2023",
    section: "74",
    oldRef: "IPC 354",
    title: "Assault/Criminal Force to Outrage Modesty",
    category: "Offences Against Women",
    summary:
      "Covers assault or use of force against a woman with intent to, or knowledge it's likely to, outrage her modesty.",
    keywords: ["354", "outraging modesty", "molestation"],
  },
  {
    act: "BNS 2023",
    section: "75",
    oldRef: "IPC 354A",
    title: "Sexual Harassment",
    category: "Offences Against Women",
    summary:
      "Covers unwelcome physical contact, demands for sexual favours, showing pornography, and sexually coloured remarks.",
    keywords: ["354A", "sexual harassment", "workplace harassment"],
  },
  {
    act: "BNS 2023",
    section: "80",
    oldRef: "IPC 304B",
    title: "Dowry Death",
    category: "Offences Against Women",
    summary:
      "Covers a woman's death within 7 years of marriage under suspicious circumstances connected to dowry harassment. Minimum imprisonment of 7 years.",
    keywords: ["304B", "dowry death", "dowry"],
  },
  {
    act: "BNS 2023",
    section: "85 / 86",
    oldRef: "IPC 498A",
    title: "Cruelty by Husband or Relatives",
    category: "Offences Against Women",
    summary:
      "Covers cruelty (including harassment for dowry) by a husband or his relatives toward a wife. What was one IPC section is now split into two BNS sections — one for the offence, one defining \"cruelty\".",
    keywords: ["498A", "cruelty", "dowry harassment", "domestic"],
  },
  {
    act: "BNS 2023",
    section: "87",
    oldRef: "IPC 366",
    title: "Kidnapping/Abduction to Compel Marriage or for Ransom",
    category: "Offences Against Women",
    summary:
      "Covers kidnapping or abducting a woman to force marriage against her will, or to subject her to illicit intercourse.",
    keywords: ["366", "kidnapping", "forced marriage"],
  },

  // ---- Property Offences ----
  {
    act: "BNS 2023",
    section: "303(1)",
    oldRef: "IPC 378",
    title: "Theft (Definition)",
    category: "Property Offences",
    summary: "Dishonestly taking movable property out of someone's possession without consent.",
    keywords: ["theft", "378", "stealing"],
  },
  {
    act: "BNS 2023",
    section: "303(2)",
    oldRef: "IPC 379",
    title: "Punishment for Theft",
    category: "Property Offences",
    summary: "Up to 3 years' imprisonment, fine, or both — enhanced for repeat convictions under BNS.",
    keywords: ["379", "theft punishment"],
  },
  {
    act: "BNS 2023",
    section: "305",
    oldRef: "IPC 380",
    title: "Theft in a Dwelling House",
    category: "Property Offences",
    summary:
      "Aggravated theft from a home, place of worship, or (newly) a means of transportation — up to 7 years' imprisonment.",
    keywords: ["380", "house theft", "burglary"],
  },
  {
    act: "BNS 2023",
    section: "308(1)",
    oldRef: "IPC 383",
    title: "Extortion",
    category: "Property Offences",
    summary: "Dishonestly inducing someone, through fear of injury, to hand over property.",
    keywords: ["extortion", "383", "blackmail"],
  },
  {
    act: "BNS 2023",
    section: "309(1)–(3)",
    oldRef: "IPC 390",
    title: "Robbery",
    category: "Property Offences",
    summary: "Theft or extortion that involves force, or the threat of instant harm.",
    keywords: ["robbery", "390"],
  },
  {
    act: "BNS 2023",
    section: "310(1)",
    oldRef: "IPC 391",
    title: "Dacoity",
    category: "Property Offences",
    summary: "Robbery committed by five or more people acting together.",
    keywords: ["dacoity", "391", "gang robbery"],
  },
  {
    act: "BNS 2023",
    section: "316(1)/(2)",
    oldRef: "IPC 405 / 406",
    title: "Criminal Breach of Trust",
    category: "Property Offences",
    summary:
      "Dishonestly misusing property that was entrusted to you — common in employer-employee or partnership disputes.",
    keywords: ["breach of trust", "405", "406", "misappropriation"],
  },
  {
    act: "BNS 2023",
    section: "318(1)/(2)",
    oldRef: "IPC 415 / 417",
    title: "Cheating",
    category: "Property Offences",
    summary: "Deceiving someone to dishonestly gain an advantage or cause them a loss.",
    keywords: ["cheating", "415", "417", "fraud", "deception"],
  },
  {
    act: "BNS 2023",
    section: "318(4)",
    oldRef: "IPC 420",
    title: "Cheating & Dishonestly Inducing Delivery of Property",
    category: "Property Offences",
    summary:
      "The classic \"420\" — cheating that specifically results in the victim handing over property or valuable security. Up to 7 years' imprisonment.",
    keywords: ["420", "cheating", "fraud", "dishonest inducement"],
  },

  // ---- Public Order ----
  {
    act: "BNS 2023",
    section: "3(5)",
    oldRef: "IPC 34",
    title: "Common Intention",
    category: "Public Order",
    summary:
      "When several people commit an act together in furtherance of a shared plan, each is liable as if they did the whole act alone.",
    keywords: ["common intention", "34", "joint liability"],
  },
  {
    act: "BNS 2023",
    section: "61(1)/(2)",
    oldRef: "IPC 120A / 120B",
    title: "Criminal Conspiracy",
    category: "Public Order",
    summary: "An agreement between two or more people to commit an illegal act, and its punishment.",
    keywords: ["conspiracy", "120A", "120B"],
  },
  {
    act: "BNS 2023",
    section: "137(1)",
    oldRef: "IPC 359",
    title: "Kidnapping",
    category: "Public Order",
    summary: "Taking or enticing a minor, or a person of unsound mind, out of lawful guardianship.",
    keywords: ["kidnapping", "359"],
  },
  {
    act: "BNS 2023",
    section: "140(2)",
    oldRef: "IPC 364A",
    title: "Kidnapping for Ransom",
    category: "Public Order",
    summary: "Kidnapping with threats to kill or hurt the victim in order to extort ransom.",
    keywords: ["364A", "ransom", "kidnapping for ransom"],
  },
  {
    act: "BNS 2023",
    section: "189(1)",
    oldRef: "IPC 141",
    title: "Unlawful Assembly",
    category: "Public Order",
    summary: "Defines when a gathering of five or more people, with a shared unlawful objective, becomes an offence.",
    keywords: ["unlawful assembly", "141"],
  },
  {
    act: "BNS 2023",
    section: "191(1)/(2)",
    oldRef: "IPC 146 / 147",
    title: "Rioting",
    category: "Public Order",
    summary: "An unlawful assembly that uses force or violence, and its punishment.",
    keywords: ["rioting", "146", "147"],
  },

  // ---- Reputation & Intimidation ----
  {
    act: "BNS 2023",
    section: "351(1)",
    oldRef: "IPC 503",
    title: "Criminal Intimidation",
    category: "Reputation & Intimidation",
    summary: "Threatening someone with injury to their person, reputation, or property to cause alarm or force an act.",
    keywords: ["criminal intimidation", "503", "threats"],
  },
  {
    act: "BNS 2023",
    section: "356(1)/(2)",
    oldRef: "IPC 499 / 500",
    title: "Defamation",
    category: "Reputation & Intimidation",
    summary: "Making or publishing an imputation about a person intending to harm their reputation, and its punishment (up to 2 years, fine, or community service).",
    keywords: ["defamation", "499", "500"],
  },

  // ---- Fundamental Rights (Constitution of India) ----
  {
    act: "Constitution",
    section: "Article 14",
    oldRef: null,
    title: "Equality Before Law",
    category: "Fundamental Rights",
    summary: "Guarantees equality before the law and equal protection of the laws to every person within India.",
    keywords: ["article 14", "equality", "constitution"],
  },
  {
    act: "Constitution",
    section: "Article 19",
    oldRef: null,
    title: "Freedoms — Speech, Assembly, Movement, Profession",
    category: "Fundamental Rights",
    summary: "Protects six core freedoms including speech and expression, peaceful assembly, and the right to practise any profession — subject to reasonable restrictions.",
    keywords: ["article 19", "free speech", "freedom", "constitution"],
  },
  {
    act: "Constitution",
    section: "Article 21",
    oldRef: null,
    title: "Right to Life and Personal Liberty",
    category: "Fundamental Rights",
    summary: "No person can be deprived of life or personal liberty except by a fair, just, and reasonable procedure established by law. Courts have read many rights into this article over time.",
    keywords: ["article 21", "right to life", "personal liberty", "constitution"],
  },
  {
    act: "Constitution",
    section: "Article 32",
    oldRef: null,
    title: "Right to Constitutional Remedies",
    category: "Fundamental Rights",
    summary: "Lets you approach the Supreme Court directly to enforce your fundamental rights. Dr. Ambedkar called it the \"heart and soul\" of the Constitution.",
    keywords: ["article 32", "writ", "supreme court", "constitution"],
  },
  {
    act: "Constitution",
    section: "Article 226",
    oldRef: null,
    title: "High Court Writ Jurisdiction",
    category: "Fundamental Rights",
    summary: "Empowers High Courts to issue writs for enforcement of fundamental rights and for other legal purposes — broader than Article 32.",
    keywords: ["article 226", "writ", "high court", "constitution"],
  },
];

export const disclaimer =
  "This is a general-orientation reference for common Indian law sections (Bharatiya Nyaya Sanhita 2023, cross-referenced against the earlier IPC 1860, plus key Constitutional articles). It is not exhaustive, not a substitute for reading the bare act, and not legal advice for your specific situation — section numbers and applicability can turn on details a quick search can't capture. Book a consultation to discuss how a section actually applies to your case.";
