import { getApiUrl } from '../../api/config';
import React, { useState } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, CheckCircle, FolderOpen, Search, XCircle } from 'lucide-react';

export default function ImageUploader({ label, value, onChange, placeholder = 'https://...' }) {
  const [uploadMode, setUploadMode] = useState('upload'); // 'upload' | 'media' | 'url'
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaList, setMediaList] = useState([]);
  const [mediaSearch, setMediaSearch] = useState('');
  const [loadingMedia, setLoadingMedia] = useState(false);

  const resolveImgUrl = (val) => {
    if (!val || typeof val !== 'string' || !val.trim()) return '';
    let clean = val.trim();

    if (clean.startsWith('data:')) return clean;

    if (clean.includes('/uploads/')) {
      const filename = clean.split('/uploads/').pop();
      return getApiUrl(`/api/media/file/${filename}`);
    }

    if (clean.includes('/images/')) {
      const relative = clean.split('/images/').pop();
      return `/images/${relative}`;
    }

    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;

    const path = clean.startsWith('/') ? clean : `/${clean}`;
    return getApiUrl(path);
  };

  const fullImageUrl = resolveImgUrl(value);

  const openMediaPicker = async () => {
    setShowMediaModal(true);
    setLoadingMedia(true);
    try {
      const res = await fetch(getApiUrl('/api/media'));
      const data = await res.json();
      if (Array.isArray(data)) {
        setMediaList(data);
      }
    } catch (err) {
      console.error('Failed to load media list:', err);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(getApiUrl('/api/upload'), {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.imageUrl) {
        onChange(data.imageUrl);
      } else if (data.fullUrl) {
        onChange(data.fullUrl);
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
      <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-800 rounded-xl border border-slate-700 w-fit text-[11px] font-bold">
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
          onClick={() => {
            setUploadMode('media');
            openMediaPicker();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            uploadMode === 'media' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FolderOpen size={13} /> <span>Select from Media Library</span>
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

      {/* MODE 2: MEDIA LIBRARY SELECTOR BUTTON */}
      {uploadMode === 'media' && (
        <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 flex items-center justify-between">
          <div className="text-xs text-slate-300 font-bold flex items-center gap-2">
            <FolderOpen size={16} className="text-emerald-400" />
            <span>{value ? 'Image Selected from Library' : 'Choose an image asset from Media Library'}</span>
          </div>
          <button
            type="button"
            onClick={openMediaPicker}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-colors"
          >
            Browse Library 📂
          </button>
        </div>
      )}

      {/* MODE 3: EXTERNAL URL INPUT */}
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
            className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10"
            title="Clear Image"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* MEDIA LIBRARY PICKER MODAL */}
      {showMediaModal && (
        <div className="drawer-overlay flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">ASSET SELECTOR</span>
                <h3 className="font-extrabold text-base text-white">Select Image from Media Library</h3>
              </div>
              <button type="button" onClick={() => setShowMediaModal(false)} className="text-slate-400 hover:text-white">
                <XCircle size={24} />
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search media by filename..."
                value={mediaSearch}
                onChange={(e) => setMediaSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
              />
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            </div>

            {loadingMedia ? (
              <div className="p-8 text-center text-xs font-bold text-emerald-400 animate-pulse">
                ⏳ Loading Media Library assets...
              </div>
            ) : mediaList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-850 rounded-xl border border-slate-800">
                No media files uploaded yet. Upload a file above first.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-96 overflow-y-auto p-1">
                {mediaList
                  .filter(m => !mediaSearch || m.filename.toLowerCase().includes(mediaSearch.toLowerCase()))
                  .map((item, idx) => (
                    <div
                      key={item.id || idx}
                      onClick={() => {
                        onChange(item.url);
                        setShowMediaModal(false);
                      }}
                      className={`relative group bg-slate-850 border rounded-xl overflow-hidden cursor-pointer hover:border-emerald-500 transition-all ${
                        value === item.url ? 'border-emerald-500 ring-2 ring-emerald-500/50' : 'border-slate-800'
                      }`}
                    >
                      <div className="h-28 bg-slate-900 overflow-hidden flex items-center justify-center p-1">
                        <img
                          src={resolveImgUrl(item.url)}
                          alt={item.filename}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="p-1.5 bg-slate-900/80 border-t border-slate-800">
                        <p className="text-[10px] font-bold text-white truncate" title={item.filename}>{item.filename}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs border border-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
