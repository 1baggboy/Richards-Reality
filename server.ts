import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initializeApp as initAdminApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { 
  ConsultationRequest, 
  ContactMessage, 
  BlogPost, 
  TeamMember, 
  GalleryItem, 
  Testimonial, 
  JobListing, 
  JobApplication, 
  NewsletterSubscriber, 
  WebsiteSettings,
  SystemLog 
} from './src/types.js';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'server_data.json');

app.use(express.json({ limit: '10mb' }));

// Initial Seed Data
const DEFAULT_SETTINGS: WebsiteSettings = {
  general: {
    companyName: "Richards Realty LLC",
    phone: "+1 (800) 555-0190",
    email: "consulting@richardsrealty.com",
    address: "600 Montgomery St, 41st Floor, San Francisco, CA 94111",
    workingHours: "Mon - Fri: 8:00 AM - 6:00 PM (PST), Sat: By Appointment",
    whatsappNumber: "18005550190",
    googleMapIframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.7853689405024!2d-122.40487002422204!3d37.79517597198124!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808580f49d8c3667%3A0x7d87f73cfeb88ec3!2sTransamerica%20Pyramid!5e0!3m2!1sen!2sus!4v1710000000000!5m2!1sen!2sus"
  },
  seo: {
    metaTitle: "Richards Realty LLC | Elite Corporate Real Estate Advisory & Valuation",
    metaDescription: "Richards Realty LLC is a premier corporate real estate consultancy. We provide investment advisory, property valuation, documentation, and facility management with absolute integrity.",
    openGraphImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&h=630&q=80"
  },
  social: {
    linkedin: "https://linkedin.com/company/richardsrealty",
    twitter: "https://twitter.com/richardsrealty",
    facebook: "https://facebook.com/richardsrealty",
    instagram: "https://instagram.com/richardsrealty"
  },
  content: {
    heroHeadline: "Elite Corporate Real Estate & Valuation",
    heroSubheadline: "Strategic advisory, regulatory compliance, and high-end brokerage for the corporate enterprise.",
    heroImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80",
    aboutHeadline: "The Standard of Commercial Excellence",
    aboutText: "Richards Realty LLC serves the elite echelons of corporate real estate. Our firm provides uncompromising analytical precision, from RICS-certified valuations to facility management consultation. We prioritize data-driven strategies, securing optimal transaction values while navigating complex regulatory landscapes.",
    aboutImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    servicesHeadline: "Strategic Consulting Portfolios",
    servicesSubheadline: "Our expertise spans across critical corporate real estate functions, maximizing portfolio performance.",
    missionHeadline: "Our Mission & Vision",
    missionText: "How Richards Realty LLC builds trust and sets premium standards across California's real estate domains.",
    teamHeadline: "Meet Our Professional Team",
    teamSubheadline: "Bespoke transactional advisors, RICS chartered valuations surveyors, and municipal zoning advocates forming the core of Richards Realty LLC.",
    faqs: [
      { q: 'What services do you provide?', a: 'We provide specialized corporate real estate consultancy, certified RICS-compliant asset valuations, institutional investment underwriting, facility operational advice, local land registry document audits, development feasibility analysis, and zoning legal diagnostics.' },
      { q: 'How do I book a consultation?', a: 'You can book a direct briefing by clicking "Book Consultation" in our header or footer, completing our encrypted scheduler form, and providing your corporate objective details.' },
      { q: 'Do you sell or manage properties?', a: 'No. We maintain strict structural fiduciaries: we never operate commercial listing marketplaces, property transactions, or landlord renting services.' },
      { q: 'Do you provide certified valuation reports?', a: 'Yes. All our evaluations are completed by chartered valuations surveyors under the strict guidelines of the Royal Institution of Chartered Surveyors.' }
    ],
    aboutPageHeadline: "Corporate Profile",
    aboutPageText: "Richards Realty LLC is a premier corporate advisory and valuation firm headquartered in San Francisco. We specialize in RICS-compliant valuations, commercial transaction consulting, and strategic facility management.",
    aboutPageStoryHeadline: "Our Legacy",
    aboutPageStoryText: "Founded on the principles of integrity and analytical rigor, Richards Realty LLC has spent over two decades advising institutional investors, family offices, and multinational corporations on their most complex real estate challenges.",
    aboutPageMessageHeadline: "A Word From the Managing Director",
    aboutPageMessageText: "Our commitment to excellence is unwavering. We navigate the complexities of the real estate market to deliver actionable insights and structural resilience for our clients.",
    aboutPageMessageAuthor: "Arthur Richards, Managing Director",
    missionCoreHeadline: "Our Core Mission",
    missionCoreText: "To provide impartial, highly analytical, and strategic real estate advisory services that protect and enhance our clients' corporate assets and investment portfolios.",
    missionVisionHeadline: "Market Vision",
    missionVisionText: "We envision a real estate landscape where transparency and rigorous data analysis drive every major transaction, ensuring sustainable growth and risk mitigation.",
    missionApproachHeadline: "Analytical Approach",
    missionApproachText: "We employ advanced cash flow underwriting models and strict adherence to international valuation standards to deliver precise, defensible asset pricing.",
    missionCommitmentHeadline: "Client Commitment",
    missionCommitmentText: "We maintain absolute independence. By refusing to engage in brokerage or property management, we eliminate conflicts of interest, ensuring our advice is purely objective.",
    galleryHeadline: "Corporate Gallery",
    gallerySubheadline: "Explore our operational footprint, client engagements, and corporate events across California.",
    blogHeadline: "Market Insights",
    blogSubheadline: "Expert analysis, economic updates, and strategic perspectives on the commercial real estate landscape.",
    careersHeadline: "Career Opportunities",
    careersSubheadline: "Join a culture of analytical excellence and absolute integrity. We are always looking for driven professionals.",
    contactHeadline: "Contact Our Advisors",
    contactSubheadline: "Schedule a confidential briefing with our senior partners to discuss your corporate real estate objectives.",
    footerText: "Richards Realty LLC operates as an accredited commercial advisory firm. All client engagement agreements are subjected to standard California municipal oversight and financial disclosure procedures. This website serves purely as a corporate informational directory.",
    privacyPolicyText: "Your privacy is paramount. We adhere to stringent data protection standards to safeguard all corporate and personal information entrusted to us during engagements.",
    termsOfServiceText: "By accessing this directory, you agree to our corporate terms of service. All content is for informational purposes and does not constitute formal financial or legal advice until an engagement letter is executed.",
    cookiePolicyText: "We use essential cookies to ensure the functionality and security of our digital platforms. We do not use third-party tracking for advertising purposes.",
    disclaimerText: "Valuations and advisory insights are subject to market volatility. Past performance and theoretical underwriting do not guarantee future yields."
  },
  styling: {
    primaryColor: "#0A1D37",
    accentColor: "#C5A02E",
    backgroundColor: "#ffffff",
    fontFamily: "font-sans",
    borderRadius: "rounded-none",
    animationStyle: "animate-in fade-in duration-200"
  }
};

