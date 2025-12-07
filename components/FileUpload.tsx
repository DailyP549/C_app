import React from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFileName: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFileName }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  return (
    <div className="w-full mb-8">
      <label 
        htmlFor="pdf-upload" 
        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 
        ${selectedFileName 
          ? 'border-secondary bg-green-50' 
          : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-primary'
        }`}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {selectedFileName ? (
            <>
              <svg className="w-10 h-10 mb-3 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p className="mb-2 text-sm text-secondary font-semibold">{selectedFileName}</p>
              <p className="text-xs text-slate-500">Click to change file</p>
            </>
          ) : (
            <>
              <svg className="w-10 h-10 mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload textbook</span> or drag and drop</p>
              <p className="text-xs text-slate-500">PDF (NCERT 6th Std recommended)</p>
            </>
          )}
        </div>
        <input id="pdf-upload" type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
      </label>
    </div>
  );
};