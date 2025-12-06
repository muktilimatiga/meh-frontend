import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    hideCloseButton?: boolean;
    className?: string;
}

export const ModalOverlay: React.FC<ModalOverlayProps> = ({ 
    isOpen, 
    onClose, 
    children, 
    hideCloseButton = false,
    className = '' 
}) => {
    const overlayRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div 
                className={`relative w-full bg-background rounded-lg shadow-lg border border-border animate-in zoom-in-95 duration-200 ${className}`}
                role="dialog"
                aria-modal="true"
            >
                {!hideCloseButton && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-4 top-4 h-6 w-6 rounded-full opacity-70 hover:opacity-100" 
                        onClick={onClose}
                    >
                        <X size={14} />
                    </Button>
                )}
                {children}
            </div>
        </div>
    );
};