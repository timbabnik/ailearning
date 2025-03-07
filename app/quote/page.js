'use client'

import { useState } from 'react';
import { X } from 'lucide-react';

export default function QuotePage() {
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

 

  return (
    <div className="min-h-screen bg-[#1a1b1e] flex items-center justify-center">
      <button
        onClick={() => alert('Button clicked!')}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
      >
        Click Me
      </button>
    </div>
  );
}
