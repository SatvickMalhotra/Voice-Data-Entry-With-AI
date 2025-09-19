
import React, { useState, useEffect, useCallback } from 'react';
import { PolicyData } from '../types';
import { partnerData, nomineeRelationships } from '../constants';
import { Input, Select, RadioGroup } from './FormElements';

interface DataEntryFormProps {
    onSave: (data: PolicyData) => void;
    currentData: PolicyData | null;
    onClear: () => void;
}

const emptyForm: PolicyData = {
    id: '', partnerName: '', productDetails: '', premium: '', tenure: '', cseName: '',
    branchName: '', branchCode: '', region: '', customerName: '', gender: '',
    dateOfBirth: '', mobileNumber: '', customerId: '', enrolmentDate: '',
    savingsAccountNumber: '', csbCode: '', d2cRoCode: '', nomineeName: '',
    nomineeDateOfBirth: '', nomineeRelationship: '', nomineeMobileNumber: '',
    nomineeGender: '', remarks: ''
};

const DataEntryForm: React.FC<DataEntryFormProps> = ({ onSave, currentData, onClear }) => {
    const [formData, setFormData] = useState<PolicyData>(emptyForm);

    useEffect(() => {
        setFormData(currentData ? { ...currentData } : emptyForm);
    }, [currentData]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);
    
    const handleVoiceInput = useCallback((name: keyof PolicyData, text: string) => {
        setFormData(prev => ({ ...prev, [name]: text }));
    }, []);

    const handlePartnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            productDetails: '',
            premium: '',
            tenure: '',
            cseName: ''
        }));
    };

    const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            premium: '',
            tenure: '',
            cseName: ''
        }));
    };

    const handlePremiumChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = e.target;
        const premiumValue = parseInt(value, 10);
        const product = partnerData[formData.partnerName]?.[formData.productDetails];
        const selectedPremiumData = product?.find(p => p.Premium === premiumValue);

        if (selectedPremiumData) {
            setFormData(prev => ({
                ...prev,
                premium: value,
                tenure: selectedPremiumData.Tenure.toString(),
                cseName: selectedPremiumData['CSE Name']
            }));
        } else {
             setFormData(prev => ({ ...prev, premium: value, tenure: '', cseName: '' }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: formData.id || new Date().toISOString() });
        setFormData(emptyForm);
    };

    const productOptions = formData.partnerName ? Object.keys(partnerData[formData.partnerName] || {}).map(p => ({ value: p, label: p })) : [];
    const premiumOptions = formData.partnerName && formData.productDetails ? (partnerData[formData.partnerName]?.[formData.productDetails] || []).map(p => ({ value: p.Premium, label: `₹ ${p.Premium}` })) : [];

    const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 pb-2 border-b-2 border-primary">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {children}
        </div>
      </div>
    );
    
    return (
        <form onSubmit={handleSubmit} className="p-4 md:p-6 bg-base-100 shadow-xl rounded-2xl">
            <Section title="Policy Information">
                <Select label="Partner Name" name="partnerName" value={formData.partnerName} onChange={handlePartnerChange} options={Object.keys(partnerData).map(p => ({ value: p, label: p }))} required/>
                <Select label="Product Details" name="productDetails" value={formData.productDetails} onChange={handleProductChange} options={productOptions} disabled={!formData.partnerName} required/>
                <Select label="Premium" name="premium" value={formData.premium} onChange={handlePremiumChange} options={premiumOptions} disabled={!formData.productDetails} required/>
                <Input label="Tenure (Years)" name="tenure" value={formData.tenure} onChange={handleChange} readOnly className="bg-base-200" />
                <Input label="CSE Name" name="cseName" value={formData.cseName} onChange={handleChange} readOnly className="bg-base-200" />
            </Section>

            <Section title="Branch & Customer Information">
                <Input label="Branch Name" name="branchName" value={formData.branchName} onChange={handleChange} onVoiceResult={(text) => handleVoiceInput('branchName', text)} enableVoice required/>
                <Input label="Branch Code" name="branchCode" value={formData.branchCode} onChange={handleChange} onVoiceResult={(text) => handleVoiceInput('branchCode', text)} enableVoice required/>
                <Input label="Region" name="region" value={formData.region} onChange={handleChange} onVoiceResult={(text) => handleVoiceInput('region', text)} enableVoice required/>
                <Input label="Customer Name" name="customerName" value={formData.customerName} onChange={handleChange} onVoiceResult={(text) => handleVoiceInput('customerName', text)} enableVoice required/>
                <RadioGroup label="Gender" name="gender" options={['Male', 'Female', 'Other']} value={formData.gender} onChange={handleChange} />
                <Input label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required/>
                <Input label="Mobile Number" name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={handleChange} onVoiceResult={(text) => handleVoiceInput('mobileNumber', text.replace(/\s/g, ''))} enableVoice required/>
                <Input label="Customer ID" name="customerId" value={formData.customerId} onChange={handleChange} onVoiceResult={(text) => handleVoiceInput('customerId', text)} enableVoice required/>
                <Input label="Enrolment Date" name="enrolmentDate" type="date" value={formData.enrolmentDate} onChange={handleChange} required/>
                <Input label="Savings A/C No." name="savingsAccountNumber" value={formData.savingsAccountNumber} onChange={handleChange} onVoiceResult={(text) => handleVoiceInput('savingsAccountNumber', text.replace(/\s/g, ''))} enableVoice required/>
                <Input label="CSB Code" name="csbCode" value={formData.csbCode} onChange={handleChange} onVoiceResult={(text) => handleVoiceInput('csbCode', text)} enableVoice />
                <Input label="D2C Code / RO Code" name="d2cRoCode" value={formData.d2cRoCode} onChange={handleChange} onVoiceResult={(text) => handleVoiceInput('d2cRoCode', text)} enableVoice />
            </Section>

            <Section title="Nominee Details">
                <Input label="Nominee Name" name="nomineeName" value={formData.nomineeName} onChange={handleChange} onVoiceResult={(text) => handleVoiceInput('nomineeName', text)} enableVoice required/>
                <Input label="Nominee Date of Birth" name="nomineeDateOfBirth" type="date" value={formData.nomineeDateOfBirth} onChange={handleChange} />
                <Select label="Nominee Relationship" name="nomineeRelationship" value={formData.nomineeRelationship} onChange={handleChange} options={nomineeRelationships.map(r => ({ value: r, label: r }))} required />
                <Input label="Nominee Mobile Number" name="nomineeMobileNumber" type="tel" value={formData.nomineeMobileNumber} onChange={handleChange} onVoiceResult={(text) => handleVoiceInput('nomineeMobileNumber', text.replace(/\s/g, ''))} enableVoice />
                <RadioGroup label="Nominee Gender" name="nomineeGender" options={['Male', 'Female', 'Other']} value={formData.nomineeGender} onChange={handleChange} />
            </Section>

            <div>
                 <h3 className="text-xl font-bold mb-4 pb-2 border-b-2 border-primary">Remarks</h3>
                <textarea name="remarks" value={formData.remarks} onChange={handleChange} className="textarea textarea-bordered w-full" rows={3}></textarea>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
                <button type="button" className="btn btn-ghost" onClick={() => { setFormData(emptyForm); onClear(); }}>Clear Form</button>
                <button type="submit" className="btn btn-primary">{formData.id ? 'Update Entry' : 'Add Entry'}</button>
            </div>
        </form>
    );
};

export default DataEntryForm;
