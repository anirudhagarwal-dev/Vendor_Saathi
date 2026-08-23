import { useState, useEffect } from 'react';
import { Plus, Trash, Calendar, BookOpen, IndianRupee, Minus, Save, Edit } from 'lucide-react';
import { BUSINESS_TYPES } from '../services/mockData';
import type { DailySalesEntry, SalesItem } from '../services/mockData';
import type { UserProfile } from '../services/api';

interface SalesTrackerProps {
  user: UserProfile;
  apiService: {
    getSales: () => Promise<DailySalesEntry[]>;
    addSalesEntry: (entry: Omit<DailySalesEntry, 'id'>) => Promise<DailySalesEntry>;
    deleteSalesEntry: (id: string) => Promise<boolean>;
    updateSalesEntry: (id: string, data: { items?: any[], totalExpense?: number }) => Promise<DailySalesEntry>;
  };
  onRefreshInsights: () => void;
}

export const SalesTracker: React.FC<SalesTrackerProps> = ({ user, apiService, onRefreshInsights }) => {
  const [salesHistory, setSalesHistory] = useState<DailySalesEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit State
  const [editEntryId, setEditEntryId] = useState<string | null>(null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentItems, setCurrentItems] = useState<SalesItem[]>([]);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [note, setNote] = useState('');

  // Add Item State
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState<number>(1);
  const [itemPrice, setItemPrice] = useState<number>(10);

  // Load common items for this business
  const business = BUSINESS_TYPES.find(b => b.id === user.businessType) || BUSINESS_TYPES[0];
  const commonItems = business.commonItems;

  const loadSalesHistory = async () => {
    setLoading(true);
    try {
      const data = await apiService.getSales();
      // Show newest first in history list
      setSalesHistory([...data].reverse());
    } catch (err: any) {
      setError('Sales history load nahi ho saki.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesHistory();
  }, []);

  const handleAddSalesItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!itemName.trim()) {
      setError('Item ka naam likhein ya select karein (Enter or select an item name)');
      return;
    }
    if (itemQty <= 0) return;

    // Check if item already in current entry list
    const existingIndex = currentItems.findIndex(
      item => item.name.toLowerCase() === itemName.trim().toLowerCase()
    );

    if (existingIndex > -1) {
      const updated = [...currentItems];
      updated[existingIndex].qtySold += itemQty;
      updated[existingIndex].price = itemPrice; // update with latest price
      setCurrentItems(updated);
    } else {
      setCurrentItems([...currentItems, { name: itemName.trim(), qtySold: itemQty, price: itemPrice }]);
    }

    // Reset inputs
    setItemName('');
    setItemQty(1);
    setItemPrice(10);
    setError('');
  };

  const handleRemoveSalesItem = (index: number) => {
    const updated = [...currentItems];
    updated.splice(index, 1);
    setCurrentItems(updated);
  };

  const handleStartEdit = (entry: DailySalesEntry) => {
    setEditEntryId(entry.id);
    setDate(entry.date);
    setCurrentItems(entry.items);
    setTotalExpense(entry.totalExpense);
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveEntry = async () => {
    if (currentItems.length === 0) {
      setError('Bikri ki suji khali hai. Pehle items jodein! (Please add at least one item sold)');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editEntryId) {
        await apiService.updateSalesEntry(editEntryId, {
          items: currentItems,
          totalExpense
        });
        setSuccess('Bikri update ho gayi! (Daily Sales Updated Successfully)');
        setEditEntryId(null);
      } else {
        await apiService.addSalesEntry({
          date,
          items: currentItems,
          totalExpense,
          note: note.trim() || undefined
        });
        setSuccess('Bikri safe ho gayi! (Daily Sales Saved Successfully)');
      }

      setCurrentItems([]);
      setTotalExpense(0);
      setNote('');
      loadSalesHistory();
      onRefreshInsights();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError('Save/Update nahi ho paya. Kripya dobara koshish karein.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm('Kya aap is sales record ko delete karna chahte hain?')) return;
    try {
      const success = await apiService.deleteSalesEntry(id);
      if (success) {
        loadSalesHistory();
        onRefreshInsights();
      }
    } catch (err) {
      setError('Delete karne me pareshani aayi.');
    }
  };

  return (
    <div className="space-y-6 max-w-full mx-auto transition-colors duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sales Entry Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Sales logger card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <BookOpen className="text-emerald-500 stroke-[2.2]" size={18} />
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Aaj ka Hisab / Daily Entry</h2>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/40 p-3 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 p-3 rounded-xl text-xs font-semibold">
                {success}
              </div>
            )}

            {/* Date Selector */}
            <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/40 dark:border-slate-800 p-3 rounded-xl">
              <Calendar size={16} className="text-slate-400 shrink-0" />
              <div className="flex-1">
                <span className="block text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase">Tarikh / Date</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent border-none outline-none font-bold text-xs w-full p-0 text-slate-700 dark:text-slate-200 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Tap Items Picker */}
            <div className="space-y-1.5">
              <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Quick Add Items</span>
              <div className="flex flex-wrap gap-1.5">
                {commonItems.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setItemName(item)}
                    className={`py-1.5 px-3 rounded-full text-xs font-semibold border transition-all ${
                      itemName === item 
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Item Input Grid */}
            <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl space-y-4 border border-slate-200/50 dark:border-slate-800/80">
              <div>
                <label className="block text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase mb-1.5 tracking-wider">Item Ka Naam / नाम</label>
                <input
                  type="text"
                  placeholder="e.g. Aloo, Chai, Samosa..."
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-xs font-semibold text-slate-700 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Quantity Counter */}
                <div>
                  <label className="block text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase mb-1.5 tracking-wider">Kitna Bika (Qty)</label>
                  <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setItemQty(q => Math.max(1, q - 1))}
                      className="px-3 py-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Minus size={12} className="stroke-[2.5]" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={itemQty}
                      onChange={(e) => setItemQty(parseInt(e.target.value) || 1)}
                      className="w-full text-center border-none focus:ring-0 outline-none text-xs font-bold text-slate-700 dark:text-slate-200 py-1 px-0 bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setItemQty(q => q + 1)}
                      className="px-3 py-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Plus size={12} className="stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Price Counter */}
                <div>
                  <label className="block text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase mb-1.5 tracking-wider">Price per unit (₹)</label>
                  <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setItemPrice(p => Math.max(1, p - 5))}
                      className="px-3 py-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Minus size={12} className="stroke-[2.5]" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(parseInt(e.target.value) || 10)}
                      className="w-full text-center border-none focus:ring-0 outline-none text-xs font-bold text-slate-700 dark:text-slate-200 py-1 px-0 bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setItemPrice(p => p + 5)}
                      className="px-3 py-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Plus size={12} className="stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleAddSalesItem()}
                className="w-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-xs transition-colors border border-emerald-200/50 dark:border-emerald-900/50"
              >
                <Plus size={12} className="stroke-[2.5]" />
                <span>Add Item (सूची में जोड़ें)</span>
              </button>
            </div>

            {/* Current Items Table */}
            {currentItems.length > 0 && (
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Items List / जोड़ी हुई सूची:</span>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto pr-1">
                  {currentItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 text-xs">
                      <div className="font-semibold text-slate-700 dark:text-slate-200">{item.name}</div>
                      <div className="flex items-center space-x-4">
                        <div className="text-slate-500 dark:text-slate-400 font-medium">
                          {item.qtySold} × ₹{item.price} = <span className="font-bold text-slate-800 dark:text-white">₹{item.qtySold * item.price}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSalesItem(idx)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-full transition-colors"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Total Revenue:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">₹{currentItems.reduce((acc, curr) => acc + (curr.qtySold * curr.price), 0)}</span>
                </div>
              </div>
            )}

            {/* Expenses Input */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3">
              <label className="block text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase mb-1.5 tracking-wider">
                Mandi Kharch / Daily Expense (₹) (आज का कुल खर्च)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <IndianRupee size={14} />
                </span>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. Cart rent, wholesale market transport cost"
                  value={totalExpense || ''}
                  onChange={(e) => setTotalExpense(parseInt(e.target.value) || 0)}
                  className="w-full pl-8 pr-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-xs font-semibold text-slate-700 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Save Day Record Button */}
            <button
              type="button"
              onClick={handleSaveEntry}
              disabled={loading || currentItems.length === 0}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-sm active:scale-98 transition-all text-xs"
            >
              <Save size={14} />
              <span>{editEntryId ? "Update Record (खाता अपडेट करें)" : "Save Today's Record (खाता सुरक्षित करें)"}</span>
            </button>

            {editEntryId && (
              <button
                type="button"
                onClick={() => {
                  setEditEntryId(null);
                  setCurrentItems([]);
                  setTotalExpense(0);
                  setNote('');
                }}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all text-xs"
              >
                <span>Cancel Edit (बदलाव रद्द करें)</span>
              </button>
            )}
          </div> {/* End Sales Logger Card */}
        </div> {/* End Left Column */}

        {/* Right Column: Sales History List */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-200/60 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Bikri History / पुराना रिकॉर्ड</span>
            </h3>

            {loading && salesHistory.length === 0 ? (
              <div className="text-center py-6 text-xs font-semibold text-slate-400 dark:text-slate-500 animate-pulse">
                Records load ho rahe hain...
              </div>
            ) : salesHistory.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-550 font-medium">
                Koi purana sales record nahi mila. Pehla entry add karein!
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {salesHistory.map((history) => {
                  const entryRevenue = history.items.reduce((acc, curr) => acc + (curr.qtySold * curr.price), 0);
                  const profit = entryRevenue - history.totalExpense;

                  return (
                    <div key={history.id} className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/50 dark:border-slate-800 flex flex-col space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-slate-600 dark:text-slate-400">{history.date}</span>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(history)}
                            className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 p-1 rounded-lg transition-colors"
                            title="Edit Entry"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEntry(history.id)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 p-1 rounded-lg transition-colors"
                            title="Delete Entry"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Item Summaries */}
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 font-semibold">
                        {history.items.map((it, i) => (
                          <div key={i} className="flex justify-between font-medium">
                            <span>• {it.name} ({it.qtySold})</span>
                            <span>₹{it.qtySold * it.price}</span>
                          </div>
                        ))}
                      </div>

                      {/* Financial calculation */}
                      <div className="border-t border-slate-200/60 dark:border-slate-800/80 pt-2 flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-450">
                        <div>
                          Expense: <span className="font-bold text-slate-800 dark:text-white">₹{history.totalExpense}</span>
                        </div>
                        <div className="text-right">
                          Profit: <span className={`font-bold ${profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                            {profit >= 0 ? '+' : ''}₹{profit}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div> {/* End History Card Wrapper */}
        </div> {/* End Right Column */}
      </div> {/* End Grid Wrapper */}
    </div>
  );
};
