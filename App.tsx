
import React, { useState, useEffect, useCallback } from 'react';
import { ViewState, SaleItem } from './types';
import Header from './components/Header';
import Catalog from './components/Catalog';
import AdminDashboard from './components/AdminDashboard';
import AddItemForm from './components/AddItemForm';
import ItemEditor from './components/ItemEditor';
import { 
  getAllItems, 
  saveItem, 
  deleteItem, 
  updateItemStatus, 
  getLatestDraft, 
  clearDrafts, 
  saveDraft 
} from './services/db';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('catalog');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('moveout_admin') === 'true';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<SaleItem | null>(null);
  const [pendingDraft, setPendingDraft] = useState<SaleItem | null>(null);
  const [initialCategory, setInitialCategory] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedItems = await getAllItems();
      setItems(storedItems.sort((a, b) => b.createdAt - a.createdAt));
      
      const draft = await getLatestDraft();
      if (draft) setPendingDraft(draft);

      // Check for category filter in URL
      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      if (cat) setInitialCategory(cat);

    } catch (err) {
      console.error("Failed to fetch items:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    localStorage.setItem('moveout_admin', isAdmin.toString());
  }, [isAdmin]);

  const handleSaveItem = async (updatedItem: SaleItem) => {
    await saveItem(updatedItem);
    await clearDrafts();
    setPendingDraft(null);
    await fetchItems();
    setView('admin');
    setSelectedItem(null);
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      await deleteItem(id);
      await fetchItems();
    }
  };

  const handleToggleSold = async (id: string, currentStatus: boolean) => {
    await updateItemStatus(id, !currentStatus);
    await fetchItems();
  };

  const handleEditClick = (item: SaleItem) => {
    setSelectedItem(item);
    setView('edit');
  };

  const handleStartAdd = () => {
    setIsAdmin(true);
    setView('add');
  };

  const handleResumeDraft = () => {
    if (pendingDraft) {
      setSelectedItem(pendingDraft);
      setView('edit');
      setPendingDraft(null);
    }
  };

  const handleDiscardDraft = async () => {
    await clearDrafts();
    setPendingDraft(null);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 flex flex-col">
      <Header 
        view={view} 
        setView={setView} 
        isAdmin={isAdmin} 
        setIsAdmin={setIsAdmin} 
      />

      {pendingDraft && (view === 'admin' || view === 'catalog') && isAdmin && (
        <div className="bg-amber-600 text-white px-4 py-3 flex items-center justify-between animate-in slide-in-from-top duration-300 z-50 sticky top-16">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-bold">Unsaved draft detected.</span>
          </div>
          <div className="flex space-x-3">
            <button onClick={handleDiscardDraft} className="text-xs font-medium opacity-80 hover:opacity-100">Discard</button>
            <button onClick={handleResumeDraft} className="bg-white text-amber-600 px-3 py-1 rounded-lg text-xs font-bold shadow-sm">Resume Review</button>
          </div>
        </div>
      )}

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            <p className="text-stone-500 animate-pulse">Gathering your treasures...</p>
          </div>
        ) : (
          <>
            {view === 'catalog' && (
              <Catalog 
                items={items.filter(i => !i.isSold)} 
                onAddClick={handleStartAdd} 
                initialCategory={initialCategory}
              />
            )}
            {view === 'admin' && (
              <AdminDashboard 
                items={items} 
                onDelete={handleDeleteItem} 
                onToggleSold={handleToggleSold}
                onAddClick={() => setView('add')}
                onEdit={handleEditClick}
              />
            )}
            {view === 'add' && (
              <AddItemForm 
                onReview={async (item) => {
                  await saveDraft(item);
                  setSelectedItem(item);
                  setView('edit');
                }} 
                onCancel={() => setView('admin')} 
              />
            )}
            {view === 'edit' && selectedItem && (
              <ItemEditor 
                item={selectedItem} 
                onSave={handleSaveItem} 
                onCancel={() => setView('admin')} 
              />
            )}
          </>
        )}
      </main>

      {view !== 'add' && view !== 'edit' && isAdmin && (
        <button 
          onClick={() => setView('add')}
          className="fixed bottom-6 right-6 md:hidden bg-amber-600 text-white p-4 rounded-full shadow-lg active:scale-95 transition-transform z-50 flex items-center justify-center shadow-amber-600/30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default App;