const DEFAULT_BLOGS: BlogPost[] = [
  {
    id: "blog-1",
    title: "Navigating Commercial Real Estate in a High-Interest Rate Environment",
    category: "Market Insights",
    date: "July 12, 2026",
    shortDesc: "An analytical study on capital allocation, cap rates adjustment, and debt restructuring strategies for enterprise portfolio managers.",
    content: "The landscape of commercial real estate is undergoing a structural transition as global interest rates remain elevated compared to the previous decade. For institutional owners and family offices, this shifts the strategic focus from aggressive expansion to yield optimization, asset repositioning, and debt maturity management.\n\nIn this brief, our advisory committee analyzes why premium core office and industrial spaces are showing resilience, and how corporate tenants can restructure their lease footprints to maximize efficiency. We explore key strategies including lease sale-leasebacks, structured refinancing, and asset subclass diversification (such as life sciences and data center logistics). Successful capital allocation now demands deep asset valuation integrity and rigorous technical underwriting.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    author: "Richard V. Henderson, Managing Partner",
    readTime: "6 min read"
  },
  {
    id: "blog-2",
    title: "The Valuation Paradigm: Aligning ESG Criteria with Asset Asset Value",
    category: "Valuation & Advisory",
    date: "June 28, 2026",
    shortDesc: "How modern environmental standards, sustainability certifications, and energy efficiency ratings affect RICS-compliant valuations.",
    content: "Environmental, Social, and Governance (ESG) criteria are no longer auxiliary line items in corporate reports—they are direct drivers of risk premiums and capitalization rates. Today, premium office towers with high LEED Platinum or BREEAM ratings enjoy a 'green premium' of 4% to 11% in rental yield compared to non-certified buildings in the same submarket.\n\nConversely, assets that fail to meet baseline carbon compliance face the threat of 'brown discounting' and accelerated obsolescence. Our valuation team lays down the quantitative framework used to incorporate carbon tax liabilities, energy retrofit expenditures, and tenant demand shifts directly into Discounted Cash Flow (DCF) valuation models. Staying ahead of regulatory mandates is the only way to preserve long-term asset value.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    author: "Elena Rostova, Head of Valuations",
    readTime: "8 min read"
  },
  {
    id: "blog-3",
    title: "Corporate Lease Restructuring: Strategies for the Post-Hybrid Workplace",
    category: "Corporate Solutions",
    date: "May 15, 2026",
    shortDesc: "Practical methods for large enterprises to optimize their physical office footprint while maintaining high operational performance.",
    content: "The corporate headquarters is being redefined. With hybrid work patterns fully established, Fortune 500 enterprises are auditing their real estate assets to eliminate excess square footage while creating collaborative 'hub' spaces that justify the commute.\n\nThis article outlines our proprietary lease negotiation framework. We discuss options for subleasing, consolidation clauses, early termination buyouts, and flex-space integrations. By aligning lease terms with actual personnel utilization data, companies can reduce corporate real estate overhead by up to 35% without impacting organizational productivity.",
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80",
    author: "Marcus Vance, Director of Corporate Consultancy",
    readTime: "5 min read"
  }
];

