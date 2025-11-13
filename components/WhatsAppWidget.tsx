import React from 'react';
import { WhatsAppIcon } from './Icons';

const WhatsAppWidget: React.FC = () => {
    return (
        <div className="fixed bottom-6 right-6 z-50">
            <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-transform hover:scale-110 flex items-center justify-center"
                aria-label="Chat on WhatsApp"
            >
                <WhatsAppIcon />
            </a>
        </div>
    );
};

export default WhatsAppWidget;