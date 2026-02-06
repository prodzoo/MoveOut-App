
import React, { useState, useRef, useEffect } from 'react';
import { SaleItem } from '../types';
import { saveDraft } from '../services/db';

interface ItemEditorProps {
  item: SaleItem;
  onSave: (item: SaleItem) => void;
  onCancel: () => void;
}

const ItemEditor: React.FC<ItemEditorProps> = ({ item, onSave, onCancel }) => {
  const [editedItem, setEditedItem] = useState<SaleItem>({ ...item });
  const [activeTab, setActiveTab] = useState<'info' | 'platforms'>('info');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save draft as user edits
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft(editedItem);
    }, 1000);
    return () => clearTimeout(timer);
  }, [editedItem]);

  const handleFieldChange = (field: keyof SaleItem, value: any) => {
    setEditedItem(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.currentTarget.files;
    if (!fileList) return;
    
    const files = Array.from(fileList) as File[];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedItem(prev => ({
          ...prev,
          photos: [...prev.photos, reader.result as string].slice(0, 5)
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setEditedItem(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(editedItem);
    setIsSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">Review Listing</h2>
          <p className="text-stone-500 text-sm">Fine-tune the AI results before publishing.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 text-stone-500 font-bold hover:text-stone-800 transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isSaving}
            className={`px-6 py-2 bg-amber-600 text-white font-bold rounded-xl shadow-lg hover:bg-amber-700 active:scale-95 transition-all flex items-center space-x-2 ${isSaving ? 'opacity-50' : ''}`}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>Publish Listing</span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-stone-100 p-1.5 rounded-2xl mb-8">
        <button 
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'info' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-400'}`}
        >
          Catalog Details
        </button>
        <button 
          onClick={() => setActiveTab('platforms')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'platforms' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-400'}`}
        >
          Platform Copy
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {activeTab === 'info' ? (
          <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
            {/* Photos Section */}
            <section className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <label className="block text-xs font-black text-stone-400 uppercase tracking-widest">Listing Photos (max 5)</label>
              <div className="flex flex-wrap gap-3">
                {editedItem.photos.map((photo, i) => (
                  <div key={i} className="w-20 h-20 relative group rounded-xl overflow-hidden border border-stone-100">
                    <img src={photo} className="w-full h-full object-cover" alt="Item preview" />
                    <button 
                      type="button" 
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                {editedItem.photos.length < 5 && (
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-stone-200 flex items-center justify-center text-stone-400 hover:border-amber-400 hover:text-amber-600 transition-all bg-stone-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple className="hidden" />
            </section>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                <label className="block text-xs font-black text-stone-400 uppercase tracking-widest">Item Title</label>
                <input 
                  type="text" 
                  value={editedItem.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full text-lg font-bold text-stone-900 border-none p-0 focus:ring-0 placeholder:text-stone-300 bg-transparent"
                  placeholder="Listing Title"
                />
              </section>

              <section className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                <label className="block text-xs font-black text-stone-400 uppercase tracking-widest">Price ($)</label>
                <input 
                  type="number" 
                  value={editedItem.price}
                  onChange={(e) => handleFieldChange('price', parseInt(e.target.value) || 0)}
                  className="w-full text-3xl font-black text-amber-600 border-none p-0 focus:ring-0 bg-transparent"
                />
              </section>
            </div>

            <section className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <label className="block text-xs font-black text-stone-400 uppercase tracking-widest">Public Description</label>
              <textarea 
                value={editedItem.enhancedDescription}
                onChange={(e) => handleFieldChange('enhancedDescription', e.target.value)}
                rows={6}
                className="w-full text-stone-700 leading-relaxed border-none p-0 focus:ring-0 resize-none bg-transparent"
              />
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                <label className="block text-xs font-black text-stone-400 uppercase tracking-widest">Category</label>
                <select 
                  value={editedItem.category}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  className="w-full bg-stone-50 border border-stone-100 rounded-xl p-2 text-sm font-bold text-stone-600 outline-none"
                >
                  {["Furniture", "Electronics", "Kitchen", "Home Decor", "Baby/Kids", "Garden", "Tools", "Books", "Other"].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </section>

              <section className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                <label className="block text-xs font-black text-stone-400 uppercase tracking-widest">Condition</label>
                <select 
                  value={editedItem.condition}
                  onChange={(e) => handleFieldChange('condition', e.target.value)}
                  className="w-full bg-stone-50 border border-stone-100 rounded-xl p-2 text-sm font-bold text-stone-600 outline-none"
                >
                  {["New", "Like New", "Very Good", "Good", "Fair", "As Is"].map(cond => (
                    <option key={cond} value={cond}>{cond}</option>
                  ))}
                </select>
              </section>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl">
              <p className="text-xs text-stone-500 italic">This content is optimized for specific platforms. Changes here won't affect the public catalog listing.</p>
            </div>
            
            <section className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
                </div>
                <label className="text-xs font-black text-stone-400 uppercase tracking-widest">Facebook Marketplace Post</label>
              </div>
              <textarea 
                value={editedItem.facebookContent}
                onChange={(e) => handleFieldChange('facebookContent', e.target.value)}
                rows={8}
                className="w-full text-stone-600 text-sm leading-relaxed bg-stone-50 border border-stone-100 rounded-2xl p-4 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              />
            </section>

            <section className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                </div>
                <label className="text-xs font-black text-stone-400 uppercase tracking-widest">Craigslist Post</label>
              </div>
              <textarea 
                value={editedItem.craigslistContent}
                onChange={(e) => handleFieldChange('craigslistContent', e.target.value)}
                rows={8}
                className="w-full text-stone-600 text-sm leading-relaxed bg-stone-50 border border-stone-100 rounded-2xl p-4 focus:ring-2 focus:ring-purple-100 transition-all outline-none"
              />
            </section>

            <section className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                </div>
                <label className="text-xs font-black text-stone-400 uppercase tracking-widest">WhatsApp Message</label>
              </div>
              <textarea 
                value={editedItem.whatsappContent}
                onChange={(e) => handleFieldChange('whatsappContent', e.target.value)}
                rows={4}
                className="w-full text-stone-600 text-sm leading-relaxed bg-stone-50 border border-stone-100 rounded-2xl p-4 focus:ring-2 focus:ring-green-100 transition-all outline-none"
              />
            </section>
          </div>
        )}
      </form>
    </div>
  );
};

export default ItemEditor;
