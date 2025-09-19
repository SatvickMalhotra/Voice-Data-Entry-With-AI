
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { PolicyData } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { themes } from './constants';
import DataEntryForm from './components/DataEntryForm';
import DataTable from './components/DataTable';
import { UploadIcon, WandIcon, FocusIcon, TableIcon } from './components/Icons';

// --- Header Component ---
const Header: React.FC<{ currentTheme: string; onThemeChange: (theme: string) => void; }> = ({ currentTheme, onThemeChange }) => (
    <header className="navbar bg-base-100 shadow-md rounded-box mb-4">
        <div className="flex-1">
            <a className="btn btn-ghost text-xl">Mswasth Data Entry Portal</a>
        </div>
        <div className="flex-none">
            <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn m-1">
                    Theme
                    <svg width="12px" height="12px" className="h-2 w-2 fill-current opacity-60 inline-block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048"><path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path></svg>
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] p-2 shadow-2xl bg-base-300 rounded-box w-52 max-h-96 overflow-y-auto">
                    {themes.map(theme => (
                        <li key={theme}><input type="radio" name="theme-dropdown" className="theme-controller btn btn-sm btn-block btn-ghost justify-start" aria-label={theme} value={theme} checked={theme === currentTheme} onChange={(e) => onThemeChange(e.target.value)} /></li>
                    ))}
                </ul>
            </div>
        </div>
    </header>
);

// --- ImageManager Component ---
const imageFileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

interface ImageManagerProps {
    onAutofill: (data: Partial<PolicyData>) => void;
    isFocusMode: boolean;
    onToggleFocusMode: () => void;
    imagePreview: string | null;
    setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
    setImageFile: React.Dispatch<React.SetStateAction<File | null>>;
}
const ImageManager: React.FC<ImageManagerProps> = ({ onAutofill, isFocusMode, onToggleFocusMode, imagePreview, setImagePreview, setImageFile }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAutofill = async () => {
        const file = (fileInputRef.current?.files as FileList)?.[0];
        if (!file) {
            setError("Please select an image file first.");
            return;
        }
        setIsLoading(true);
        setError('');
        
        try {
            if (!process.env.API_KEY) {
                throw new Error("API_KEY environment variable not set.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imagePart = await imageFileToGenerativePart(file);

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [
                    imagePart,
                    { text: 'Analyze the document image and extract customer and policy information. Respond with a JSON object containing the extracted data. Use YYYY-MM-DD format for dates.' }
                ]},
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            customerName: { type: Type.STRING },
                            dateOfBirth: { type: Type.STRING },
                            mobileNumber: { type: Type.STRING },
                            partnerName: { type: Type.STRING },
                            productDetails: { type: Type.STRING },
                            premium: { type: Type.STRING },
                            branchName: { type: Type.STRING },
                            branchCode: { type: Type.STRING },
                            region: { type: Type.STRING },
                            gender: { type: Type.STRING },
                            customerId: { type: Type.STRING },
                            enrolmentDate: { type: Type.STRING },
                            savingsAccountNumber: { type: Type.STRING },
                            nomineeName: { type: Type.STRING },
                            nomineeDateOfBirth: { type: Type.STRING },
                            nomineeRelationship: { type: Type.STRING },
                        }
                    }
                }
            });

            const parsedData = JSON.parse(response.text);
            onAutofill(parsedData);

        } catch (err) {
            console.error("Gemini API error:", err);
            setError("Failed to extract data. Please check the image or try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 bg-base-100 shadow-xl rounded-2xl">
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="file-input file-input-bordered w-full md:flex-1" />
                <button onClick={handleAutofill} className="btn btn-secondary w-full md:w-auto" disabled={isLoading || !imagePreview}>
                    {isLoading ? <span className="loading loading-spinner"></span> : <WandIcon />}
                    Autofill with AI
                </button>
                <button onClick={onToggleFocusMode} className="btn btn-ghost w-full md:w-auto" disabled={!imagePreview}>
                    {isFocusMode ? <TableIcon /> : <FocusIcon />}
                    {isFocusMode ? 'Table View' : 'Focus Mode'}
                </button>
            </div>
            {error && <div className="text-error mt-2">{error}</div>}
            {imagePreview && (
                <div className="mt-4 border-2 border-dashed rounded-lg p-2">
                    <img src={imagePreview} alt="Document Preview" className="max-h-96 w-auto mx-auto rounded" />
                </div>
            )}
        </div>
    );
};


