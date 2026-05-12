'use client';

import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import { SearchInput } from './SearchInput';
import { Package, Hash, CheckCircle2, ChevronRight, Search } from 'lucide-react';

interface ItemDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: any) => void;
  items: any[];
  title: string;
  placeholder?: string;
  type?: 'product' | 'material';
}

const ItemDiscoveryModal: React.FC<ItemDiscoveryModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  items,
  title,
  placeholder = 'Search registry...',
  type = 'product'
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    const lowerSearch = searchTerm.toLowerCase();
    return items.filter(item => 
      item.name?.toLowerCase().includes(lowerSearch) || 
      item.itemCode?.toLowerCase().includes(lowerSearch)
    );
  }, [items, searchTerm]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title} 
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 sticky top-0 bg-white pb-4 z-10">
          <SearchInput 
            placeholder={placeholder} 
            onSearchChange={setSearchTerm} 
            initialSearchTerm={searchTerm}
          />
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
            {filteredItems.length} Records Found
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <button
                key={item._id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="group flex items-start gap-5 p-6 bg-white border border-gray-100 hover:border-teal-500 hover:bg-teal-50/30 rounded-[2rem] transition-all text-left shadow-sm hover:shadow-xl hover:shadow-teal-900/5 relative overflow-hidden"
              >
                <div className="w-14 h-14 bg-gray-50 group-hover:bg-teal-700 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-white transition-all shadow-inner shrink-0">
                  {type === 'product' ? <Package size={24} /> : <Hash size={24} />}
                </div>
                
                <div className="flex-1 pr-8">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.itemCode || 'No SKU'}</span>
                    {item.availableQty > 0 && (
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    )}
                  </div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-2 line-clamp-1">{item.name}</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Available Level</span>
                      <span className={`text-xs font-black ${item.availableQty > 0 ? 'text-teal-700' : 'text-rose-500'}`}>
                        {item.availableQty !== undefined ? `${item.availableQty} ${item.unit || 'Units'}` : 'Not Specified'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-teal-700 group-hover:text-white transition-all -rotate-45 group-hover:rotate-0">
                  <ChevronRight size={16} strokeWidth={3} />
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-200 mx-auto mb-4 border border-gray-100 shadow-sm">
                  <Search size={24} />
               </div>
               <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No matching records detected in the registry</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ItemDiscoveryModal;
