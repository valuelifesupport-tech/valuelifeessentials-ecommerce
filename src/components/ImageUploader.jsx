import React, { useState } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, CheckCircle } from 'lucide-react';

export default function ImageUploader({ label, value, onChange, placeholder = 'https://...' }) {
  const [uploadMode, setUploadMode] = useState('upload'); // 'upload' | 'url'
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fullImageUrl = value 
    ? (value.startsWith('http') || value.startsWith('data:') ? value : `http://localhost:5000${value}`) 
    : '';

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.fullUrl) {
        onChange(data.fullUrl);
      } else if (data.imageUrl) {
        onChange(`http://localhost:5000${data.imageUrl}`);
      }
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-slate-300 font-bold text-xs">{label}</label>}

      {/* MODE PICKER TABS */}
      <div className="flex items-center gap-2 p-1 bg-slate-800 rounded-xl border border-slate-700 w-fit text-[11px] font-bold">
        <button
          type="button"
          onClick={() => setUploadMode('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            uploadMode === 'upload' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Upload size={13} /> <span>Upload Local File</span>
        </button>

        <button
          type="button"
          onClick={() => setUploadMode('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            uploadMode === 'url' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <LinkIcon size={13} /> <span>Paste Image URL</span>
        </button>
      </div>

      {/* MODE 1: LOCAL FILE UPLOAD DROPZONE */}
      {uploadMode === 'upload' && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all ${
            dragActive 
              ? 'border-emerald-400 bg-emerald-950/40' 
              : 'border-slate-700 bg-slate-800/80 hover:border-slate-600'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-slate-700/80 text-emerald-400 flex items-center justify-center">
              {uploading ? <span className="animate-spin text-lg">⏳</span> : <Upload size={18} />}
            </div>
            <div>
              <p className="text-xs font-extrabold text-white">
                {uploading ? 'Uploading image to server...' : 'Click to Browse File or Drag & Drop'}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">Supports JPG, PNG, WEBP, GIF (Saved to server `/uploads`)</p>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: EXTERNAL URL INPUT */}
      {uploadMode === 'url' && (
        <div className="relative">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-xs pr-8"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-rose-400"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* LIVE IMAGE PREVIEW CARD */}
      {value && (
        <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-850 p-2 flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0 flex items-center justify-center">
            <img 
              src={fullImageUrl} 
              alt="Preview" 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }} 
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
              <CheckCircle size={13} /> <span>Image Ready</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono truncate">{value}</p>
          </div>

          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 text-xs font-bold shrink-0 cursor-pointer"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
