import {
  BlogPost,
  GalleryItem,
  JobListing,
  TeamMember,
  Testimonial,
  WebsiteSettings
} from '../types';

export const VALID_TABS = new Set([
  'home',
  'about',
  'services',
  'mission',
  'team',
  'gallery',
  'blog',
  'careers',
  'faq',
  'contact',
  'consultation',
  'apply',
  'track',
  'privacy',
  'terms',
  'cookies',
  'disclaimer',
  'sitemap'
]);

export const DEFAULT_WEBSITE_SETTINGS: WebsiteSettings = {
  general: {
    companyName: 'Howard Homes LLC',
    phone: '+1 (800) 555-0190',
    email: 'consultation.howardhomes@hotmail.com',
    address: '1995 Woodlake Dr, Orange Park, FL 32003, USA',
    workingHours: 'Mon - Fri: 8:00 AM - 6:00 PM (PST), Sat: By Appointment',
    whatsappNumber: '18005550190',
    googleMapIframe: ''
  },
  seo: {
    metaTitle: 'Howard Homes LLC | Elite Corporate Real Estate Advisory & Valuation',
    metaDescription:
      'Howard Homes LLC is a premier corporate real estate consultancy. We provide investment advisory, property valuation, documentation, and facility management with absolute integrity.',
    openGraphImage:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&h=630&q=80'
  },
  social: {
    linkedin: 'https://linkedin.com/company/howardhomes',
    twitter: 'https://twitter.com/howardhomes',
    facebook: 'https://facebook.com/howardhomes',
    instagram: 'https://instagram.com/howardhomes'
  },
  content: {
    heroHeadline: 'Elite Corporate Real Estate & Valuation',
    heroSubheadline:
      'Strategic advisory, regulatory compliance, and high-end brokerage for the corporate enterprise.',
    heroImage:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80',
    aboutHeadline: 'The Standard of Commercial Excellence',
    aboutText:
      'Howard Homes LLC serves the elite echelons of corporate real estate. Our firm provides uncompromising analytical precision, from RICS-certified valuations to facility management consultation. We prioritize data-driven strategies, securing optimal transaction values while navigating complex regulatory landscapes.',
    aboutImage:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    servicesHeadline: 'Strategic Consulting Portfolios',
    servicesSubheadline:
      'Our expertise spans across critical corporate real estate functions, maximizing portfolio performance.',
    missionHeadline: 'Our Mission & Vision',
    missionText:
      "How Howard Homes LLC builds trust and sets premium standards across California's real estate domains.",
    teamHeadline: 'Meet Our Professional Team',
    teamSubheadline:
      'Bespoke transactional advisors, RICS chartered valuations surveyors, and municipal zoning advocates forming the core of Howard Homes LLC.',
    faqs: [
      {
        q: 'What services do you provide?',
        a: 'We provide specialized corporate real estate consultancy, certified RICS-compliant asset valuations, institutional investment underwriting, facility operational advice, local land registry document audits, development feasibility analysis, and zoning legal diagnostics.',
        category: 'Corporate'
      },
      {
        q: 'How do I book a confidential corporate consultation?',
        a: 'You can schedule a private briefing through our secure online scheduler or contact our senior partners directly via our corporate email. All initial discussions are bound by strict professional confidentiality agreements.',
        category: 'Corporate'
      },
      {
        q: 'Do you operate as a broker or property listing marketplace?',
        a: 'No. Howard Homes LLC maintains strict fiduciary independence. We do not engage in retail brokerage, property management, or commercial listing platforms, ensuring our advice remains entirely objective.',
        category: 'Corporate'
      },
      {
        q: 'Are your valuation reports RICS Red Book compliant?',
        a: 'Yes. All formal property valuations are executed by Royal Institution of Chartered Surveyors (RICS) qualified chartered surveyors adhering to international valuation standards (IVS).',
        category: 'Valuations'
      },
      {
        q: 'What valuation methodologies do you employ for income-producing assets?',
        a: 'We utilize discounted cash flow (DCF) modeling, direct capitalization rate analysis, comparable sales metrics, and replacement cost approaches depending on asset class and market liquidity.',
        category: 'Valuations'
      },
      {
        q: 'What regulatory and municipal standards govern your legal audits?',
        a: 'Our document and zoning audits operate in strict alignment with California real estate statutes, municipal zoning codes, environmental review mandates, and title verification protocols.',
        category: 'Legal'
      }
    ]
  },
  styling: {
    primaryColor: '#0A1D37',
    accentColor: '#C5A02E',
    backgroundColor: '#ffffff',
    fontFamily: 'font-sans',
    borderRadius: 'rounded-none',
    animationStyle: 'animate-in fade-in duration-200'
  }
};