const DEFAULT_TEAM: TeamMember[] = [
  {
    id: "team-1",
    name: "Richard V. Henderson",
    position: "Founder & Managing Partner",
    bio: "With over 25 years of institutional real estate consultancy, Richard leads the strategic vision at Richards Realty LLC. Former Senior Vice President of Institutional Capital Markets at a top global firm, he specializes in high-value asset valuation and commercial investment advisory.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80",
    linkedin: "https://linkedin.com/in/placeholder",
    email: "r.henderson@richardsrealty.com"
  },
  {
    id: "team-2",
    name: "Elena Rostova, MRICS",
    position: "Partner, Head of Valuations",
    bio: "Elena is a chartered valuation surveyor with 18 years of experience. She heads our RICS-compliant valuations department, providing certified asset valuation reports for financial institutions, national developers, and corporate audits.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80",
    linkedin: "https://linkedin.com/in/placeholder",
    email: "e.rostova@richardsrealty.com"
  },
  {
    id: "team-3",
    name: "Marcus Vance",
    position: "Director of Corporate Consultancy",
    bio: "Marcus has structured lease-and-portfolio transactions for Fortune 500 tech and industrial leaders. He leads our corporate advisory branch, advising clients on optimal corporate headquarters footprint planning and landlord-tenant strategies.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80",
    linkedin: "https://linkedin.com/in/placeholder",
    email: "m.vance@richardsrealty.com"
  },
  {
    id: "team-4",
    name: "Sarah Jenkins, Esq.",
    position: "Senior Legal Counsel",
    bio: "Admitted to the California Bar with 12 years specializing in municipal zoning, real estate transactions, and property documentation audits. Sarah protects our clients' legal interest in complex asset acquisitions and structures land registry audits.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&h=400&q=80",
    linkedin: "https://linkedin.com/in/placeholder",
    email: "s.jenkins@richardsrealty.com"
  }
];