// --- Main App Component ---
function App() {
    const [policies, setPolicies] = useLocalStorage<PolicyData[]>('mswasth-policies', []);
    const [currentPolicy, setCurrentPolicy] = useState<PolicyData | null>(null);
    const [theme, setTheme] = useLocalStorage('mswasth-theme', 'light');

    const [isFocusMode, setIsFocusMode] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const handleSavePolicy = useCallback((policyData: PolicyData) => {
        setPolicies(prevPolicies => {
            const exists = prevPolicies.some(p => p.id === policyData.id);
            if (exists) {
                return prevPolicies.map(p => p.id === policyData.id ? policyData : p);
            }
            return [...prevPolicies, policyData];
        });
        setCurrentPolicy(null);
    }, [setPolicies]);

    const handleEditPolicy = useCallback((id: string) => {
        const policyToEdit = policies.find(p => p.id === id);
        if (policyToEdit) {
            setCurrentPolicy(policyToEdit);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [policies]);

    const handleDeletePolicy = useCallback((id: string) => {
        if (window.confirm("Are you sure you want to delete this entry?")) {
            setPolicies(prev => prev.filter(p => p.id !== id));
        }
    }, [setPolicies]);

    const handleDeleteAll = useCallback(() => {
        if (window.confirm("Are you sure you want to delete ALL entries? This action cannot be undone.")) {
            setPolicies([]);
        }
    }, [setPolicies]);

    const handleClearForm = useCallback(() => {
        setCurrentPolicy(null);
    }, []);

    const handleAutofill = useCallback((data: Partial<PolicyData>) => {
        setCurrentPolicy(prev => ({
            ...(prev || { id: '', tenure: '', cseName: '', gender: '', nomineeGender: '', remarks: '' }), // create a base object
            ...data, // overwrite with AI data
            id: prev?.id || '', // keep existing ID if editing
        } as PolicyData));
    }, []);

    const appGridClass = useMemo(() => 
      isFocusMode && imagePreview
      ? 'grid grid-cols-1 lg:grid-cols-2 gap-4'
      : 'flex flex-col gap-4'
    , [isFocusMode, imagePreview]);

    return (
        <div className="min-h-screen bg-base-200 p-4">
            <div className="max-w-screen-2xl mx-auto">
                <Header currentTheme={theme} onThemeChange={setTheme} />

                <main className={appGridClass}>
                    <div className="flex flex-col gap-4">
                        <DataEntryForm
                            onSave={handleSavePolicy}
                            currentData={currentPolicy}
                            onClear={handleClearForm}
                        />
                        {(!isFocusMode || !imagePreview) && (
                            <ImageManager
                                onAutofill={handleAutofill}
                                isFocusMode={isFocusMode}
                                onToggleFocusMode={() => setIsFocusMode(prev => !prev)}
                                imagePreview={imagePreview}
                                setImagePreview={setImagePreview}
                                setImageFile={setImageFile}
                            />
                        )}
                    </div>

                    {isFocusMode && imagePreview && (
                         <div className="p-4 md:p-6 bg-base-100 shadow-xl rounded-2xl sticky top-4 self-start">
                             <h3 className="text-xl font-bold mb-4">Document Viewer</h3>
                            <img src={imagePreview} alt="Document Preview" className="w-full h-auto rounded" />
                        </div>
                    )}

                    <div className={isFocusMode && imagePreview ? 'lg:col-span-2' : ''}>
                        {(!isFocusMode || !imagePreview) && (
                            <DataTable
                                data={policies}
                                onEdit={handleEditPolicy}
                                onDelete={handleDeletePolicy}
                                onDeleteAll={handleDeleteAll}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default App;
