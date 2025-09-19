import React, { forwardRef } from 'react';
import { MicrophoneIcon, StopIcon } from './Icons';

// --- Custom Speech Recognition Hook ---
const useSpeechRecognition = (onResult: (transcript: string) => void) => {
    const [isListening, setIsListening] = React.useState(false);
    const recognitionRef = React.useRef<any>(null);

    React.useEffect(() => {
        // Fix: Cast window to any to access non-standard SpeechRecognition APIs and prevent TypeScript errors.
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech recognition not supported in this browser.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
            setIsListening(false);
        };
        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
        };
        recognition.onend = () => {
            setIsListening(false);
        };
        recognitionRef.current = recognition;
    }, [onResult]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
        setIsListening(!isListening);
    };
    
    return { isListening, toggleListening };
};

// --- Form Element Components ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    enableVoice?: boolean;
    onVoiceResult?: (text: string) => void;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, name, enableVoice = false, onVoiceResult, ...props }, ref) => {
    const { isListening, toggleListening } = useSpeechRecognition((transcript) => {
        if(onVoiceResult) onVoiceResult(transcript);
    });

    return (
        <div className="form-control w-full">
            <label className="label" htmlFor={name}>
                <span className="label-text font-medium">{label}</span>
            </label>
            <div className="relative">
                <input ref={ref} id={name} name={name} className="input input-bordered w-full" {...props} />
                {enableVoice && (
                    <button type="button" onClick={toggleListening} className={`absolute top-0 right-0 h-full px-3 btn btn-ghost btn-sm ${isListening ? 'text-red-500' : ''}`}>
                        {isListening ? <StopIcon /> : <MicrophoneIcon />}
                    </button>
                )}
            </div>
        </div>
    );
});

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { value: string | number; label: string }[];
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, name, options, ...props }, ref) => (
    <div className="form-control w-full">
        <label className="label" htmlFor={name}>
            <span className="label-text font-medium">{label}</span>
        </label>
        <select ref={ref} id={name} name={name} className="select select-bordered w-full" {...props}>
            <option value="">Select...</option>
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
));

interface RadioGroupProps {
    label: string;
    name: string;
    options: string[];
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export const RadioGroup: React.FC<RadioGroupProps> = ({ label, name, options, value, onChange }) => (
    <div className="form-control w-full">
        <label className="label">
            <span className="label-text font-medium">{label}</span>
        </label>
        <div className="flex items-center space-x-4">
            {options.map(opt => (
                <label key={opt} className="label cursor-pointer space-x-2">
                    <input
                        type="radio"
                        name={name}
                        className="radio"
                        value={opt}
                        checked={value === opt}
                        onChange={onChange}
                    />
                    <span className="label-text">{opt}</span>
                </label>
            ))}
        </div>
    </div>
);