const DEFAULT_GALLERY: GalleryItem[] = [
  { id: "gal-1", title: "Richards Realty Headquarters - Boardroom", category: "Office", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80" },
  { id: "gal-2", title: "Institutional Investor Round Table", category: "Meetings", image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80" },
  { id: "gal-3", title: "Premium Skyline Commercial Landmark under Advisory", category: "Projects", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" },
  { id: "gal-4", title: "Annual Corporate Real Estate Symposium", category: "Corporate Events", image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80" },
  { id: "gal-5", title: "Technical On-Site Asset Valuation Audit", category: "Site Visits", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80" },
  { id: "gal-6", title: "Richards Executive Committee Workshop", category: "Team Activities", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" }
];

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    name: "Executive Director",
    company: "Apex Global Holdings",
    review: "Richards Realty LLC conducted a comprehensive valuation audit of our West Coast commercial real estate portfolio. Their RICS-certified reports were incredibly thorough, enabling us to secure a major restructuring with our banking syndicate. Absolutely premier service.",
    rating: 5
  },
  {
    id: "test-2",
    name: "VP of Asset Management",
    company: "Metropolitan Insurance Group",
    review: "The investment advisory team at Richards Realty provides deep quantitative insights that go far beyond standard market reports. They understand institutional risk, regulatory pressures, and yield management.",
    rating: 5
  },
  {
    id: "test-3",
    name: "General Counsel",
    company: "Vanguard Tech Properties",
    review: "Sarah Jenkins and the land documentation assistance team guided us through an incredibly convoluted municipal zoning and land registration audit. Their professional relationships, meticulous tracking, and integrity are unmatched.",
    rating: 5
  }
];

const DEFAULT_CAREERS: JobListing[] = [
  {
    id: "car-1",
    title: "Senior Real Estate Investment Analyst",
    department: "Investment Advisory",
    location: "San Francisco, CA (Hybrid)",
    type: "Full-time",
    description: "We are seeking an experienced analyst to perform complex DCF modeling, underwriting, and macroeconomic risk analysis for high-net-worth individuals and corporate clients.",
    requirements: [
      "5+ years of experience in institutional real estate underwriting or investment banking",
      "Mastery of Argus Enterprise and advanced Excel financial modeling",
      "CFA or equivalent professional certification highly desirable",
      "Strong analytical narrative drafting skills"
    ],
    status: "active",
    createdAt: new Date().toISOString()
  },
  {
    id: "car-2",
    title: "Chartered Valuation Surveyor",
    department: "Property Valuation",
    location: "San Francisco, CA (On-site)",
    type: "Full-time",
    description: "Join our core valuation team. You will be responsible for conducting on-site asset audits, analyzing market data, and drafting certified RICS Red Book compliant commercial valuation reports.",
    requirements: [
      "Active RICS/MRICS membership or MAI designation",
      "Minimum 4 years of experience surveying commercial assets",
      "Impeccable ethical standing and commitment to professional standards",
      "Valid driver's license for regional site audits"
    ],
    status: "active",
    createdAt: new Date().toISOString()
  },
  {
    id: "car-3",
    title: "Corporate Real Estate Consulting Intern",
    department: "Corporate Solutions",
    location: "San Francisco, CA (Hybrid)",
    type: "Internship",
    description: "A fast-paced, highly mentoring internship assisting our Consulting Director. Excellent exposure to corporate lease audits, tenant advisory processes, and commercial real estate technology.",
    requirements: [
      "Currently enrolled in or recently graduated from a top-tier Real Estate, Business, or Finance degree",
      "Excellent research and writing abilities",
      "A fast, proactive learning mindset and professional presentation skills",
      "Available for a minimum of 6 months"
    ],
    status: "active",
    createdAt: new Date().toISOString()
  }
];

// In-Memory Database State
let DB = {
  settings: DEFAULT_SETTINGS,
  blogs: DEFAULT_BLOGS,
  team: DEFAULT_TEAM,
  gallery: DEFAULT_GALLERY,
  testimonials: DEFAULT_TESTIMONIALS,
  careers: DEFAULT_CAREERS,
  consultations: [] as ConsultationRequest[],
  messages: [] as ContactMessage[],
  applications: [] as JobApplication[],
  subscribers: [] as NewsletterSubscriber[],
  logs: [] as SystemLog[]
};

// --- FIRESTORE INTEGRATION SETUP ---
let firestoreDb: any = null;

function handleFirestoreError(err: any, operationName: string) {
  const errMsg = err?.message || String(err);
  console.error(`Firestore error during [${operationName}]:`, errMsg);
  if (
    errMsg.includes("PERMISSION_DENIED") ||
    errMsg.includes("Permission denied") ||
    errMsg.includes("Forbidden") ||
    err?.code === 7
  ) {
    console.warn("⚠️ Firestore access denied (PERMISSION_DENIED). Disabling Firestore integration and falling back completely to local JSON database storage (server_data.json).");
    firestoreDb = null;
  }
}

async function firestoreSaveSettings() {
  if (!firestoreDb) return;
  try {
    await firestoreDb.collection('config').doc('settings').set(DB.settings);
  } catch (err) {
    handleFirestoreError(err, "saveSettings");
  }
}

async function firestoreAddOrUpdateRecord(collName: string, record: any) {
  if (!firestoreDb) return;
  try {
    const docId = record.id;
    if (docId) {
      await firestoreDb.collection(collName).doc(docId).set(record);
    }
  } catch (err) {
    handleFirestoreError(err, `writeToCollection:${collName}`);
  }
}

async function firestoreDeleteRecord(collName: string, docId: string) {
  if (!firestoreDb) return;
  try {
    await firestoreDb.collection(collName).doc(docId).delete();
  } catch (err) {
    handleFirestoreError(err, `deleteFromCollection:${collName}`);
  }
}

async function firestoreBulkSetCollection(collName: string, list: any[]) {
  if (!firestoreDb) return;
  try {
    const snapshot = await firestoreDb.collection(collName).get();
    const batch = firestoreDb.batch();
    snapshot.forEach((doc: any) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Batch set list in chunks of 400 (Firestore limit is 500)
    const chunkSize = 400;
    for (let i = 0; i < list.length; i += chunkSize) {
      const chunk = list.slice(i, i + chunkSize);
      const writeBatch = firestoreDb.batch();
      for (const item of chunk) {
        const docId = item.id || `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        writeBatch.set(firestoreDb.collection(collName).doc(docId), item);
      }
      await writeBatch.commit();
    }
  } catch (err) {
    handleFirestoreError(err, `bulkWriteCollection:${collName}`);
  }
}

async function syncFromFirestore() {
  if (!firestoreDb) return;
  console.log("Syncing database cache from Firestore...");
  try {
    // 1. Settings
    const settingsDoc = await firestoreDb.collection('config').doc('settings').get();
    if (settingsDoc.exists) {
      DB.settings = settingsDoc.data();
    } else {
      await firestoreDb.collection('config').doc('settings').set(DB.settings);
    }

    // 2. Collections to sync
    const keys = [
      { key: 'blogs', coll: 'blogs' },
      { key: 'team', coll: 'team' },
      { key: 'gallery', coll: 'gallery' },
      { key: 'testimonials', coll: 'testimonials' },
      { key: 'careers', coll: 'careers' },
      { key: 'consultations', coll: 'consultations' },
      { key: 'messages', coll: 'messages' },
      { key: 'applications', coll: 'applications' },
      { key: 'subscribers', coll: 'subscribers' },
      { key: 'logs', coll: 'logs' }
    ];

    for (const item of keys) {
      if (!firestoreDb) return; // Exit if disabled by previous collection error
      const snapshot = await firestoreDb.collection(item.coll).get();
      if (!snapshot.empty) {
        const list: any[] = [];
        snapshot.forEach((doc: any) => {
          list.push({ ...doc.data() });
        });

        // Sort items appropriately
        if (item.key === 'blogs') {
          list.sort((a, b) => {
            const timeA = a.createdAt || a.date || a.id || "";
            const timeB = b.createdAt || b.date || b.id || "";
            return timeA > timeB ? -1 : 1;
          });
        } else if (['consultations', 'messages', 'applications', 'subscribers', 'logs'].includes(item.key)) {
          list.sort((a, b) => {
            const timeA = a.createdAt || a.timestamp || a.id || "";
            const timeB = b.createdAt || b.timestamp || b.id || "";
            return timeA > timeB ? -1 : (timeA < timeB ? 1 : 0);
          });
        } else {
          list.sort((a, b) => (a.id > b.id ? 1 : -1));
        }

        (DB as any)[item.key] = list;
      } else {
        const initialList = (DB as any)[item.key];
        if (initialList && initialList.length > 0) {
          console.log(`Seeding Firestore collection '${item.coll}' with ${initialList.length} items...`);
          const batch = firestoreDb.batch();
          for (const record of initialList) {
            const docId = record.id || `doc-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            const docRef = firestoreDb.collection(item.coll).doc(docId);
            batch.set(docRef, record);
          }
          await batch.commit();
        }
      }
    }
    console.log("Database cache synced successfully from Firestore.");
  } catch (err) {
    handleFirestoreError(err, "syncFromFirestore");
  }
}

async function initFirestore() {
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      console.warn("firebase-applet-config.json not found. Firestore will not be initialized.");
      return;
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const app = initAdminApp({
      projectId: config.projectId,
    });
    let dbId = config.firestoreDatabaseId;
    if (!dbId || dbId === 'default' || dbId === '(default)') {
      dbId = undefined;
    }
    firestoreDb = getFirestore(app, dbId);
    console.log(`Firebase Admin initialized successfully with project: ${config.projectId}, DB: ${dbId || '(default)'}`);
    
    await syncFromFirestore();
  } catch (err) {
    console.error("Failed to initialize Firebase/Firestore:", err);
  }
}

// Load or Initialize database file
async function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      const loaded = JSON.parse(data);
      DB = { ...DB, ...loaded };
      console.log(`Database loaded successfully from ${DB_FILE}`);
    } else {
      saveDatabase();
      writeLog("Database Initialization", "Initial database seed created successfully.");
      console.log(`Created new database and seeded data at ${DB_FILE}`);
    }
  } catch (err) {
    console.error("Error loading database:", err);
  }
  await initFirestore();
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(DB, null, 2), 'utf8');
  } catch (err) {
    console.error("Error saving database:", err);
  }
}

