import React, { useState } from 'react';
import { WhatsAppIcon, CloseIcon, DenfitLogo } from './Icons';

const WhatsAppWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const whatsappNumber = '923479317516';
    const message = "Hi, I have a question about DENFIT products...";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen && (
                 <div className="bg-white rounded-lg shadow-2xl w-80 animate-fade-in-up mb-4">
                    <header className="bg-green-600 text-white p-3 flex items-center justify-between rounded-t-lg">
                        <div className="flex items-center gap-3">
                            <DenfitLogo showText={false} />
                            <div>
                                <h3 className="font-bold">Denfit Support</h3>
                                <p className="text-xs">Typically replies within an hour</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)}><CloseIcon /></button>
                    </header>
                    <main className="p-4 bg-gray-50 text-gray-800">
                        Hi! Click below to chat with us on WhatsApp for any questions or support.
                    </main>
                    <footer className="p-4 bg-white border-t rounded-b-lg">
                        <a 
                            href={whatsappUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-green-500 text-white p-3 rounded-md shadow-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2 w-full"
                        >
                            <WhatsAppIcon />
                            <span>Chat on WhatsApp</span>
                        </a>
                    </footer>
                </div>
            )}
             <button
                onClick={() => setIsOpen(!isOpen)}
                className={`bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-transform hover:scale-110 flex items-center justify-center ${isOpen ? 'opacity-0' : 'opacity-100'}`}
                aria-label="Chat on WhatsApp"
            >
                <WhatsAppIcon />
            </button>
        </div>
    );
};

export default WhatsAppWidget;
