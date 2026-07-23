const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace all hardcoded texts with new settings
const replacements = [
  // About Page
  {
    find: /<span className="text-\[#C5A02E\] font-sans text-xs uppercase tracking-widest font-bold block">CORPORATE PROFILE<\/span>\s*<h2 className="font-serif font-bold text-4xl text-\[#0A1D37\] tracking-tight">About \{settings\.general\?\.companyName \|\| "Richards Realty LLC"\}<\/h2>\s*<p className="max-w-2xl text-gray-500 text-sm">\s*A premium, client-aligned advisory specializing in commercial zoning audits, municipal registries, facility operations, and RICS Red Book compliant valuations\.\s*<\/p>/,
    replace: `<span className="text-[#C5A02E] font-sans text-xs uppercase tracking-widest font-bold block">CORPORATE PROFILE</span>
              <h2 className="font-serif font-bold text-4xl text-[#0A1D37] tracking-tight">{settings?.content?.aboutPageHeadline || \`About \${settings.general?.companyName || "Richards Realty LLC"}\`}</h2>
              <p className="max-w-2xl text-gray-500 text-sm whitespace-pre-line">
                {settings?.content?.aboutPageText || "A premium, client-aligned advisory specializing in commercial zoning audits, municipal registries, facility operations, and RICS Red Book compliant valuations."}
              </p>`
  },
  {
    find: /<h3 className="font-serif font-extrabold text-2xl text-\[#0A1D37\] tracking-tight">Our Corporate Story<\/h3>\s*<p className="text-gray-500 text-xs sm:text-sm leading-relaxed">\s*\{settings\.general\?\.companyName \|\| "Richards Realty LLC"\} was established as an independent alternative to large, transaction-driven real estate brokerages. Seeing a conflict of interest in agencies that represent both buyers and sellers while seeking sales commission incentives, we chose to design a fee-only, fiduciary-aligned corporate consultancy\.\s*<\/p>\s*<p className="text-gray-500 text-xs sm:text-sm leading-relaxed">\s*Over the past 25 years, we have structured acquisition reviews, verified environmental compliance criteria, secured zoning approvals, and published certified RICS valuation books for pension schemes, corporate boards, and family offices\.\s*<\/p>/,
    replace: `<h3 className="font-serif font-extrabold text-2xl text-[#0A1D37] tracking-tight">{settings?.content?.aboutPageStoryHeadline || "Our Corporate Story"}</h3>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {settings?.content?.aboutPageStoryText || \`\${settings.general?.companyName || "Richards Realty LLC"} was established as an independent alternative to large, transaction-driven real estate brokerages. Seeing a conflict of interest in agencies that represent both buyers and sellers while seeking sales commission incentives, we chose to design a fee-only, fiduciary-aligned corporate consultancy.\n\nOver the past 25 years, we have structured acquisition reviews, verified environmental compliance criteria, secured zoning approvals, and published certified RICS valuation books for pension schemes, corporate boards, and family offices.\`}
                </p>`
  },
  {
    find: /<span className="text-\[#C5A02E\] font-sans text-\[10px\] uppercase font-bold block tracking-wider">A Message from our CEO<\/span>\s*<p className="text-\[#0A1D37\] text-xs italic leading-relaxed">\s*"At \{settings\.general\?\.companyName \|\| "Richards Realty LLC"\}, we believe that real estate excellence is built upon absolute transparency and fiduciary loyalty. We have chosen never to participate in listing markets or transaction brokerages to maintain completely objective advice for our clients. That is our structural ceiling, and it remains our absolute pride."\s*<\/p>\s*<div className="pt-2 border-t border-gray-200">\s*<p className="text-xs font-bold text-\[#0A1D37\]">Richard V. Henderson<\/p>\s*<p className="text-\[10px\] text-slate-500 font-sans">Founding Partner & Chief Executive Officer<\/p>\s*<\/div>/,
    replace: `<span className="text-[#C5A02E] font-sans text-[10px] uppercase font-bold block tracking-wider">{settings?.content?.aboutPageMessageHeadline || "A Message from our CEO"}</span>
                <p className="text-[#0A1D37] text-xs italic leading-relaxed whitespace-pre-line">
                  "{settings?.content?.aboutPageMessageText || \`At \${settings.general?.companyName || "Richards Realty LLC"}, we believe that real estate excellence is built upon absolute transparency and fiduciary loyalty. We have chosen never to participate in listing markets or transaction brokerages to maintain completely objective advice for our clients. That is our structural ceiling, and it remains our absolute pride.\`}"
                </p>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs font-bold text-[#0A1D37]">{settings?.content?.aboutPageMessageAuthor?.split(',')[0] || "Richard V. Henderson"}</p>
                  <p className="text-[10px] text-slate-500 font-sans">{settings?.content?.aboutPageMessageAuthor?.split(',')[1]?.trim() || "Founding Partner & Chief Executive Officer"}</p>
                </div>`
  },
  // Mission Page core
  {
    find: /<h2 className="font-serif font-bold text-4xl text-\[#0A1D37\] tracking-tight">Our Core Mission<\/h2>\s*<p className="max-w-2xl text-gray-500 text-sm">\s*To provide impartial, highly analytical, and strategic real estate advisory services that protect and enhance our clients' corporate assets and investment portfolios.\s*<\/p>/,
    replace: `<h2 className="font-serif font-bold text-4xl text-[#0A1D37] tracking-tight">{settings?.content?.missionCoreHeadline || "Our Core Mission"}</h2>
              <p className="max-w-2xl text-gray-500 text-sm whitespace-pre-line">
                {settings?.content?.missionCoreText || "To provide impartial, highly analytical, and strategic real estate advisory services that protect and enhance our clients' corporate assets and investment portfolios."}
              </p>`
  },
  {
    find: /<h3 className="font-serif font-bold text-xl text-\[#0A1D37\]">Market Vision<\/h3>\s*<p className="text-gray-500 text-xs sm:text-sm leading-relaxed">\s*We envision a real estate landscape where transparency and rigorous data analysis drive every major transaction, ensuring sustainable growth and risk mitigation.\s*<\/p>/,
    replace: `<h3 className="font-serif font-bold text-xl text-[#0A1D37]">{settings?.content?.missionVisionHeadline || "Market Vision"}</h3>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {settings?.content?.missionVisionText || "We envision a real estate landscape where transparency and rigorous data analysis drive every major transaction, ensuring sustainable growth and risk mitigation."}
                </p>`
  },
  {
    find: /<h3 className="font-serif font-bold text-xl text-\[#0A1D37\]">Analytical Approach<\/h3>\s*<p className="text-gray-500 text-xs sm:text-sm leading-relaxed">\s*We employ advanced cash flow underwriting models and strict adherence to international valuation standards to deliver precise, defensible asset pricing.\s*<\/p>/,
    replace: `<h3 className="font-serif font-bold text-xl text-[#0A1D37]">{settings?.content?.missionApproachHeadline || "Analytical Approach"}</h3>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {settings?.content?.missionApproachText || "We employ advanced cash flow underwriting models and strict adherence to international valuation standards to deliver precise, defensible asset pricing."}
                </p>`
  },
  {
    find: /<h3 className="font-serif font-bold text-xl text-\[#0A1D37\]">Client Commitment<\/h3>\s*<p className="text-gray-500 text-xs sm:text-sm leading-relaxed">\s*We maintain absolute independence. By refusing to engage in brokerage or property management, we eliminate conflicts of interest, ensuring our advice is purely objective.\s*<\/p>/,
    replace: `<h3 className="font-serif font-bold text-xl text-[#0A1D37]">{settings?.content?.missionCommitmentHeadline || "Client Commitment"}</h3>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                  {settings?.content?.missionCommitmentText || "We maintain absolute independence. By refusing to engage in brokerage or property management, we eliminate conflicts of interest, ensuring our advice is purely objective."}
                </p>`
  },
  // Gallery
  {
    find: /<h2 className="font-serif font-bold text-4xl text-\[#0A1D37\] tracking-tight">Corporate Gallery<\/h2>\s*<p className="max-w-2xl text-gray-500 text-sm">\s*Explore our operational footprint, client engagements, and corporate events across California.\s*<\/p>/,
    replace: `<h2 className="font-serif font-bold text-4xl text-[#0A1D37] tracking-tight">{settings?.content?.galleryHeadline || "Corporate Gallery"}</h2>
              <p className="max-w-2xl text-gray-500 text-sm whitespace-pre-line">
                {settings?.content?.gallerySubheadline || "Explore our operational footprint, client engagements, and corporate events across California."}
              </p>`
  },
  // Blog
  {
    find: /<h2 className="font-serif font-bold text-4xl text-\[#0A1D37\] tracking-tight">Market Insights<\/h2>\s*<p className="max-w-2xl text-gray-500 text-sm">\s*Expert analysis, economic updates, and strategic perspectives on the commercial real estate landscape.\s*<\/p>/,
    replace: `<h2 className="font-serif font-bold text-4xl text-[#0A1D37] tracking-tight">{settings?.content?.blogHeadline || "Market Insights"}</h2>
              <p className="max-w-2xl text-gray-500 text-sm whitespace-pre-line">
                {settings?.content?.blogSubheadline || "Expert analysis, economic updates, and strategic perspectives on the commercial real estate landscape."}
              </p>`
  },
  // Careers
  {
    find: /<h2 className="font-serif font-bold text-4xl text-\[#0A1D37\] tracking-tight">Career Opportunities<\/h2>\s*<p className="max-w-2xl text-gray-500 text-sm">\s*Join a culture of analytical excellence and absolute integrity. We are always looking for driven professionals.\s*<\/p>/,
    replace: `<h2 className="font-serif font-bold text-4xl text-[#0A1D37] tracking-tight">{settings?.content?.careersHeadline || "Career Opportunities"}</h2>
              <p className="max-w-2xl text-gray-500 text-sm whitespace-pre-line">
                {settings?.content?.careersSubheadline || "Join a culture of analytical excellence and absolute integrity. We are always looking for driven professionals."}
              </p>`
  },
  // Contact
  {
    find: /<h2 className="font-serif font-bold text-2xl text-\[#0A1D37\]">Privacy Policy<\/h2>\s*<p>At \{settings\.general\?\.companyName \|\| "Richards Realty LLC"\}, we respect the absolute privacy of our institutional and private capital clients\. All consultation dossiers, municipal documentation, and correspondence transmitted via our contact forms are stored securely within local sandboxed networks\.<\/p>\s*<p>We do not operate tracking cookie pools, nor do we disclose or sell client identities or real estate portfolios to third-party marketplaces or promotional agencies\.<\/p>/,
    replace: `<h2 className="font-serif font-bold text-2xl text-[#0A1D37]">Privacy Policy</h2>
            <p className="whitespace-pre-line">{settings?.content?.privacyPolicyText || \`At \${settings.general?.companyName || "Richards Realty LLC"}, we respect the absolute privacy of our institutional and private capital clients. All consultation dossiers, municipal documentation, and correspondence transmitted via our contact forms are stored securely within local sandboxed networks.\n\nWe do not operate tracking cookie pools, nor do we disclose or sell client identities or real estate portfolios to third-party marketplaces or promotional agencies.\`}</p>`
  },
  {
    find: /<h2 className="font-serif font-bold text-2xl text-\[#0A1D37\]">Terms of Service<\/h2>\s*<p>The materials, briefs, and valuation methodologies presented on this corporate website serve purely as informational guides\. Underwriting models, zoning legal advice, and certified surveys require direct contractual agreements under real estate NDAs\.<\/p>\s*<p>By engaging with this website, you acknowledge that \{settings\.general\?\.companyName \|\| "Richards Realty LLC"\} does not act as a licensed property listing broker or transactional agency\.<\/p>/,
    replace: `<h2 className="font-serif font-bold text-2xl text-[#0A1D37]">Terms of Service</h2>
            <p className="whitespace-pre-line">{settings?.content?.termsOfServiceText || \`The materials, briefs, and valuation methodologies presented on this corporate website serve purely as informational guides. Underwriting models, zoning legal advice, and certified surveys require direct contractual agreements under real estate NDAs.\n\nBy engaging with this website, you acknowledge that \${settings.general?.companyName || "Richards Realty LLC"} does not act as a licensed property listing broker or transactional agency.\`}</p>`
  },
  {
    find: /<h2 className="font-serif font-bold text-2xl text-\[#0A1D37\]">Cookie Policy<\/h2>\s*<p>\{settings\.general\?\.companyName \|\| "Richards Realty LLC"\} utilizes simple functional session tokens to secure administration dashboard access\. We do not engage in tracking pixels, commercial profiling, or third-party advertising cookie networks\.<\/p>/,
    replace: `<h2 className="font-serif font-bold text-2xl text-[#0A1D37]">Cookie Policy</h2>
            <p className="whitespace-pre-line">{settings?.content?.cookiePolicyText || \`\${settings.general?.companyName || "Richards Realty LLC"} utilizes simple functional session tokens to secure administration dashboard access. We do not engage in tracking pixels, commercial profiling, or third-party advertising cookie networks.\`}</p>`
  },
  {
    find: /<h2 className="font-serif font-bold text-2xl text-\[#0A1D37\]">Disclaimer<\/h2>\s*<p>\{settings\.general\?\.companyName \|\| "Richards Realty LLC"\} operates strictly under California municipal laws\. Any content, blog analytical paper, or outline of zoning processes does not represent statutory tax or final legal zoning decisions\. Clients are strictly advised to undergo direct custom surveys for certified audits\.<\/p>/,
    replace: `<h2 className="font-serif font-bold text-2xl text-[#0A1D37]">Disclaimer</h2>
            <p className="whitespace-pre-line">{settings?.content?.disclaimerText || \`\${settings.general?.companyName || "Richards Realty LLC"} operates strictly under California municipal laws. Any content, blog analytical paper, or outline of zoning processes does not represent statutory tax or final legal zoning decisions. Clients are strictly advised to undergo direct custom surveys for certified audits.\`}</p>`
  }
];

replacements.forEach(r => {
  code = code.replace(r.find, r.replace);
});

// Now replace animations
// We need to match things like: className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 animate-in fade-in duration-200"
// and convert to className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 ${settings?.styling?.animationStyle || 'animate-in fade-in duration-200'}`}

code = code.replace(/className="([^"]*)animate-in fade-in duration-200([^"]*)"/g, 'className={`$1${settings?.styling?.animationStyle || \'animate-in fade-in duration-200\'}$2`}');
code = code.replace(/className="([^"]*)animate-in fade-in([^"]*)"/g, (match, p1, p2) => {
    if(match.includes('duration-200')) return match; // already handled
    if(match.includes('duration-150')) return match; // small specific animations left alone for now or handle them
    return 'className={`' + p1 + '${settings?.styling?.animationStyle || \'animate-in fade-in duration-200\'}' + p2 + '`}';
});

fs.writeFileSync('src/App.tsx', code);