function writeLog(action: string, details: string) {
  const logEntry: SystemLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  DB.logs.unshift(logEntry);
  if (DB.logs.length > 500) {
    DB.logs = DB.logs.slice(0, 500); // Caps logs at 500 entries
  }
  saveDatabase();
  firestoreAddOrUpdateRecord('logs', logEntry);
}

loadDatabase();

// --- API ENDPOINTS ---

// Session / Security Token Verification Middleware
const ADMIN_TOKEN = "richards-secure-session-token-2026";
function checkAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ") && authHeader.substring(7) === ADMIN_TOKEN) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized access to admin panel resources." });
  }
}

// 1. Authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === "admin@richardsrealty.com" && password === "richardsadmin") {
    writeLog("Admin Authorization", `Successful login for account: ${email}`);
    res.json({ token: ADMIN_TOKEN, user: { email, role: "Administrator" } });
  } else {
    writeLog("Admin Authorization Failure", `Failed login attempt for account: ${email}`);
    res.status(401).json({ error: "Invalid administrator credentials." });
  }
});

app.post('/api/auth/verify', (req, res) => {
  const { token } = req.body;
  if (token === ADMIN_TOKEN) {
    res.json({ valid: true, user: { email: "admin@richardsrealty.com", role: "Administrator" } });
  } else {
    res.json({ valid: false });
  }
});

// 2. Settings
app.get('/api/settings', (req, res) => {
  res.json(DB.settings);
});

app.put('/api/settings', checkAdminAuth, (req, res) => {
  DB.settings = req.body;
  saveDatabase();
  firestoreSaveSettings();
  writeLog("Update Settings", "Corporate website parameters and social linkages updated.");
  res.json(DB.settings);
});

// 3. Consultation Requests (Public Create, Admin Read/Update/Delete)
app.get('/api/consultations', checkAdminAuth, (req, res) => {
  res.json(DB.consultations);
});

app.post('/api/consultations', (req, res) => {
  const { fullName, phone, email, company, serviceNeeded, preferredDate, preferredTime, message, captcha } = req.body;
  
  // Basic captcha verification check (simple sum checking)
  if (!captcha || parseInt(captcha) !== 9) {
    return res.status(400).json({ error: "Spam protection validation failed. (5 + 4 does not equal your answer)" });
  }

  if (!fullName || !email || !serviceNeeded || !preferredDate) {
    return res.status(400).json({ error: "Required fields are missing from consultation request." });
  }

  const newRequest: ConsultationRequest = {
    id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    fullName,
    phone: phone || "",
    email,
    company: company || "",
    serviceNeeded,
    preferredDate,
    preferredTime: preferredTime || "",
    message: message || "",
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  DB.consultations.unshift(newRequest);
  saveDatabase();
  firestoreAddOrUpdateRecord('consultations', newRequest);
  writeLog("Consultation Booked", `New consultation scheduled by ${fullName} (${company || "Individual"}) regarding ${serviceNeeded}.`);
  
  // Note: Administrator email is mocked as sent in log
  console.log(`[EMAIL NOTIFICATION SENT TO ADMIN] New consultation booking request from ${fullName} for ${serviceNeeded}.`);
  
  res.status(201).json({ success: true, request: newRequest });
});

app.put('/api/consultations/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const index = DB.consultations.findIndex(c => c.id === id);
  if (index !== -1) {
    DB.consultations[index].status = status;
    saveDatabase();
    firestoreAddOrUpdateRecord('consultations', DB.consultations[index]);
    writeLog("Update Consultation Status", `Consultation request id ${id} marked as ${status}.`);
    res.json(DB.consultations[index]);
  } else {
    res.status(404).json({ error: "Consultation record not found." });
  }
});

