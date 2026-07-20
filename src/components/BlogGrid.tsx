import { useState, useEffect } from 'react';
import { BlogPost } from '../types';
import { Search, Calendar, User, Clock, ChevronRight, X, FileText } from 'lucide-react';

interface BlogGridProps {
  blogs: BlogPost[];
  onBlogClick?: (blog: BlogPost) => void;
}

export default function BlogGrid({ blogs }: BlogGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [readingBlog, setReadingBlog] = useState<BlogPost | null>(null);

  useEffect(() => {
    if (readingBlog) {
      document.body.classList.add('modal-open');
      window.dispatchEvent(new CustomEvent('blog-active', { detail: { active: true } }));
    } else {
      document.body.classList.remove('modal-open');
      window.dispatchEvent(new CustomEvent('blog-active', { detail: { active: false } }));
    }
    return () => {
      document.body.classList.remove('modal-open');
      window.dispatchEvent(new CustomEvent('blog-active', { detail: { active: false } }));
    };
  }, [readingBlog]);

  // Derive unique categories
  const categories = ['All', ...Array.from(new Set(blogs.map(b => b.category)))];

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          blog.shortDesc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredBlog = blogs[0];

  return (
    <div className="space-y-12">
      {/* Search and Category Filtering Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#F4F7F9]/40 p-4 border border-gray-200 rounded-none">
        {/* Categories */}
        <div className="flex flex-wrap gap-1.5 order-2 md:order-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-sans font-medium rounded-none transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#C5A02E] text-white font-semibold'
                  : 'bg-[#F4F7F9] text-gray-500 hover:text-[#0A1D37] hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80 order-1 md:order-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search market briefs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-none pl-9 pr-3 py-2 text-xs text-[#0A1D37] placeholder:text-slate-600 focus:outline-none focus:border-[#C5A02E] transition-colors"
          />
        </div>
      </div>

      {/* Featured Blog Header Section (Only if no active filtering) */}
      {!searchTerm && selectedCategory === 'All' && featuredBlog && (
        <div 
          onClick={() => setReadingBlog(featuredBlog)}
          className="group grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#F4F7F9]/20 border border-gray-200 p-6 rounded-none cursor-pointer hover:border-gray-300 transition-all"
        >
          <div className="lg:col-span-7 overflow-hidden rounded-none h-[260px] lg:h-[360px]">
            <img 
              src={featuredBlog.image} 
              alt={featuredBlog.title} 
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
            <span className="text-[10px] text-[#C5A02E] font-sans uppercase tracking-[0.2em] font-semibold">
              FEATURED ANALYTICAL BRIEF • {featuredBlog.category}
            </span>
            <h4 className="font-serif font-bold text-2xl text-[#0A1D37] tracking-tight group-hover:text-[#C5A02E] transition-colors">
              {featuredBlog.title}
            </h4>
            <p className="text-gray-500 text-xs leading-relaxed">
              {featuredBlog.shortDesc}
            </p>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 font-sans pt-2">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-[#C5A02E]" /> {featuredBlog.date}</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-[#C5A02E]" /> {featuredBlog.readTime}</span>
            </div>
            <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#0A1D37]">{featuredBlog.author}</span>
              <span className="text-xs text-[#C5A02E] font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                Read Document <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Blog Cards Grid */}
      {filteredBlogs.length === 0 ? (
        <div className="text-center py-12 bg-[#F4F7F9]/10 border border-gray-200 rounded-none">
          <p className="text-slate-500 text-sm font-sans">No corporate publications matched your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((blog) => (
            <article
              key={blog.id}
              onClick={() => setReadingBlog(blog)}
              className="group bg-[#F4F7F9]/30 border border-gray-200 rounded-none overflow-hidden flex flex-col h-full cursor-pointer hover:border-gray-300 transition-all hover:translate-y-[-2px]"
            >
              <div className="h-48 overflow-hidden relative">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 left-3 bg-white/90 text-[#C5A02E] text-[9px] font-sans uppercase tracking-wider px-2.5 py-1 rounded-none">
                  {blog.category}
                </span>
              </div>
              <div className="p-5 flex flex-col flex-grow space-y-3">
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-sans">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-[#C5A02E]" /> {blog.date}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-[#C5A02E]" /> {blog.readTime}</span>
                </div>
                <h5 className="font-sans font-bold text-base text-[#0A1D37] tracking-tight group-hover:text-[#C5A02E] transition-colors line-clamp-2">
                  {blog.title}
                </h5>
                <p className="text-gray-500 text-xs leading-relaxed line-clamp-3 flex-grow">
                  {blog.shortDesc}
                </p>
                <div className="pt-4 border-t border-gray-200 flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-500 text-[11px] truncate max-w-[150px]">{blog.author.split(',')[0]}</span>
                  <span className="text-[#C5A02E] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Read <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Reader Modal */}
      {readingBlog && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            onScroll={(e) => {
              const target = e.currentTarget;
              const total = target.scrollHeight - target.clientHeight;
              const progress = total > 0 ? (target.scrollTop / total) * 100 : 0;
              window.dispatchEvent(new CustomEvent('blog-scroll', { detail: { progress } }));
            }}
            className="bg-white border border-gray-200 rounded-none max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200"
          >
            {/* Header / Cover */}
            <div className="relative h-64 sm:h-80 w-full">
              <img
                src={readingBlog.image}
                alt={readingBlog.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1D37] via-[#0A1D37]/40 to-transparent"></div>
              <button
                onClick={() => setReadingBlog(null)}
                className="absolute top-4 right-4 bg-white/80 text-gray-500 hover:text-[#0A1D37] p-2 rounded-full cursor-pointer transition-colors"
                aria-label="Close reader"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Article Content */}
            <div className="p-6 sm:p-10 space-y-6">
              <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-[#C5A02E]">
                <span className="bg-[#C5A02E]/10 px-2.5 py-1 rounded-none font-semibold uppercase tracking-wider">{readingBlog.category}</span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1 text-gray-500"><Calendar className="h-3.5 w-3.5" /> {readingBlog.date}</span>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1 text-gray-500"><Clock className="h-3.5 w-3.5" /> {readingBlog.readTime}</span>
              </div>

              <h3 className="font-serif font-extrabold text-2xl sm:text-3.5xl text-[#0A1D37] tracking-tight leading-tight">
                {readingBlog.title}
              </h3>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#C5A02E]/10 text-[#C5A02E] flex items-center justify-center font-bold text-sm">
                    {readingBlog.author.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#0A1D37]">{readingBlog.author}</p>
                    <p className="text-[10px] text-slate-500 font-sans">Richards Realty Research & Intelligence</p>
                  </div>
                </div>
                <button
                  onClick={() => window.print()}
                  className="no-print self-start sm:self-auto bg-[#0A1D37] hover:bg-[#C5A02E] text-white px-4 py-2.5 text-xs font-sans font-bold tracking-wider rounded-none transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <FileText className="h-4 w-4" />
                  <span>PRINT INSIGHT BRIEF</span>
                </button>
              </div>

              {/* Body text with paragraphs */}
              <div className="text-[#0A1D37] text-sm leading-relaxed space-y-4 whitespace-pre-line font-sans">
                {readingBlog.content}
              </div>

              {/* Close Button */}
              <div className="pt-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setReadingBlog(null)}
                  className="bg-[#F4F7F9] hover:bg-gray-200 border border-gray-300 text-[#0A1D37] px-5 py-2.5 rounded-none text-xs font-sans font-semibold cursor-pointer"
                >
                  Return to Market Insights
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
