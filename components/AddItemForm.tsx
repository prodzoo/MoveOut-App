
import React, { useState, useRef } from 'react';
import { SaleItem } from '../types';
import { analyzeItem } from '../services/geminiService';

interface AddItemFormProps {
  onReview: (item: SaleItem) => void;
  onCancel: () => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ onReview, onCancel }) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    "Analyzing visual features...",
    "Scanning for product links...",
    "Drafting platform listings...",
    "Setting suggested pricing...",
    "Finalizing details..."
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.currentTarget.files;
    if (!fileList) return;
    
    const files = Array.from(fileList) as File[];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result as string].slice(0, 5));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (photos.length === 0) {
      alert("Please add at least one photo.");
      return;
    }

    setIsAnalyzing(true);
    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % steps.length;
      setAnalysisStep(step);
    }, 1500);

    try {
      const aiResult = await analyzeItem(photos, description);
      
      const newItem: SaleItem = {
        id: crypto.randomUUID(),
        title: aiResult.title,
        originalDescription: description,
        enhancedDescription: aiResult.enhancedDescription,
        price: aiResult.suggestedPrice,
        category: aiResult.category,
        condition: aiResult.condition,
        photos: photos,
        facebookContent: aiResult.facebookContent,
        craigslistContent: aiResult.craigslistContent,
        whatsappContent: aiResult.whatsappContent,
        createdAt: Date.now(),
        isSold: false,
      };

      onReview(newItem);
    } catch (error) {
      console.error(error);
      alert("Something went wrong during analysis. Please try again.");
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-stone-100 border-t-amber-600 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-stone-900">AI is working...</h3>
          <p className="text-stone-500 font-medium transition-all duration-500">{steps[analysisStep]}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-300">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-900">Create New Listing</h2>
        <button onClick={onCancel} className="text-stone-400 hover:text-stone-600">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-amber-800 leading-relaxed font-medium">
            AI will identify your item, suggest a price, and write professional platform-specific content. You'll be able to review and edit everything on the next screen.
          </p>
        </div>

        {/* Photo Section */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-stone-700 uppercase tracking-wider">Item Photos</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {photos.map((photo, i) => (
              <div key={i} className="aspect-square relative rounded-xl overflow-hidden border border-stone-200 group">
                <img src={photo} className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => handleRemovePhoto(i)}
                  className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
            {photos.length < 5 && (
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center text-stone-400 hover:border-amber-400 hover:text-amber-600 transition-colors bg-stone-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-widest">Add</span>
              </button>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            multiple 
            className="hidden" 
          />
        </div>

        {/* Description Section */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-stone-700 uppercase tracking-wider">Quick Details</label>
          <textarea 
            className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all placeholder:text-stone-300 min-h-[120px] text-stone-900"
            placeholder="Tell us what you're selling. Tip: Paste an Amazon link for a technical spec boost!"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Action Button */}
        <button 
          type="submit"
          disabled={photos.length === 0}
          className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-200 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Analyze with AI</span>
        </button>
      </form>
    </div>
  );
};

export default AddItemForm;