app.delete('/api/consultations/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const index = DB.consultations.findIndex(c => c.id === id);
  if (index !== -1) {
    const deleted = DB.consultations.splice(index, 1);
    saveDatabase();
    firestoreDeleteRecord('consultations', id);
    writeLog("Deleted Consultation Request", `Removed consultation record associated with ${deleted[0].fullName}.`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Consultation record not found." });
  }
});

// 4. Contact Messages (Public Create, Admin Read/Update/Delete)
app.get('/api/messages', checkAdminAuth, (req, res) => {
  res.json(DB.messages);
});

app.post('/api/messages', (req, res) => {
  const { fullName, email, phone, subject, message, captcha } = req.body;

  if (!captcha || parseInt(captcha) !== 12) {
    return res.status(400).json({ error: "Spam protection validation failed. (8 + 4 does not equal your answer)" });
  }

  if (!fullName || !email || !subject || !message) {
    return res.status(400).json({ error: "Required input parameters are missing." });
  }

  const newMessage: ContactMessage = {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    fullName,
    email,
    phone: phone || "",
    subject,
    message,
    status: 'unread',
    createdAt: new Date().toISOString()
  };

  DB.messages.unshift(newMessage);
  saveDatabase();
  firestoreAddOrUpdateRecord('messages', newMessage);
  writeLog("Contact Message Received", `New contact form inquiry from ${fullName} on subject: "${subject}".`);
  
  res.status(201).json({ success: true, message: newMessage });
});

app.put('/api/messages/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const index = DB.messages.findIndex(m => m.id === id);
  if (index !== -1) {
    DB.messages[index].status = status;
    saveDatabase();
    firestoreAddOrUpdateRecord('messages', DB.messages[index]);
    writeLog("Message Status Updated", `Contact message from ${DB.messages[index].fullName} marked as ${status}.`);
    res.json(DB.messages[index]);
  } else {
    res.status(404).json({ error: "Contact message record not found." });
  }
});

app.delete('/api/messages/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const index = DB.messages.findIndex(m => m.id === id);
  if (index !== -1) {
    const deleted = DB.messages.splice(index, 1);
    saveDatabase();
    firestoreDeleteRecord('messages', id);
    writeLog("Deleted Contact Message", `Deleted message from ${deleted[0].fullName}.`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Contact message record not found." });
  }
});

// 5. Blogs (Public Read, Admin Write/Edit/Delete)
app.get('/api/blogs', (req, res) => {
  res.json(DB.blogs);
});

app.post('/api/blogs', checkAdminAuth, (req, res) => {
  const { title, category, shortDesc, content, image, author, readTime } = req.body;
  if (!title || !content || !category) {
    return res.status(400).json({ error: "Missing required blog publication elements." });
  }

  const newBlog: BlogPost = {
    id: `blog-${Date.now()}`,
    title,
    category,
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    shortDesc: shortDesc || content.substring(0, 150) + "...",
    content,
    image: image || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    author: author || "Richards Realty Advisory",
    readTime: readTime || "5 min read"
  };

  DB.blogs.unshift(newBlog);
  saveDatabase();
  firestoreAddOrUpdateRecord('blogs', newBlog);
  writeLog("Created Blog Post", `New insight article published: "${title}".`);
  res.status(201).json(newBlog);
});

app.put('/api/blogs/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const { title, category, shortDesc, content, image, author, readTime } = req.body;

  const index = DB.blogs.findIndex(b => b.id === id);
  if (index !== -1) {
    DB.blogs[index] = {
      ...DB.blogs[index],
      title: title || DB.blogs[index].title,
      category: category || DB.blogs[index].category,
      shortDesc: shortDesc || DB.blogs[index].shortDesc,
      content: content || DB.blogs[index].content,
      image: image || DB.blogs[index].image,
      author: author || DB.blogs[index].author,
      readTime: readTime || DB.blogs[index].readTime
    };
    saveDatabase();
    firestoreAddOrUpdateRecord('blogs', DB.blogs[index]);
    writeLog("Updated Blog Post", `Insight article modified: "${DB.blogs[index].title}".`);
    res.json(DB.blogs[index]);
  } else {
    res.status(404).json({ error: "Blog post record not found." });
  }
});

app.delete('/api/blogs/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const index = DB.blogs.findIndex(b => b.id === id);
  if (index !== -1) {
    const deleted = DB.blogs.splice(index, 1);
    saveDatabase();
    firestoreDeleteRecord('blogs', id);
    writeLog("Deleted Blog Post", `Insight article removed: "${deleted[0].title}".`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Blog post record not found." });
  }
});

// 6. Team (Public Read, Admin Write/Edit/Delete)
app.get('/api/team', (req, res) => {
  res.json(DB.team);
});

app.post('/api/team', checkAdminAuth, (req, res) => {
  const { name, position, bio, image, linkedin, email } = req.body;
  if (!name || !position) {
    return res.status(400).json({ error: "Missing required personnel fields." });
  }

  const newMember: TeamMember = {
    id: `team-${Date.now()}`,
    name,
    position,
    bio: bio || "",
    image: image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80",
    linkedin: linkedin || "",
    email: email || ""
  };

  DB.team.push(newMember);
  saveDatabase();
  firestoreAddOrUpdateRecord('team', newMember);
  writeLog("Added Team Member", `New consultant/partner added: ${name} (${position}).`);
  res.status(201).json(newMember);
});

