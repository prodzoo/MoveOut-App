
import React, { useState, useMemo, useEffect } from 'react';
import { SaleItem } from '../types';

interface CatalogProps {
  items: SaleItem[];
  onAddClick?: () => void;
  initialCategory?: string | null;
}

const Catalog: React.FC<CatalogProps> = ({ items, onAddClick, initialCategory }) => {
  const [selectedItem, setSelectedItem] = useState<SaleItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(initialCategory || null);

  useEffect(() => {
    if (initialCategory) setFilterCategory(initialCategory);
  }, [initialCategory]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map(item => item.category)));
    return ["All", ...cats.sort()];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!filterCategory || filterCategory === "All") return items;
    return items.filter(item => item.category === filterCategory);
  }, [items, filterCategory]);

  const handleShareCatalog = async () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = filterCategory && filterCategory !== "All" 
      ? `${baseUrl}?category=${encodeURIComponent(filterCategory)}`
      : baseUrl;
    
    const message = filterCategory && filterCategory !== "All"
      ? `Check out the ${filterCategory} items in my moving sale!`
      : `Check out everything in my moving sale!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Moving Sale',
          text: message,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
        <div className="bg-stone-100 p-8 rounded-full mb-6 ring-8 ring-stone-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-stone-800">No items available yet</h3>
        <p className="text-stone-500 mt-2 max-w-xs mx-auto">The catalog is currently being prepared. Check back soon or start adding items!</p>
        
        {onAddClick && (
          <button 
            onClick={onAddClick}
            className="mt-8 bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-amber-600/20 transition-all active:scale-95"
          >
            Start Your Moving Sale
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold text-stone-900 leading-tight">Moving Sale Catalog</h2>
          <p className="text-stone-600 mt-2">Everything must go! Tap an item for details.</p>
        </div>
        <button 
          onClick={handleShareCatalog}
          className="flex items-center justify-center space-x-2 bg-white border border-stone-200 text-stone-700 px-6 py-3 rounded-2xl font-bold shadow-sm hover:border-amber-300 hover:text-amber-700 transition-all active:scale-95 shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>Share {filterCategory && filterCategory !== "All" ? filterCategory : 'Catalog'}</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 -mx-4 px-4 custom-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat === "All" ? null : cat)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all border ${
              (cat === "All" && !filterCategory) || filterCategory === cat
                ? "bg-amber-100 text-amber-800 border-amber-200 shadow-sm"
                : "bg-white text-stone-500 border-stone-200 hover:border-stone-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div 
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
          >
            <div className="aspect-[4/3] relative overflow-hidden bg-stone-100">
              <img 
                src={item.photos[0]} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3 flex space-x-2">
                <span className="bg-white/90 backdrop-blur-sm text-stone-800 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded shadow-sm">
                  {item.category}
                </span>
              </div>
              <div className="absolute bottom-3 right-3">
                <span className="bg-amber-600 text-white text-lg font-bold px-3 py-1 rounded-lg shadow-md">
                  ${item.price}
                </span>
              </div>
            </div>
            <div className="p-5 flex-grow flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1">{item.title}</h3>
                <p className="text-sm text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                  {item.enhancedDescription}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-medium text-stone-400">
                <span className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  {item.condition}
                </span>
                <span>View Details →</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && filterCategory && (
        <div className="text-center py-20">
          <p className="text-stone-400 font-medium italic">No items found in {filterCategory}.</p>
          <button 
            onClick={() => setFilterCategory(null)}
            className="text-amber-600 font-bold mt-2 hover:underline"
          >
            View all items
          </button>
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Left: Photos */}
            <div className="w-full md:w-1/2 bg-stone-100 relative group">
              <div className="h-64 md:h-full overflow-y-auto custom-scrollbar flex flex-col snap-y snap-mandatory">
                {selectedItem.photos.map((photo, i) => (
                  <img key={i} src={photo} alt={`${selectedItem.title} - ${i}`} className="w-full h-auto min-h-full object-cover snap-start" />
                ))}
              </div>
              <div className="absolute top-4 left-4 md:hidden">
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedItem(null); }}
                  className="bg-white/80 p-2 rounded-full shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              {selectedItem.photos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-stone-900/40 px-3 py-1 rounded-full text-white text-xs backdrop-blur-md">
                  Scroll for more photos
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto custom-scrollbar bg-white">
              <div className="flex justify-between items-start mb-2">
                <span className="text-amber-600 font-bold uppercase tracking-widest text-xs">{selectedItem.category}</span>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="hidden md:flex bg-stone-100 p-2 rounded-full hover:bg-stone-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-2 leading-tight">{selectedItem.title}</h2>
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl font-black text-amber-600">${selectedItem.price}</span>
                <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-sm font-medium border border-stone-200">
                  Condition: {selectedItem.condition}
                </span>
              </div>

              <div className="prose prose-stone max-w-none flex-grow">
                <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-2">Description</h4>
                <div className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                  {selectedItem.enhancedDescription}
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-stone-100 space-y-3">
                <p className="text-sm text-stone-500 italic">Interested? Message the seller to arrange pickup.</p>
                <div className="flex space-x-3">
                  <a 
                    href={`https://wa.me/?text=Hi! I'm interested in your ${selectedItem.title} for $${selectedItem.price}. Is it still available?`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-green-700 transition-colors"
                  >
                    <span>Contact Seller</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
