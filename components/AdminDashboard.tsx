
import React, { useState } from 'react';
import { SaleItem } from '../types';
import { base64ToFile, downloadBase64Image } from '../services/utils';

interface AdminDashboardProps {
  items: SaleItem[];
  onDelete: (id: string) => void;
  onToggleSold: (id: string, currentStatus: boolean) => void;
  onAddClick: () => void;
  onEdit: (item: SaleItem) => void;
}

interface AssistantState {
  item: SaleItem;
  platform: 'Facebook' | 'Craigslist' | 'WhatsApp';
  url: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ items, onDelete, onToggleSold, onAddClick, onEdit }) => {
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [assistant, setAssistant] = useState<AssistantState | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleShare = async (item: SaleItem, platform: 'Facebook' | 'Craigslist' | 'WhatsApp') => {
    const urls = {
      Facebook: 'https://www.facebook.com/marketplace/create',
      Craigslist: 'https://www.craigslist.org',
      WhatsApp: `https://wa.me/?text=${encodeURIComponent(item.whatsappContent)}`
    };

    // Try Web Share API first (Best for mobile)
    if (navigator.share && platform === 'WhatsApp') {
      try {
        const files = await Promise.all(
          item.photos.slice(0, 3).map((p, i) => base64ToFile(p, `item-${i}.jpg`))
        );
        
        const shareData = {
          title: item.title,
          text: item.whatsappContent,
          files: files
        };

        if (navigator.canShare && navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      } catch (err) {
        console.log("Web Share failed, falling back to basic link", err);
      }
    }

    // Fallback/Standard Flow: Open Assistant
    setAssistant({ item, platform, url: urls[platform] });
    navigator.clipboard.writeText(platform === 'Facebook' ? item.facebookContent : (platform === 'WhatsApp' ? item.whatsappContent : item.craigslistContent));
    setCopyStatus(`${platform} Text Copied!`);
    setTimeout(() => setCopyStatus(null), 3000);
  };

  const downloadAllPhotos = async (item: SaleItem) => {
    setIsDownloading(true);
    for (let i = 0; i < item.photos.length; i++) {
      downloadBase64Image(item.photos[i], `moveout-${item.title.replace(/\s+/g, '-')}-${i}.jpg`);
      // Small delay to prevent browser download blocking
      await new Promise(r => setTimeout(r, 300));
    }
    setIsDownloading(false);
  };

  const stats = {
    total: items.length,
    active: items.filter(i => !i.isSold).length,
    sold: items.filter(i => i.isSold).length,
    value: items.filter(i => !i.isSold).reduce((acc, i) => acc + i.price, 0)
  };

  return (
    <div className="space-y-8 pb-20 animate-in slide-in-from-bottom-4 duration-500">
      {/* Toast Feedback */}
      {copyStatus && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-stone-900 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm animate-in fade-in slide-in-from-top-4">
          {copyStatus}
        </div>
      )}

      {/* Assistant Modal */}
      {assistant && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-stone-900">Listing Assistant</h3>
              <button onClick={() => setAssistant(null)} className="p-2 bg-stone-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={assistant.item.photos[0]} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-stone-900 line-clamp-1">{assistant.item.title}</p>
                  <p className="text-sm text-stone-500">Preparing your {assistant.platform} post...</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="bg-stone-50 p-4 rounded-2xl flex items-start space-x-3">
                  <div className="bg-amber-100 text-amber-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <div>
                    <p className="text-sm font-bold text-stone-900">Photos Saved</p>
                    <p className="text-xs text-stone-500 mb-2">We'll save the images to your device first.</p>
                    <button 
                      onClick={() => downloadAllPhotos(assistant.item)}
                      disabled={isDownloading}
                      className="text-xs font-bold text-amber-600 flex items-center"
                    >
                      {isDownloading ? 'Saving...' : 'Tap to Download Photos'}
                    </button>
                  </div>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl flex items-start space-x-3">
                  <div className="bg-amber-100 text-amber-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <div>
                    <p className="text-sm font-bold text-stone-900">Text is Ready</p>
                    <p className="text-xs text-stone-500">The description is already in your clipboard!</p>
                  </div>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl flex items-start space-x-3">
                  <div className="bg-amber-100 text-amber-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <div>
                    <p className="text-sm font-bold text-stone-900">Paste & Publish</p>
                    <p className="text-xs text-stone-500">Open {assistant.platform} and just paste the description.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  window.open(assistant.url, '_blank');
                  setAssistant(null);
                }}
                className="w-full bg-stone-900 text-white font-bold py-4 rounded-2xl shadow-xl active:scale-95 transition-all"
              >
                Go to {assistant.platform} Marketplace
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-stone-900">Inventory Manager</h2>
          <p className="text-stone-500 mt-1">Review AI analysis and share with "Carrying Context" helper.</p>
        </div>
        <button 
          onClick={onAddClick}
          className="hidden md:flex bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition-all items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>Add New Item</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: stats.total, color: 'text-stone-900' },
          { label: 'Active', value: stats.active, color: 'text-amber-600' },
          { label: 'Sold', value: stats.sold, color: 'text-green-600' },
          { label: 'Active Value', value: `$${stats.value}`, color: 'text-stone-900' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="bg-stone-50 border-2 border-dashed border-stone-200 rounded-3xl py-20 text-center flex flex-col items-center">
          <p className="text-stone-400 mb-4">No items in your inventory yet.</p>
          <button 
            onClick={onAddClick}
            className="text-amber-600 font-bold hover:underline"
          >
            Create your first listing →
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map(item => (
            <div 
              key={item.id} 
              className={`bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm transition-all hover:shadow-md ${item.isSold ? 'opacity-60 grayscale-[0.5]' : ''}`}
            >
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-32 h-32 flex-shrink-0 relative">
                  <img src={item.photos[0]} className="w-full h-full object-cover rounded-2xl border border-stone-100" />
                  {item.isSold && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-2xl">
                      <span className="bg-stone-900 text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase">Sold</span>
                    </div>
                  )}
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xl text-stone-900 truncate pr-4">{item.title}</h4>
                      <p className="text-amber-600 font-black text-2xl mt-1">${item.price}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2 py-1 rounded-md bg-stone-100 text-stone-500 text-[10px] font-bold uppercase tracking-wide">{item.category}</span>
                        <span className="px-2 py-1 rounded-md bg-stone-100 text-stone-500 text-[10px] font-bold uppercase tracking-wide">{item.condition}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => onEdit(item)}
                        className="p-2.5 bg-stone-50 text-stone-600 hover:bg-amber-50 hover:text-amber-600 rounded-xl transition-all"
                        title="Edit Details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => onToggleSold(item.id, item.isSold)}
                        className={`p-2.5 rounded-xl transition-all ${item.isSold ? 'bg-stone-100 text-stone-500' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-stone-100 grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => handleShare(item, 'Facebook')}
                      className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-white border border-stone-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform mb-1.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                      </svg>
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest group-hover:text-blue-600">Assistant</span>
                    </button>
                    <button 
                      onClick={() => handleShare(item, 'Craigslist')}
                      className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-white border border-stone-200 hover:border-purple-200 hover:bg-purple-50/30 transition-all group"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 group-hover:scale-110 transition-transform mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest group-hover:text-purple-600">Assistant</span>
                    </button>
                    <button 
                      onClick={() => handleShare(item, 'WhatsApp')}
                      className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl bg-white border border-stone-200 hover:border-green-200 hover:bg-green-50/30 transition-all group"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 group-hover:scale-110 transition-transform mb-1.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest group-hover:text-green-600">Smart Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