app.put('/api/team/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const { name, position, bio, image, linkedin, email } = req.body;

  const index = DB.team.findIndex(t => t.id === id);
  if (index !== -1) {
    DB.team[index] = {
      ...DB.team[index],
      name: name || DB.team[index].name,
      position: position || DB.team[index].position,
      bio: bio || DB.team[index].bio,
      image: image || DB.team[index].image,
      linkedin: linkedin || DB.team[index].linkedin,
      email: email || DB.team[index].email
    };
    saveDatabase();
    firestoreAddOrUpdateRecord('team', DB.team[index]);
    writeLog("Updated Team Member", `Personnel profile updated: ${DB.team[index].name}.`);
    res.json(DB.team[index]);
  } else {
    res.status(404).json({ error: "Team member not found." });
  }
});

app.delete('/api/team/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const index = DB.team.findIndex(t => t.id === id);
  if (index !== -1) {
    const deleted = DB.team.splice(index, 1);
    saveDatabase();
    firestoreDeleteRecord('team', id);
    writeLog("Deleted Team Member", `Personnel profile removed: ${deleted[0].name}.`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Team member not found." });
  }
});

// 7. Gallery (Public Read, Admin Write/Delete)
app.get('/api/gallery', (req, res) => {
  res.json(DB.gallery);
});

app.post('/api/gallery', checkAdminAuth, (req, res) => {
  const { title, category, image } = req.body;
  if (!title || !category || !image) {
    return res.status(400).json({ error: "Required fields are missing from asset upload request." });
  }

  const newItem: GalleryItem = {
    id: `gal-${Date.now()}`,
    title,
    category,
    image
  };

  DB.gallery.unshift(newItem);
  saveDatabase();
  firestoreAddOrUpdateRecord('gallery', newItem);
  writeLog("Added Gallery Asset", `New gallery image registered in category [${category}]: "${title}".`);
  res.status(201).json(newItem);
});

app.delete('/api/gallery/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const index = DB.gallery.findIndex(g => g.id === id);
  if (index !== -1) {
    const deleted = DB.gallery.splice(index, 1);
    saveDatabase();
    firestoreDeleteRecord('gallery', id);
    writeLog("Deleted Gallery Asset", `Removed gallery asset: "${deleted[0].title}".`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Gallery asset not found." });
  }
});

// 8. Testimonials (Public Read, Admin Write/Edit/Delete)
app.get('/api/testimonials', (req, res) => {
  res.json(DB.testimonials);
});

app.post('/api/testimonials', checkAdminAuth, (req, res) => {
  const { name, company, review, rating } = req.body;
  if (!name || !review || !rating) {
    return res.status(400).json({ error: "Missing required feedback fields." });
  }

  const newTestimonial: Testimonial = {
    id: `test-${Date.now()}`,
    name,
    company: company || "Corporate Client",
    review,
    rating: parseInt(rating) || 5
  };

  DB.testimonials.unshift(newTestimonial);
  saveDatabase();
  firestoreAddOrUpdateRecord('testimonials', newTestimonial);
  writeLog("Added Testimonial", `New reference feedback registered from: ${name} (${company}).`);
  res.status(201).json(newTestimonial);
});

app.put('/api/testimonials/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const { name, company, review, rating } = req.body;

  const index = DB.testimonials.findIndex(t => t.id === id);
  if (index !== -1) {
    DB.testimonials[index] = {
      ...DB.testimonials[index],
      name: name || DB.testimonials[index].name,
      company: company || DB.testimonials[index].company,
      review: review || DB.testimonials[index].review,
      rating: rating ? parseInt(rating) : DB.testimonials[index].rating
    };
    saveDatabase();
    firestoreAddOrUpdateRecord('testimonials', DB.testimonials[index]);
    writeLog("Updated Testimonial", `Reference feedback updated: client ${DB.testimonials[index].name}.`);
    res.json(DB.testimonials[index]);
  } else {
    res.status(404).json({ error: "Testimonial not found." });
  }
});

app.delete('/api/testimonials/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const index = DB.testimonials.findIndex(t => t.id === id);
  if (index !== -1) {
    const deleted = DB.testimonials.splice(index, 1);
    saveDatabase();
    firestoreDeleteRecord('testimonials', id);
    writeLog("Deleted Testimonial", `Reference feedback deleted for client: ${deleted[0].name}.`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Testimonial record not found." });
  }
});

// 9. Careers & Applications (Public Read/Apply, Admin Write/Edit/Delete, Applications Read)
app.get('/api/careers', (req, res) => {
  res.json(DB.careers);
});

app.post('/api/careers', checkAdminAuth, (req, res) => {
  const { title, department, location, type, description, requirements } = req.body;
  if (!title || !department || !description) {
    return res.status(400).json({ error: "Required fields for job listing are missing." });
  }

  const newJob: JobListing = {
    id: `car-${Date.now()}`,
    title,
    department,
    location: location || "San Francisco, CA",
    type: type || "Full-time",
    description,
    requirements: Array.isArray(requirements) ? requirements : (requirements ? requirements.split('\n').filter((l: string) => l.trim()) : []),
    status: "active",
    createdAt: new Date().toISOString()
  };

  DB.careers.unshift(newJob);
  saveDatabase();
  firestoreAddOrUpdateRecord('careers', newJob);
  writeLog("Published Job Listing", `New career opportunity created: "${title}" in ${department}.`);
  res.status(201).json(newJob);
});

