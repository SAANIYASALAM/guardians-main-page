import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/logo_no_background.png';

const Navbar = ({ floating = true }) => {
    return (
        <div className={`${floating ? 'absolute top-6 left-0' : 'relative'} w-full z-[100] pointer-events-auto px-4 md:px-12 flex justify-center`}>
            <nav className="relative w-full max-w-[1400px] flex justify-between items-center px-8 md:px-10 py-1 rounded-[1.5rem] backdrop-blur-2xl bg-gradient-to-r from-[rgba(10,10,10,0.8)] via-[rgba(30,25,10,0.6)] to-[rgba(10,10,10,0.8)] border border-[rgba(212,176,91,0.25)] shadow-[0_8px_32px_0_rgba(0,0,0,0.7),inset_0_2px_10px_rgba(212,176,91,0.1),inset_0_-2px_10px_rgba(0,0,0,0.5)]">

                {/* Logo Left */}
                <div className="flex items-center relative z-20">
                    <Link to="/" className="flex items-center">
                        <img src={logo} alt="Logo" className="h-10 md:h-12 object-contain drop-shadow-[0_0_5px_rgba(212,176,91,0.2)]" />
                    </Link>
                </div>

                {/* Links Center */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-6 md:gap-12 z-10 w-full justify-center pointer-events-none">
                    <div className="pointer-events-auto flex items-center gap-6 md:gap-12">
                        <Link to="/" className="relative z-10 text-[11px] md:text-sm text-[rgb(212,176,91)] hover:text-white uppercase tracking-[0.15em] font-medium transition-colors duration-300">Home</Link>
                        <Link to="/arts" className="relative z-10 text-[11px] md:text-sm text-[rgb(212,176,91)] hover:text-white uppercase tracking-[0.15em] font-medium transition-colors duration-300">Arts</Link>
                        <Link to="/sports" className="relative z-10 text-[11px] md:text-sm text-[rgb(212,176,91)] hover:text-white uppercase tracking-[0.15em] font-medium transition-colors duration-300">Sports</Link>
                    </div>
                </div>

                {/* Logo Right (Duplicate) */}
                <div className="flex items-center relative z-20">
                    <Link to="/" className="flex items-center">
                        <img src={logo} alt="Logo Right" className="h-10 md:h-12 object-contain drop-shadow-[0_0_5px_rgba(212,176,91,0.2)]" />
                    </Link>
                </div>

            </nav>
        </div>
    );
};

export default Navbar;

