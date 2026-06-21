import React, { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import Logo from "./Logo";
import { useCarbonStore } from "../stores/carbonStore";

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const setTab = useCarbonStore((state) => state.setTab);
  const user = useCarbonStore((state) => state.user);

  const handleCTAClick = () => {
    if (user) {
      setTab("dashboard");
    } else {
      // Direct demo login transition
      setTab("dashboard");
    }
  };

  return (
    <nav className="animate-fade-down relative z-20 flex items-center justify-between px-5 sm:px-8 lg:px-10 py-4 sm:py-5 w-full select-none">
      {/* Logo */}
      <div 
        className="flex items-center gap-2 text-gray-900 cursor-pointer"
        onClick={() => setTab("landing")}
      >
        <Logo className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="text-sm sm:text-base font-bold tracking-tight">Questly</span>
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center gap-8">
        <a 
          href="#toolkit" 
          className="text-[13px] font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1 transition-colors"
        >
          <span>Toolkit</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </a>
        <a 
          href="#plans" 
          className="text-[13px] font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          Plans
        </a>
        <a 
          href="#news" 
          className="text-[13px] font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          News
        </a>
      </div>

      {/* CTA Button & Hamburger */}
      <div className="flex items-center gap-3">
        <button 
          onClick={handleCTAClick}
          className="bg-gray-900 text-white text-[13px] font-medium px-4 sm:px-5 py-2 rounded-full hover:bg-gray-800 transition-colors active:scale-95 duration-150"
        >
          {user ? "Go to Dashboard" : "Try It Free"}
        </button>

        {/* Hamburger Menu Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden w-9 h-9 rounded-full text-gray-900 hover:bg-gray-900/10 flex items-center justify-center transition-colors focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-4 right-4 top-full mt-2 rounded-2xl bg-white/90 backdrop-blur-xl ring-1 ring-gray-200 px-5 py-3 animate-fade-up flex flex-col gap-3 shadow-lg md:hidden">
          <a
            href="#toolkit"
            onClick={() => setIsOpen(false)}
            className="text-[15px] font-medium text-gray-700 hover:text-gray-900 border-b border-gray-100 pb-2 flex items-center justify-between"
          >
            <span>Toolkit</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </a>
          <a
            href="#plans"
            onClick={() => setIsOpen(false)}
            className="text-[15px] font-medium text-gray-700 hover:text-gray-900 border-b border-gray-100 pb-2"
          >
            Plans
          </a>
          <a
            href="#news"
            onClick={() => setIsOpen(false)}
            className="text-[15px] font-medium text-gray-700 hover:text-gray-900 pb-1"
          >
            News
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