app.put('/api/careers/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const { title, department, location, type, description, requirements, status } = req.body;

  const index = DB.careers.findIndex(c => c.id === id);
  if (index !== -1) {
    DB.careers[index] = {
      ...DB.careers[index],
      title: title || DB.careers[index].title,
      department: department || DB.careers[index].department,
      location: location || DB.careers[index].location,
      type: type || DB.careers[index].type,
      description: description || DB.careers[index].description,
      requirements: Array.isArray(requirements) ? requirements : (requirements ? requirements.split('\n').filter((l: string) => l.trim()) : DB.careers[index].requirements),
      status: status || DB.careers[index].status
    };
    saveDatabase();
    firestoreAddOrUpdateRecord('careers', DB.careers[index]);
    writeLog("Updated Job Listing", `Career vacancy modified: "${DB.careers[index].title}".`);
    res.json(DB.careers[index]);
  } else {
    res.status(404).json({ error: "Job listing not found." });
  }
});

app.delete('/api/careers/:id', checkAdminAuth, (req, res) => {
  const { id } = req.params;
  const index = DB.careers.findIndex(c => c.id === id);
  if (index !== -1) {
    const deleted = DB.careers.splice(index, 1);
    saveDatabase();
    firestoreDeleteRecord('careers', id);
    writeLog("Deleted Job Listing", `Career vacancy withdrawn: "${deleted[0].title}".`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Job listing not found." });
  }
});

app.get('/api/applications', checkAdminAuth, (req, res) => {
  res.json(DB.applications);
});

app.post('/api/careers/:id/apply', (req, res) => {
  const { id } = req.params;
  const { fullName, email, phone, coverLetter, resumeName, resumeBase64 } = req.body;

  if (!fullName || !email || !phone) {
    return res.status(400).json({ error: "All applicant personal data fields must be completed." });
  }

  const job = DB.careers.find(c => c.id === id);
  if (!job) {
    return res.status(404).json({ error: "Job position not found or has been closed." });
  }

  const newApplication: JobApplication = {
    id: `app-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    jobId: id,
    jobTitle: job.title,
    fullName,
    email,
    phone,
    coverLetter: coverLetter || "",
    resumeUrl: resumeName ? `MOCK_STORE/${resumeName} (${(resumeBase64?.length ? Math.round(resumeBase64.length / 1024) : 124)} KB)` : "No resume submitted",
    createdAt: new Date().toISOString()
  };

  DB.applications.unshift(newApplication);
  saveDatabase();
  firestoreAddOrUpdateRecord('applications', newApplication);
  writeLog("Job Application Received", `Application submitted by ${fullName} for position: "${job.title}".`);
  res.status(201).json({ success: true, application: newApplication });
});

// 10. Newsletter Subscribers (Public Add, Admin Read)
app.get('/api/subscribers', checkAdminAuth, (req, res) => {
  res.json(DB.subscribers);
});

app.post('/api/subscribers', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: "Please input a valid corporate email address." });
  }

  const exists = DB.subscribers.some(s => s.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(200).json({ success: true, message: "Email is already subscribed to insights newsletter." });
  }

  const newSubscriber: NewsletterSubscriber = {
    id: `sub-${Date.now()}`,
    email: email.toLowerCase(),
    createdAt: new Date().toISOString()
  };

  DB.subscribers.unshift(newSubscriber);
  saveDatabase();
  firestoreAddOrUpdateRecord('subscribers', newSubscriber);
  writeLog("Newsletter Subscriber Added", `Email registered for insights notifications: ${email}`);
  res.status(201).json({ success: true });
});

// 11. System Logs (Admin only)
app.get('/api/logs', checkAdminAuth, (req, res) => {
  res.json(DB.logs);
});

// 12. Backup & Restore (Admin only)
app.get('/api/admin/backup', checkAdminAuth, (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=richards_realty_backup.json');
  res.send(JSON.stringify(DB, null, 2));
});

app.post('/api/admin/restore', checkAdminAuth, async (req, res) => {
  const backupData = req.body;
  if (backupData && typeof backupData === 'object' && backupData.settings) {
    DB = { ...DB, ...backupData };
    saveDatabase();
    
    try {
      await firestoreSaveSettings();
      const keysToSync = ['blogs', 'team', 'gallery', 'testimonials', 'careers', 'consultations', 'messages', 'applications', 'subscribers', 'logs'];
      for (const key of keysToSync) {
        await firestoreBulkSetCollection(key, (DB as any)[key]);
      }
    } catch (err) {
      console.error("Firestore restore bulk write failed:", err);
    }

    writeLog("Database Restore", "Complete database recovery from administrative JSON backup.");
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Invalid backup document format." });
  }
});

app.post('/api/admin/refresh', checkAdminAuth, async (req, res) => {
  try {
    await syncFromFirestore();
    writeLog("Database Refresh", "Administrative cache updated to the newest updates from Firestore.");
    res.json({ success: true });
  } catch (err: any) {
    console.error("Manual Firestore sync failed:", err);
    res.status(500).json({ error: "Failed to refresh from Firestore database." });
  }
});

// --- VITE DEV SERVER AND STATIC ASSETS CLIENT MOUNTING ---
async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
