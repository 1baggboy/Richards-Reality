const fs = require('fs');

let code = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

const startTag = "{activeTab === 'settings' && settings && (";
const endTag = "{activeTab === 'logs' && (";

const startIndex = code.indexOf(startTag);
const endIndex = code.indexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
    console.error('Could not find start or end tags');
    process.exit(1);
}

const before = code.substring(0, startIndex);
const after = code.substring(endIndex);

const newSettingsBlock = `
          {activeTab === 'settings' && settings && (
            <div className="space-y-6 max-w-5xl animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-xl font-bold text-[#0A1D37] uppercase tracking-tight">Corporate Parameter Settings</h2>
                <div className="flex items-center gap-3">
                  {settingsSuccess && <span className="text-xs text-emerald-500 font-sans">Parameters Saved!</span>}
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={isSettingsLoading}
                    className="bg-[#C5A02E] hover:bg-[#A68625] disabled:bg-slate-800 text-white px-6 py-2 rounded-none text-xs font-bold transition-all cursor-pointer"
                  >
                    {isSettingsLoading ? "SAVING..." : "SAVE PARAMETERS"}
                  </button>
                </div>
              </div>

              {/* Sub-Tabs for Settings */}
              <div className="flex space-x-6 border-b border-gray-200 mb-6 overflow-x-auto pb-1">
                {[
                  { id: 'general', label: 'General & Social' },
                  { id: 'styling', label: 'Styling & Brand' },
                  { id: 'home', label: 'Home Page' },
                  { id: 'about', label: 'About Page' },
                  { id: 'mission', label: 'Mission Page' },
                  { id: 'other', label: 'Other Pages' },
                  { id: 'faqs', label: 'FAQs' },
                  { id: 'legal', label: 'Legal Pages' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSettingsTab(tab.id)}
                    className={\`py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap \${settingsTab === tab.id ? 'border-[#C5A02E] text-[#0A1D37]' : 'border-transparent text-gray-400 hover:text-[#C5A02E]'}\`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {settingsTab === 'general' && (
                  <>
                    <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4">
                      <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">HQ Contact Credentials</span>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Corporate Name</label>
                        <input
                          type="text"
                          value={settings.general.companyName}
                          onChange={(e) => setSettings({ ...settings, general: { ...settings.general, companyName: e.target.value } })}
                          className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Email Address</label>
                        <input
                          type="email"
                          value={settings.general.email}
                          onChange={(e) => setSettings({ ...settings, general: { ...settings.general, email: e.target.value } })}
                          className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Phone Number</label>
                        <input
                          type="text"
                          value={settings.general.phone}
                          onChange={(e) => setSettings({ ...settings, general: { ...settings.general, phone: e.target.value } })}
                          className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">WhatsApp Number (e.g. 14155552671)</label>
                        <input
                          type="text"
                          value={settings.general.whatsappNumber || ''}
                          onChange={(e) => setSettings({ ...settings, general: { ...settings.general, whatsappNumber: e.target.value } })}
                          className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">HQ Address</label>
                        <textarea
                          rows={2}
                          value={settings.general.address}
                          onChange={(e) => setSettings({ ...settings, general: { ...settings.general, address: e.target.value } })}
                          className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"
                        ></textarea>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Operating Hours</label>
                        <input
                          type="text"
                          value={settings.general.workingHours}
                          onChange={(e) => setSettings({ ...settings, general: { ...settings.general, workingHours: e.target.value } })}
                          className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Google Map IFrame URL</label>
                        <textarea
                          rows={3}
                          value={settings.general.googleMapIframe}
                          onChange={(e) => setSettings({ ...settings, general: { ...settings.general, googleMapIframe: e.target.value } })}
                          className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] font-mono text-[10px] focus:outline-none resize-none"
                        ></textarea>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4">
                        <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">SEO Metadata</span>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Global Meta Title</label>
                          <input
                            type="text"
                            value={settings.seo.metaTitle}
                            onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, metaTitle: e.target.value } })}
                            className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Global Meta Description</label>
                          <textarea
                            rows={3}
                            value={settings.seo.metaDescription}
                            onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, metaDescription: e.target.value } })}
                            className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"
                          ></textarea>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Open Graph Image URL</label>
                          <input
                            type="text"
                            value={settings.seo.openGraphImage}
                            onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, openGraphImage: e.target.value } })}
                            className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                          />
                        </div>
                      </div>
                      
                      <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4">
                        <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">Digital Social Integrations</span>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">LinkedIn URL</label>
                          <input
                            type="text"
                            value={settings.social.linkedin}
                            onChange={(e) => setSettings({ ...settings, social: { ...settings.social, linkedin: e.target.value } })}
                            className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Twitter URL</label>
                          <input
                            type="text"
                            value={settings.social.twitter}
                            onChange={(e) => setSettings({ ...settings, social: { ...settings.social, twitter: e.target.value } })}
                            className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Facebook URL</label>
                          <input
                            type="text"
                            value={settings.social.facebook}
                            onChange={(e) => setSettings({ ...settings, social: { ...settings.social, facebook: e.target.value } })}
                            className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Instagram URL</label>
                          <input
                            type="text"
                            value={settings.social.instagram}
                            onChange={(e) => setSettings({ ...settings, social: { ...settings.social, instagram: e.target.value } })}
                            className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {settingsTab === 'styling' && (
                  <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4 md:col-span-2">
                    <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">Website Styling (Brand Identity)</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Primary Color (Hex)</label>
                        <div className="flex gap-2">
                          <div className="w-8 h-8 border border-gray-300" style={{ backgroundColor: settings.styling?.primaryColor || '#0A1D37' }}></div>
                          <input
                            type="text"
                            value={settings.styling?.primaryColor || '#0A1D37'}
                            onChange={(e) => setSettings({ ...settings, styling: { ...settings.styling, primaryColor: e.target.value } })}
                            className="flex-1 bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none focus:border-[#C5A02E]"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Accent Color (Hex)</label>
                        <div className="flex gap-2">
                          <div className="w-8 h-8 border border-gray-300" style={{ backgroundColor: settings.styling?.accentColor || '#C5A02E' }}></div>
                          <input
                            type="text"
                            value={settings.styling?.accentColor || '#C5A02E'}
                            onChange={(e) => setSettings({ ...settings, styling: { ...settings.styling, accentColor: e.target.value } })}
                            className="flex-1 bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none focus:border-[#C5A02E]"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Background Color (Hex)</label>
                        <div className="flex gap-2">
                          <div className="w-8 h-8 border border-gray-300" style={{ backgroundColor: settings.styling?.backgroundColor || '#ffffff' }}></div>
                          <input
                            type="text"
                            value={settings.styling?.backgroundColor || '#ffffff'}
                            onChange={(e) => setSettings({ ...settings, styling: { ...settings.styling, backgroundColor: e.target.value } })}
                            className="flex-1 bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none focus:border-[#C5A02E]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Typography Font</label>
                        <select
                          value={settings.styling?.fontFamily || 'font-sans'}
                          onChange={(e) => setSettings({ ...settings, styling: { ...settings.styling, fontFamily: e.target.value } })}
                          className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none focus:border-[#C5A02E]"
                        >
                          <option value="font-sans">Modern (Sans-serif)</option>
                          <option value="font-serif">Traditional (Serif)</option>
                          <option value="font-mono">Technical (Monospace)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Component Borders</label>
                        <select
                          value={settings.styling?.borderRadius || 'rounded-none'}
                          onChange={(e) => setSettings({ ...settings, styling: { ...settings.styling, borderRadius: e.target.value } })}
                          className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none focus:border-[#C5A02E]"
                        >
                          <option value="rounded-none">Sharp Corners (0px)</option>
                          <option value="rounded-sm">Slightly Rounded (2px)</option>
                          <option value="rounded-md">Rounded (6px)</option>
                          <option value="rounded-xl">Highly Rounded (12px)</option>
                          <option value="rounded-full">Pill (Full)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Animation Style</label>
                        <select
                          value={settings.styling?.animationStyle || 'animate-in fade-in duration-200'}
                          onChange={(e) => setSettings({ ...settings, styling: { ...settings.styling, animationStyle: e.target.value } })}
                          className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none focus:border-[#C5A02E]"
                        >
                          <option value="none">No Animations</option>
                          <option value="animate-in fade-in duration-200">Subtle Fade</option>
                          <option value="animate-in fade-in slide-in-from-bottom-4 duration-500">Slide Up</option>
                          <option value="animate-in fade-in zoom-in-95 duration-300">Zoom In</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'home' && (
                  <>
                    <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4">
                      <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">Hero Section</span>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Hero Headline</label>
                        <input type="text" value={settings.content?.heroHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, heroHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Hero Subheadline</label>
                        <textarea rows={3} value={settings.content?.heroSubheadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, heroSubheadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Hero Background Image</label>
                        <input type="text" value={settings.content?.heroImage || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, heroImage: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                      </div>
                    </div>
                    <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4">
                      <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">Home - About Section</span>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">About Headline</label>
                        <input type="text" value={settings.content?.aboutHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, aboutHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">About Text</label>
                        <textarea rows={3} value={settings.content?.aboutText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, aboutText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">About Image URL</label>
                        <input type="text" value={settings.content?.aboutImage || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, aboutImage: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                      </div>
                    </div>
                    <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4">
                      <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">Home - Services Section</span>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Services Headline</label>
                        <input type="text" value={settings.content?.servicesHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, servicesHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Services Subheadline</label>
                        <textarea rows={3} value={settings.content?.servicesSubheadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, servicesSubheadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                    </div>
                    <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4">
                      <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">Home - Mission & Team</span>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Mission Headline</label>
                        <input type="text" value={settings.content?.missionHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, missionHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Mission Text</label>
                        <textarea rows={3} value={settings.content?.missionText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, missionText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                      <div className="space-y-1.5 mt-4">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Team Headline</label>
                        <input type="text" value={settings.content?.teamHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, teamHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Team Subheadline</label>
                        <textarea rows={3} value={settings.content?.teamSubheadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, teamSubheadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                    </div>
                  </>
                )}

                {settingsTab === 'about' && (
                  <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4 md:col-span-2">
                    <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">About Page Content</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Main Headline</label>
                          <input type="text" value={settings.content?.aboutPageHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, aboutPageHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Introductory Text</label>
                          <textarea rows={3} value={settings.content?.aboutPageText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, aboutPageText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                        </div>
                        <div className="space-y-1.5 mt-4">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Story Headline</label>
                          <input type="text" value={settings.content?.aboutPageStoryHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, aboutPageStoryHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Story Text</label>
                          <textarea rows={6} value={settings.content?.aboutPageStoryText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, aboutPageStoryText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Message Headline</label>
                          <input type="text" value={settings.content?.aboutPageMessageHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, aboutPageMessageHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Message Text</label>
                          <textarea rows={6} value={settings.content?.aboutPageMessageText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, aboutPageMessageText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                        </div>
                        <div className="space-y-1.5 mt-4">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Message Author</label>
                          <input type="text" value={settings.content?.aboutPageMessageAuthor || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, aboutPageMessageAuthor: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'mission' && (
                  <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4 md:col-span-2">
                    <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">Mission Page Content</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Core Mission Headline</label>
                          <input type="text" value={settings.content?.missionCoreHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, missionCoreHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Core Mission Text</label>
                          <textarea rows={3} value={settings.content?.missionCoreText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, missionCoreText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                        </div>
                        <div className="space-y-1.5 mt-4">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Vision Headline</label>
                          <input type="text" value={settings.content?.missionVisionHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, missionVisionHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Vision Text</label>
                          <textarea rows={3} value={settings.content?.missionVisionText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, missionVisionText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Approach Headline</label>
                          <input type="text" value={settings.content?.missionApproachHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, missionApproachHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Approach Text</label>
                          <textarea rows={3} value={settings.content?.missionApproachText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, missionApproachText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                        </div>
                        <div className="space-y-1.5 mt-4">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Commitment Headline</label>
                          <input type="text" value={settings.content?.missionCommitmentHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, missionCommitmentHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Commitment Text</label>
                          <textarea rows={3} value={settings.content?.missionCommitmentText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, missionCommitmentText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'other' && (
                  <>
                    <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4">
                      <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">Gallery & Blog Pages</span>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Gallery Headline</label>
                        <input type="text" value={settings.content?.galleryHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, galleryHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Gallery Subheadline</label>
                        <textarea rows={2} value={settings.content?.gallerySubheadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, gallerySubheadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                      <div className="space-y-1.5 mt-4">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Blog Headline</label>
                        <input type="text" value={settings.content?.blogHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, blogHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Blog Subheadline</label>
                        <textarea rows={2} value={settings.content?.blogSubheadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, blogSubheadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                    </div>
                    <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4">
                      <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">Careers & Contact Pages</span>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Careers Headline</label>
                        <input type="text" value={settings.content?.careersHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, careersHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Careers Subheadline</label>
                        <textarea rows={2} value={settings.content?.careersSubheadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, careersSubheadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                      <div className="space-y-1.5 mt-4">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Contact Headline</label>
                        <input type="text" value={settings.content?.contactHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, contactHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Contact Subheadline</label>
                        <textarea rows={2} value={settings.content?.contactSubheadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, contactSubheadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                    </div>
                  </>
                )}

                {settingsTab === 'legal' && (
                  <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4 md:col-span-2">
                    <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">Legal Pages & Footer Content</span>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Footer Text</label>
                        <textarea rows={3} value={settings.content?.footerText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, footerText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Privacy Policy Text</label>
                        <textarea rows={4} value={settings.content?.privacyPolicyText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, privacyPolicyText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Terms of Service Text</label>
                        <textarea rows={4} value={settings.content?.termsOfServiceText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, termsOfServiceText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Cookie Policy Text</label>
                        <textarea rows={3} value={settings.content?.cookiePolicyText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, cookiePolicyText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Disclaimer Text</label>
                        <textarea rows={3} value={settings.content?.disclaimerText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, disclaimerText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'faqs' && (
                  <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4 md:col-span-2">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block">Frequently Asked Questions</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          const newFaqs = [...(settings.content?.faqs || []), { q: 'New Question', a: 'Answer...' }];
                          setSettings({ ...settings, content: { ...settings.content, faqs: newFaqs } });
                        }}
                        className="text-xs text-[#0A1D37] hover:text-[#C5A02E] font-bold cursor-pointer"
                      >
                        + ADD FAQ
                      </button>
                    </div>
                    
                    <div className="space-y-6 pt-2">
                      {settings.content?.faqs?.map((faq, idx) => (
                        <div key={idx} className="space-y-2 border border-gray-200 p-4 bg-white relative">
                          <button 
                            type="button"
                            onClick={() => {
                              const newFaqs = settings.content!.faqs!.filter((_, i) => i !== idx);
                              setSettings({ ...settings, content: { ...settings.content, faqs: newFaqs } });
                            }}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer"
                          >
                            REMOVE
                          </button>
                          <div className="space-y-1.5 pr-16">
                            <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Question {idx + 1}</label>
                            <input
                              type="text"
                              value={faq.q}
                              onChange={(e) => {
                                const newFaqs = [...settings.content!.faqs!];
                                newFaqs[idx].q = e.target.value;
                                setSettings({ ...settings, content: { ...settings.content, faqs: newFaqs } });
                              }}
                              className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none focus:border-[#C5A02E]"
                            />
                          </div>
                          <div className="space-y-1.5 pr-16">
                            <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Answer</label>
                            <textarea
                              rows={2}
                              value={faq.a}
                              onChange={(e) => {
                                const newFaqs = [...settings.content!.faqs!];
                                newFaqs[idx].a = e.target.value;
                                setSettings({ ...settings, content: { ...settings.content, faqs: newFaqs } });
                              }}
                              className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none focus:border-[#C5A02E] resize-none"
                            ></textarea>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
`;

fs.writeFileSync('src/components/AdminPanel.tsx', before + newSettingsBlock + "\n" + after);
