import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, ShieldAlert, Award, ChevronDown, ChevronUp } from 'lucide-react';
import type { Scheme } from '../services/mockData';

interface SchemeFinderProps {
  apiService: {
    getSchemes: () => Promise<Scheme[]>;
  };
}

export const SchemeFinder: React.FC<SchemeFinderProps> = ({ apiService }) => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>('pm_svanidhi'); // PM SVANidhi expanded by default
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSchemes = async () => {
      setLoading(true);
      try {
        const data = await apiService.getSchemes();
        setSchemes(data);
      } catch (err) {
        console.error('Error fetching schemes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  const categories = ['All', 'Loan', 'Insurance', 'Pension', 'Health', 'Ration'];

  // Filter logic
  const filteredSchemes = schemes.filter(scheme => {
    const matchesCategory = activeCategory === 'All' || scheme.category === activeCategory;
    const matchesSearch = 
      scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  const selectedScheme = schemes.find(s => s.id === expandedId) || filteredSchemes[0] || schemes[0];

  return (
    <div className="space-y-5 max-w-full mx-auto transition-colors duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Search & Schemes List */}
        <div className="lg:col-span-5 space-y-5">
          {/* Search Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-800 space-y-4">
            <div className="flex items-center space-x-2">
              <Award className="text-emerald-500 stroke-[2.2]" size={20} />
              <h2 className="text-sm font-extrabold text-slate-850 dark:text-white uppercase tracking-wider">Sarkari Schemes Finder</h2>
            </div>

            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-450">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search e.g. SVANidhi, Mudra, Loan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none text-xs font-semibold text-slate-700 dark:text-slate-200"
              />
            </div>

            {/* Category Pill Filters */}
            <div className="flex overflow-x-auto gap-2 pb-1.5 scrollbar-thin">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`py-1.5 px-3 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    activeCategory === category
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-250/60 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {category === 'All' ? 'All (सब)' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Schemes List */}
          {loading ? (
            <div className="text-center py-10 text-xs font-semibold text-slate-400 animate-pulse">
              Schemes khoji ja rahi hain...
            </div>
          ) : filteredSchemes.length === 0 ? (
            <div className="text-center bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-400 space-y-1 font-semibold">
              <ShieldAlert className="mx-auto text-amber-500 mb-2" size={24} />
              <p>Koi matching scheme nahi mili.</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Kuch aur search karke koshish karein.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSchemes.map((scheme) => {
                const isExpanded = expandedId === scheme.id;
                
                return (
                  <div 
                    key={scheme.id} 
                    className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
                      isExpanded ? 'border-emerald-500 ring-2 ring-emerald-500/25' : 'border-slate-200/60 dark:border-slate-800'
                    }`}
                  >
                    {/* Header Collapsible Trigger */}
                    <button
                      onClick={() => toggleExpand(scheme.id)}
                      className="w-full p-4 flex justify-between items-center text-left hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 py-0.5 px-2 rounded-full">
                          {scheme.category}
                        </span>
                        <h3 className="text-sm font-bold text-slate-855 dark:text-white mt-1">{scheme.name}</h3>
                      </div>
                      <div className="text-slate-400 shrink-0 ml-2">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>

                    {/* Expanded Details Body (Mobile details view) */}
                    {isExpanded && (
                      <div className="lg:hidden px-4 pb-5 border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4 animate-fadeIn">
                        {/* Description */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-550 uppercase block tracking-wider">
                            Description / विवरण
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-350 font-semibold leading-relaxed">
                            {scheme.description}
                          </p>
                        </div>

                        {/* Eligibility */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-550 uppercase block tracking-wider">
                            Eligibility / पात्रता
                          </span>
                          <p className="text-xs font-semibold text-slate-650 dark:text-slate-400 leading-relaxed">
                            {scheme.eligibility}
                          </p>
                        </div>

                        {/* Apply Button */}
                        <div className="pt-2">
                          <a
                            href={scheme.applyLink}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-sm text-xs transition-colors"
                          >
                            <span>Apply Online (ऑनलाइन आवेदन करें)</span>
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Full Details Panel (Visible on Desktop only) */}
        <div className="hidden lg:block lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 shadow-sm space-y-5 sticky top-24">
          {selectedScheme ? (
            <div className="space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/40 py-1 px-3 rounded-full">
                  {selectedScheme.category}
                </span>
                <h2 className="text-lg font-extrabold text-slate-800 dark:text-white mt-2">{selectedScheme.name}</h2>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                 <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-550 uppercase block tracking-wider">
                   Description / विवरण
                 </span>
                <p className="text-xs text-slate-600 dark:text-slate-350 font-semibold leading-relaxed">
                  {selectedScheme.description}
                </p>
              </div>

              {/* Eligibility */}
              <div className="space-y-2.5">
                 <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-550 uppercase block tracking-wider">
                   Eligibility / पात्रता
                 </span>
                <p className="text-xs font-semibold text-slate-650 dark:text-slate-400 leading-relaxed">
                  {selectedScheme.eligibility}
                </p>
              </div>

              {/* Apply Button */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={selectedScheme.applyLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-sm text-xs transition-colors"
                >
                  <span>Apply Online (ऑनलाइन आवेदन करें)</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 dark:text-slate-500 text-xs font-semibold">
              Scheme details dekhne ke liye list me kisi scheme ko select karein.
            </div>
          )}
        </div> {/* End Right Column */}
      </div> {/* End Grid Wrapper */}
    </div>
  );
};