export const DEFAULT_PUBLIC_BLOGS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Navigating Commercial Real Estate in a High-Interest Rate Environment',
    category: 'Market Insights',
    date: 'July 12, 2026',
    shortDesc:
      'An analytical study on capital allocation, cap rates adjustment, and debt restructuring strategies for enterprise portfolio managers.',
    content:
      'The landscape of commercial real estate is undergoing a structural transition as global interest rates remain elevated compared to the previous decade. For institutional owners and family offices, this shifts the strategic focus from aggressive expansion to yield optimization, asset repositioning, and debt maturity management.\n\nIn this brief, our advisory committee analyzes why premium core office and industrial spaces are showing resilience, and how corporate tenants can restructure their lease footprints to maximize efficiency.',
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    author: 'Richard V. Henderson, Managing Partner',
    readTime: '6 min read'
  },
  {
    id: 'blog-2',
    title: 'The Valuation Paradigm: Aligning ESG Criteria with Asset Value',
    category: 'Valuation & Advisory',
    date: 'June 28, 2026',
    shortDesc:
      'How modern environmental standards, sustainability certifications, and energy efficiency ratings affect RICS-compliant valuations.',
    content:
      'Environmental, Social, and Governance (ESG) criteria are no longer auxiliary line items in corporate reports—they are direct drivers of risk premiums and capitalization rates.\n\nOur valuation team lays down the quantitative framework used to incorporate carbon tax liabilities, energy retrofit expenditures, and tenant demand shifts directly into Discounted Cash Flow (DCF) valuation models.',
    image:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    author: 'Elena Rostova, Head of Valuations',
    readTime: '8 min read'
  },
  {
    id: 'blog-3',
    title: 'Corporate Lease Restructuring: Strategies for the Post-Hybrid Workplace',
    category: 'Corporate Solutions',
    date: 'May 15, 2026',
    shortDesc:
      'Practical methods for large enterprises to optimize their physical office footprint while maintaining high operational performance.',
    content:
      'The corporate headquarters is being redefined. With hybrid work patterns fully established, Fortune 500 enterprises are auditing their real estate assets to eliminate excess square footage while creating collaborative hub spaces.',
    image:
      'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
    author: 'Marcus Vance, Director of Corporate Consultancy',
    readTime: '5 min read'
  }
];

export const DEFAULT_PUBLIC_TEAM: TeamMember[] = [
  {
    id: 'team-1',
    name: 'Michael Howard',
    position: 'Owner & Broker',
    bio: 'With over 25 years of institutional real estate consultancy, Michael leads the strategic vision at Howard Homes LLC.',
    image:
      'https://res.cloudinary.com/dctaerfma/image/upload/v1794418821/WhatsApp_Image_2026-11-11_at_11.19.58_AM_c9zxzx.jpg',
    linkedin: 'https://linkedin.com/in/michaelhoward',
    email: 'm.howard@howardhomes.com'
  },
  {
    id: 'team-2',
    name: 'Elena Rostova, MRICS',
    position: 'Partner, Head of Valuations',
    bio: 'Elena is a chartered valuation surveyor with 18 years of experience heading our RICS-compliant valuations department.',
    image:
      'https://res.cloudinary.com/dctaerfma/image/upload/v1794418822/WhatsApp_Image_2026-11-11_at_11.20.39_AM_uzydfu.jpg',
    linkedin: 'https://linkedin.com/in/elenarostova',
    email: 'e.rostova@howardhomes.com'
  },
  {
    id: 'team-3',
    name: 'Richard V. Henderson',
    position: 'Director of Corporate Consultancy',
    bio: 'Richard has structured lease-and-portfolio transactions for Fortune 500 tech and industrial leaders.',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
    linkedin: 'https://linkedin.com/in/richardvance',
    email: 'richard.vance@howardhomes.com'
  }
];

export const DEFAULT_PUBLIC_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Howard Homes Headquarters - Boardroom',
    category: 'Office',
    image:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'gal-2',
    title: 'Institutional Investor Round Table',
    category: 'Meetings',
    image:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'gal-3',
    title: 'Premium Skyline Commercial Landmark under Advisory',
    category: 'Projects',
    image:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'
  }
];

export const DEFAULT_PUBLIC_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Executive Director',
    company: 'Apex Global Holdings',
    review:
      'Howard Homes LLC conducted a comprehensive valuation audit of our West Coast commercial real estate portfolio. Their RICS-certified reports were thorough and instrumental in our restructuring.',
    rating: 5
  },
  {
    id: 'test-2',
    name: 'VP of Asset Management',
    company: 'Metropolitan Insurance Group',
    review:
      'The investment advisory team at Howard Homes provides deep quantitative insights that go far beyond standard market reports.',
    rating: 5
  },
  {
    id: 'test-3',
    name: 'General Counsel',
    company: 'Vanguard Tech Properties',
    review:
      'Their land documentation assistance team guided us through an intricate municipal zoning and land registration audit with unmatched integrity.',
    rating: 5
  }
];

export const DEFAULT_PUBLIC_CAREERS: JobListing[] = [
  {
    id: 'car-1',
    title: 'Senior Real Estate Investment Analyst',
    department: 'Investment Advisory',
    location: 'San Francisco, CA (Hybrid)',
    type: 'Full-time',
    description:
      'Perform complex DCF modeling, underwriting, and macroeconomic risk analysis for corporate and institutional clients.',
    requirements: [
      '5+ years of experience in institutional real estate underwriting or investment banking',
      'Mastery of Argus Enterprise and advanced Excel financial modeling'
    ],
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export function mergeWebsiteSettings(raw: unknown): WebsiteSettings {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_WEBSITE_SETTINGS;
  }
  const incoming = raw as Partial<WebsiteSettings>;
  return {
    general: {
      ...DEFAULT_WEBSITE_SETTINGS.general,
      ...(incoming.general && typeof incoming.general === 'object' ? incoming.general : {})
    },
    seo: {
      ...DEFAULT_WEBSITE_SETTINGS.seo,
      ...(incoming.seo && typeof incoming.seo === 'object' ? incoming.seo : {})
    },
    social: {
      ...DEFAULT_WEBSITE_SETTINGS.social,
      ...(incoming.social && typeof incoming.social === 'object' ? incoming.social : {})
    },
    content: {
      ...DEFAULT_WEBSITE_SETTINGS.content,
      ...(incoming.content && typeof incoming.content === 'object' ? incoming.content : {}),
      faqs: Array.isArray(incoming.content?.faqs)
        ? incoming.content.faqs
        : DEFAULT_WEBSITE_SETTINGS.content?.faqs
    },
    styling: {
      ...DEFAULT_WEBSITE_SETTINGS.styling,
      ...(incoming.styling && typeof incoming.styling === 'object' ? incoming.styling : {})
    }
  };
}
