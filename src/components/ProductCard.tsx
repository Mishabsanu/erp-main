'use client';

import { Product } from '@/lib/types';
import { Edit2, MoreVertical, Package, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ProductCard = ({
  product,
  onView,
  onEdit,
  onDelete,
}: ProductCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const imageSrc =
    product.image && product.image.trim() !== ''
      ? product.image
      : '/noimage.jpg';

  const handleToggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 ease-in-out relative">
      <div className="relative w-full h-48">
        <Image
          src={imageSrc}
          alt={product.name}
          layout="fill"
          objectFit="cover"
          className="rounded-t-xl"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 truncate">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500">{product.model}</p>
        <p className="text-sm text-gray-500 mt-1">{product.category}</p>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-lg font-bold text-gray-900">
            ₹{product.price?.toLocaleString() || 'N/A'}
          </p>
        </div>
      </div>
      <div className="absolute top-2 right-2">
        <div className="relative">
          <button
            onClick={handleToggleMenu}
            className="p-2 bg-white/70 rounded-full hover:bg-gray-100 transition"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  if (product._id) {
                    onView(product._id);
                  }
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Package className="w-4 h-4 text-[#0f766e]" />
                View
              </button>
              <button
                onClick={() => {
                  if (product._id) {
                    onEdit(product._id);
                  }
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Edit2 className="w-4 h-4 text-[#0f766e]" />
                Edit
              </button>
              <button
                onClick={() => {
                  if (product._id) {
                    onDelete(product._id);
                  }
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-teal-700 hover:bg-gray-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
