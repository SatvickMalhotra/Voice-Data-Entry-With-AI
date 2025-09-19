
import React, { useState, useMemo } from 'react';
import { PolicyData } from '../types';
import { EditIcon, DeleteIcon } from './Icons';

// --- Export Service Logic ---
// These functions rely on global objects loaded from CDNs in index.html
declare const xlsx: any;
declare const jspdf: any;

const exportToCSV = (data: PolicyData[], fileName: string) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => JSON.stringify((row as any)[header], (key, value) => value === null ? '' : value)).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const exportToXLSX = (data: PolicyData[], fileName: string) => {
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Policies');
    xlsx.writeFile(workbook, `${fileName}.xlsx`);
};

const exportToPDF = (data: PolicyData[], fileName: string) => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF({ orientation: 'landscape' });
    const tableColumn = Object.keys(data[0]);
    const tableRows = data.map(row => Object.values(row));
    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        theme: 'grid',
        headStyles: { fillColor: [22, 160, 133] },
        styles: { fontSize: 5 },
    });
    doc.text('Mswasth Policy Data', 14, 15);
    doc.save(`${fileName}.pdf`);
};

// --- DataTable Component ---
interface DataTableProps {
    data: PolicyData[];
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onDeleteAll: () => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, onEdit, onDelete, onDeleteAll }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof PolicyData; direction: 'ascending' | 'descending' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const filteredData = useMemo(() => {
        return data.filter(item =>
            Object.values(item).some(val =>
                String(val).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [data, searchTerm]);

    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredData, sortConfig]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedData, currentPage, itemsPerPage]);

    const requestSort = (key: keyof PolicyData) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    
    const headers: { key: keyof PolicyData, label: string }[] = [
        { key: 'customerName', label: 'Customer Name' },
        { key: 'partnerName', label: 'Partner' },
        { key: 'productDetails', label: 'Product' },
        { key: 'premium', label: 'Premium' },
        { key: 'enrolmentDate', label: 'Enrolment Date'},
        { key: 'branchName', label: 'Branch'},
    ];

    return (
        <div className="p-4 md:p-6 bg-base-100 shadow-xl rounded-2xl">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <input
                    type="text"
                    placeholder="Search all fields..."
                    className="input input-bordered w-full md:w-auto"
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
                <div className="flex items-center gap-2">
                     <span className="font-medium">Export:</span>
                    <button onClick={() => exportToCSV(data, 'mswasth_policies')} className="btn btn-sm btn-outline btn-success">CSV</button>
                    <button onClick={() => exportToXLSX(data, 'mswasth_policies')} className="btn btn-sm btn-outline btn-success">XLSX</button>
                    <button onClick={() => exportToPDF(data, 'mswasth_policies')} className="btn btn-sm btn-outline btn-success">PDF</button>
                    <button onClick={onDeleteAll} className="btn btn-sm btn-error">Delete All</button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                    <thead>
                        <tr>
                            {headers.map(({key, label}) => (
                                <th key={key} onClick={() => requestSort(key)} className="cursor-pointer">
                                    {label} {sortConfig?.key === key && (sortConfig.direction === 'ascending' ? '▲' : '▼')}
                                </th>
                            ))}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map(item => (
                            <tr key={item.id} className="hover">
                                {headers.map(({key}) => <td key={key}>{item[key]}</td>)}
                                <td className="flex space-x-2">
                                    <button onClick={() => onEdit(item.id)} className="btn btn-xs btn-ghost text-info"><EditIcon /></button>
                                    <button onClick={() => onDelete(item.id)} className="btn btn-xs btn-ghost text-error"><DeleteIcon /></button>
                                </td>
                            </tr>
                        ))}
                         {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={headers.length + 1} className="text-center py-4">No data available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
                <div className="flex items-center gap-2">
                    <span>Rows per page:</span>
                    <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="select select-bordered select-sm">
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
                <div className="btn-group">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="btn" disabled={currentPage === 1}>«</button>
                    <button className="btn">Page {currentPage} of {totalPages}</button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="btn" disabled={currentPage === totalPages}>»</button>
                </div>
            </div>
        </div>
    );
};

export default DataTable;
