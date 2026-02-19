import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500">
              © {new Date().getFullYear()} SmartSMS. All rights reserved.
            </span>
          </div>
          
          <div className="flex items-center space-x-1 text-sm text-slate-500">
            <span>Made with</span>
            <Heart size={14} className="text-red-500 fill-red-500" />
            <span>for better education management</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
