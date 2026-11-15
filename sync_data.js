
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

async function run() {
  console.log('Starting sync script...');

  // 1. Load Firebase Config
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (!fs.existsSync(configPath)) {
    console.error('Firebase config not found!');
    process.exit(1);
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // 2. Initialize Firebase Admin
  admin.initializeApp({
    projectId: config.projectId,
  });
  const db = admin.firestore();
  console.log('Firebase Admin initialized.');

  // 3. Define New Data (Extracted from server.ts)
  const newTeam = [
    {
      id: "team-1",
      name: "Michael Howard",
      position: "Owner & Broker",
      bio: "With over 25 years of institutional real estate consultancy, Michael leads the strategic vision at Howard Homes LLC. Former Senior Vice President of Institutional Capital Markets at a top global firm, he specializes in high-value asset valuation and commercial investment advisory.",
      image: "https://res.cloudinary.com/dctaerfma/image/upload/v1794418821/WhatsApp_Image_2026-11-11_at_11.19.58_AM_c9zxzx.jpg",
      linkedin: "https://linkedin.com/in/michaelhoward",
      email: "m.howard@howardhomes.com"
    },
    {
      id: "team-2",
      name: "Elena Rostova, MRICS",
      position: "Partner, Head of Valuations",
      bio: "Elena is a chartered valuation surveyor with 18 years of experience. She heads our RICS-compliant valuations department, providing certified asset valuation reports for financial institutions, national developers, and corporate audits.",
      image: "https://res.cloudinary.com/dctaerfma/image/upload/v1794418822/WhatsApp_Image_2026-11-11_at_11.20.39_AM_uzydfu.jpg",
      linkedin: "https://linkedin.com/in/elenarostova",
      email: "e.rostova@howardhomes.com"
    },
    {
      id: "team-3",
      name: "Richard V. Henderson",
      position: "Director of Corporate Consultancy",
      bio: "Richard has structured lease-and-portfolio transactions for Fortune 500 tech and industrial leaders. He leads our corporate advisory branch, advising clients on optimal corporate headquarters footprint planning and landlord-tenant strategies.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80",
      linkedin: "https://linkedin.com/in/richardvance",
      email: "richard.vance@howardhomes.com"
    },
    {
      id: "team-4",
      name: "Vanessa Palmer",
      position: "Real Estate Assistant",
      bio: "Vannessa Palmer is a dedicated and detail-oriented Real Estate Assistant committed to providing excellent administrative and client support. She assists with property listings, client inquiries, documentation, property viewings, and coordinating real estate transactions. With strong communication, organisational, and interpersonal skills, she helps ensure smooth daily operations while delivering a professional and positive experience for clients.",
      image: "https://res.cloudinary.com/dctaerfma/image/upload/v1794418821/WhatsApp_Image_2026-11-11_at_11.25.45_AM_j0zgeq.jpg",
      linkedin: "https://linkedin.com/in/vanessapalmer",
      email: "v.palmer@howardhomes.com"
    },
    {
      id: "team-5",
      name: "Kayle Conor",
      position: "Real Estate Assistant",
      bio: "Kayle Conor is a proactive and organised Real Estate Assistant with a passion for property management and client relations. She supports property listings, coordinates viewings, handles client inquiries, and assists with real estate documentation. Known for her professionalism, attention to detail, and excellent communication skills, she helps ensure efficient operations and client satisfaction.",
      image: "https://res.cloudinary.com/dctaerfma/image/upload/v1794418821/WhatsApp_Image_2026-11-11_at_11.26.50_AM_zwfbup.jpg",
      linkedin: "https://linkedin.com/in/kayleconor",
      email: "k.conor@howardhomes.com"
    },
    {
      id: "team-6",
      name: "Mike Geraad",
      position: "Maintenance Technician",
      bio: "Mike Geraad is a skilled and reliable Maintenance Technician responsible for ensuring that facilities, equipment, and building systems remain in excellent working condition. He handles routine inspections, repairs, troubleshooting, and preventive maintenance. With strong technical abilities, attention to detail, and a commitment to safety, he helps maintain a clean, safe, and efficient working environment.",
      image: "https://res.cloudinary.com/dctaerfma/image/upload/v1794418822/WhatsApp_Image_2026-11-11_at_11.27.22_AM_fskemx.jpg",
      linkedin: "https://linkedin.com/in/mikegeraad",
      email: "mike.g@howardhomes.com"
    }
  ];

  const newSettings = {
    general: {
      companyName: "Howard Homes LLC",
      phone: "+1 (800) 555-0190",
      email: "consulting@howardhomes.com",
      address: "600 Montgomery St, 41st Floor, San Francisco, CA 94111",
      workingHours: "Mon - Fri: 8:00 AM - 6:00 PM (PST), Sat: By Appointment",
      whatsappNumber: "18005550190",
      googleMapIframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.7853689405024!2d-122.40487002422204!3d37.79517597198124!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808580f49d8c3667%3A0x7d87f73cfeb88ec3!2sTransamerica%20Pyramid!5e0!3m2!1sen!2sus!4v1710000000000!5m2!1sen!2sus"
    },
    seo: {
      metaTitle: "Howard Homes LLC | Elite Corporate Real Estate Advisory & Valuation",
      metaDescription: "Howard Homes LLC is a premier corporate real estate consultancy. We provide investment advisory, property valuation, documentation, and facility management with absolute integrity.",
      openGraphImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&h=630&q=80"
    },
    social: {
      linkedin: "https://linkedin.com/company/howardhomes",
      twitter: "https://twitter.com/howardhomes",
      facebook: "https://facebook.com/howardhomes",
      instagram: "https://instagram.com/howardhomes"
    },
    content: {
      heroHeadline: "Elite Corporate Real Estate & Valuation",
      heroSubheadline: "Strategic advisory, regulatory compliance, and high-end brokerage for the corporate enterprise.",
      heroImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80",
      aboutHeadline: "The Standard of Commercial Excellence",
      aboutText: "Howard Homes LLC serves the elite echelons of corporate real estate. Our firm provides uncompromising analytical precision, from RICS-certified valuations to facility management consultation. We prioritize data-driven strategies, securing optimal transaction values while navigating complex regulatory landscapes.",
      aboutImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      servicesHeadline: "Strategic Consulting Portfolios",
      servicesSubheadline: "Our expertise spans across critical corporate real estate functions, maximizing portfolio performance.",
      missionHeadline: "Our Mission & Vision",
      missionText: "How Howard Homes LLC builds trust and sets premium standards across California's real estate domains.",
      teamHeadline: "Meet Our Professional Team",
      teamSubheadline: "Bespoke transactional advisors, RICS chartered valuations surveyors, and municipal zoning advocates forming the core of Howard Homes LLC.",
      faqs: [
        { q: 'What services do you provide?', a: 'We provide specialized corporate real estate consultancy, certified RICS-compliant asset valuations, institutional investment underwriting, facility operational advice, local land registry document audits, development feasibility analysis, and zoning legal diagnostics.', category: 'Corporate' },
        { q: 'How do I book a consultation?', a: 'You can book a direct briefing by clicking "Book Consultation" in our header or footer, completing our encrypted scheduler form, and providing your corporate objective details.', category: 'Corporate' },
        { q: 'Do you sell or manage properties?', a: 'No. We maintain strict structural fiduciaries: we never operate commercial listing marketplaces, property transactions, or landlord renting services.', category: 'Corporate' },
        { q: 'Do you provide certified valuation reports?', a: 'Yes. All our evaluations are completed by chartered valuations surveyors under the strict guidelines of the Royal Institution of Chartered Surveyors.', category: 'Valuations' },
        { q: 'What zoning and regulatory standards do you adhere to?', a: 'Our advisory operates in strict compliance with California municipal real estate codes, zoning ordinances, and even eminent domain guidelines.', category: 'Legal' },
        { q: 'Are your valuation reports accepted by banking syndicates?', a: 'Yes. All our commercial valuation books are RICS Red Book compliant and fully accepted by major financial institutions for asset financing and audit verification.', category: 'Valuations' }
      ],
      aboutPageHeadline: "Corporate Profile",
      aboutPageText: "Howard Homes LLC is a premier corporate advisory and valuation firm headquartered in San Francisco. We specialize in RICS-compliant valuations, commercial transaction consulting, and strategic facility management.",
      aboutPageStoryHeadline: "Our Legacy",
      aboutPageStoryText: "Founded on the principles of integrity and analytical rigor, Howard Homes LLC has spent over two decades advising institutional investors, family offices, and multinational corporations on their most complex real estate challenges.",
      aboutPageMessageHeadline: "A Word From the Managing Director",
      aboutPageMessageText: "Our commitment to excellence is unwavering. We navigate the complexities of the real estate market to deliver actionable insights and structural resilience for our clients.",
      aboutPageMessageAuthor: "Michael Howard, Managing Director",
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
      footerText: "Howard Homes LLC operates as an accredited commercial advisory firm. All client engagement agreements are subjected to standard California municipal oversight and financial disclosure procedures. This website serves purely as a corporate informational directory.",
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

  // 4. Update Firestore
  console.log('Updating Firestore...');

  // Update Settings
  await db.collection('config').doc('settings').set(newSettings);
  console.log('Settings updated in Firestore.');

  // Update Team
  const teamColl = db.collection('team');
  const oldTeamSnap = await teamColl.get();
  const batch = db.batch();
  oldTeamSnap.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  console.log('Old team members deleted from Firestore.');

  const addBatch = db.batch();
  newTeam.forEach(member => {
    const ref = teamColl.doc(member.id);
    addBatch.set(ref, member);
  });
  await addBatch.commit();
  console.log('New team members added to Firestore.');

  // 5. Update local server_data.json
  const dbFilePath = path.join(process.cwd(), 'server_data.json');
  if (fs.existsSync(dbFilePath)) {
    const dbData = JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
    dbData.settings = newSettings;
    dbData.team = newTeam;
    fs.writeFileSync(dbFilePath, JSON.stringify(dbData, null, 2), 'utf8');
    console.log('Local server_data.json updated.');
  }

  console.log('Sync completed successfully.');
}

run().catch(err => {
  console.error('Error during sync:', err);
  process.exit(1);
});
