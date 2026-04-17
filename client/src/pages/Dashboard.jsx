import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth, useUser, UserButton } from "@clerk/clerk-react"; 
import axios from 'axios';
import { 
  Folder, File, Search, Plus, UploadCloud, 
  Share2, MoreVertical, LayoutGrid, Star, 
  Clock, Menu, X, Users, ChevronRight, Copy, Check,
  Home, HardDrive, Cloud, Loader
} from 'lucide-react';

// Initial data structure with parentId relationships
const initialFiles = [];

export default function DropzoneApp() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const fileInputRef = useRef(null);

  // State Management
  const [items, setItems] = useState(initialFiles);
  const [currentFolder, setCurrentFolder] = useState(null); 
  const [navigationStack, setNavigationStack] = useState([]); 
  const [activeNav, setActiveNav] = useState('My Drive');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('Untitled folder');
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // Setup axios with auth token
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.get('http://localhost:5000/api/files', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const formattedFiles = response.data.map(file => ({
        id: file._id,
        name: file.dropzonefile.split('/').pop() || 'file',
        type: 'file',
        size: '--',
        date: new Date(file.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        parentId: null,
        url: file.dropzonefile
      }));
      
      setItems(formattedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user, fetchFiles]);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    for (let file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const token = await getToken();

        const response = await axios.post(
          'http://localhost:5000/api/files/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            },
          }
        );

        if (response.data.file) {
          const newFile = {
            id: response.data.file._id,
            name: response.data.file.dropzonefile.split('/').pop() || file.name,
            type: 'file',
            size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
            date: 'Today',
            parentId: currentFolder ? currentFolder.id : null,
            url: response.data.file.dropzonefile
          };
          setItems(prevItems => [newFile, ...prevItems]);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }

    setUploading(false);
    setUploadProgress(0);
  };

  const handleFileInputChange = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    handleFileUpload(uploadedFiles);
  };

  const openFolder = (folder) => {
    setNavigationStack([...navigationStack, folder]);
    setCurrentFolder(folder);
  };

  const navigateTo = (folder, index) => {
    if (folder === null) {
      setNavigationStack([]);
      setCurrentFolder(null);
    } else {
      const newStack = navigationStack.slice(0, index + 1);
      setNavigationStack(newStack);
      setCurrentFolder(folder);
    }
  };

  // --- Create Folder Logic ---
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder = {
      id: Date.now().toString(),
      name: newFolderName,
      type: 'folder',
      size: '--',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      parentId: currentFolder ? currentFolder.id : null
    };
    setItems([newFolder, ...items]);
    setShowNewFolderModal(false);
    setNewFolderName('Untitled folder');
  };

  // --- Share Logic ---
  const getShareUrl = (item) => {
    const path = [...navigationStack.map(f => f.name), item.name].join('/');
    return `${window.location.origin}/dropzone/s/${item.id}?path=${encodeURIComponent(path)}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const visibleItems = items.filter(item => item.parentId === (currentFolder ? currentFolder.id : null));

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      {/* --- Redesigned Unique Sidebar --- */}
      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* App Title */}
        <div className="h-20 flex items-center px-8">
          <div className="bg-indigo-600 p-2 rounded-xl mr-3 shadow-lg shadow-indigo-200">
            <Cloud className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">Dropzone</span>
        </div>

        {/* Primary Actions */}
        <div className="px-6 pb-4 pt-2 flex gap-3">
          <button onClick={() => setShowNewFolderModal(true)} className="flex-1 flex items-center justify-center bg-white border-2 border-slate-200 rounded-2xl py-3 px-4 shadow-sm hover:border-indigo-600 hover:text-indigo-600 transition-all group font-semibold text-slate-700">
            <Plus className="h-5 w-5 mr-1.5 group-hover:scale-110 transition-transform" />
            New
          </button>
          <button onClick={() => fileInputRef.current.click()} className="flex items-center justify-center bg-indigo-600 text-white rounded-2xl py-3 px-4 shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed" title="Upload File" disabled={uploading}>
            {uploading ? <Loader className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
          </button>
          <input type="file" ref={fileInputRef} hidden multiple onChange={handleFileInputChange} />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          <NavItem icon={<Home />} label="Home" active={activeNav === 'Home'} onClick={() => setActiveNav('Home')} />
          <NavItem 
            icon={<Folder />} 
            label="My Drive" 
            active={activeNav === 'My Drive'} 
            onClick={() => { setActiveNav('My Drive'); navigateTo(null); }} 
            hasChildren
          />
         
          
          <div className="my-4 border-t border-slate-100 mx-4"></div>
          
          
          <NavItem icon={<Clock />} label="Recent" active={activeNav === 'Recent'} onClick={() => setActiveNav('Recent')} />
          <NavItem icon={<Star />} label="Starred" active={activeNav === 'Starred'} onClick={() => setActiveNav('Starred')} />
        </nav>

        {/* Storage Widget */}
        <div className="p-6 mt-auto">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center mb-3">
              <Cloud className="h-5 w-5 text-slate-400 mr-2" />
              <span className="text-sm font-semibold text-slate-700">Storage</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2 overflow-hidden">
              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
            
            <p className="text-xs text-slate-500 font-medium mb-4">
              <span className="text-slate-800 font-bold">28.95 GB</span> of 50 GB used
            </p>
            
            <button className="w-full py-2.5 px-4 bg-white border border-slate-200 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors shadow-sm">
              Get more storage
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center flex-1">
            <button className="md:hidden mr-4 p-2 text-slate-500 hover:bg-slate-100 rounded-full" onClick={() => setIsSidebarOpen(true)}>
              <Menu />
            </button>
            <div className="max-w-2xl w-full relative">
              <Search className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                className="w-full pl-12 pr-4 py-3 bg-slate-100 rounded-2xl focus:outline-none focus:bg-white border-2 border-transparent focus:border-indigo-500 transition-all font-medium placeholder-slate-400 text-slate-700 shadow-inner" 
                placeholder="Search in Dropzone..." 
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-6">
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors hidden sm:block">
              <LayoutGrid className="h-5 w-5" />
            </button>
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-700 hidden sm:block">
                {user?.fullName}
              </span>
              <UserButton afterSignOutUrl="/sign-in" />
            </div>
          </div>
        </header>

        {/* Breadcrumbs Navigation */}
        <div className="px-8 py-4 flex items-center text-sm text-slate-500 overflow-x-auto whitespace-nowrap">
          <button onClick={() => navigateTo(null)} className="hover:text-indigo-600 font-bold transition-colors">My Drive</button>
          {navigationStack.map((folder, idx) => (
            <React.Fragment key={folder.id}>
              <ChevronRight className="h-4 w-4 mx-2 text-slate-300" />
              <button onClick={() => navigateTo(folder, idx)} className={`hover:text-indigo-600 transition-colors ${idx === navigationStack.length - 1 ? 'font-black text-slate-800' : 'font-bold'}`}>
                {folder.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* File Grid */}
        <div className={`flex-1 overflow-y-auto px-8 pb-8 transition-all ${isDragging ? 'bg-indigo-50/50 border-4 border-dashed border-indigo-300 m-6 rounded-3xl' : ''}`}
             onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
             onDragLeave={() => setIsDragging(false)}
             onDrop={(e) => {
               e.preventDefault();
               setIsDragging(false);
               const droppedFiles = Array.from(e.dataTransfer.files);
               handleFileUpload(droppedFiles);
             }}>

          {uploading && (
            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Loader className="h-5 w-5 text-indigo-600 animate-spin" />
                  <span className="font-semibold text-indigo-700">Uploading file...</span>
                </div>
                <span className="text-sm font-bold text-indigo-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-indigo-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="col-span-full py-24 text-center flex flex-col items-center">
              <Loader className="h-10 w-10 text-slate-400 animate-spin mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-1">Loading files...</h3>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {visibleItems.map((item) => (
                <div key={item.id} 
                     onClick={() => item.type === 'folder' && openFolder(item)}
                     className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-200 transition-all cursor-pointer group relative">
                  <div className="flex justify-between items-start mb-5">
                    {item.type === 'folder' 
                      ? <Folder className="h-12 w-12 text-slate-400 fill-slate-100 group-hover:text-indigo-500 group-hover:fill-indigo-50 transition-colors" /> 
                      : <File className="h-12 w-12 text-indigo-500" />}
                    <button onClick={(e) => { e.stopPropagation(); setSelectedItem(item); setShowShareModal(true); }} 
                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-indigo-600">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 truncate mb-1.5">{item.name}</h3>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{item.type === 'folder' ? 'Folder' : item.size}</p>
                </div>
              ))}
              {visibleItems.length === 0 && (
                <div className="col-span-full py-24 text-center flex flex-col items-center">
                  <div className="bg-slate-100 p-6 rounded-full mb-4">
                    <UploadCloud className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-1">It's empty here</h3>
                  <p className="text-slate-500 text-sm font-medium">Drag and drop files to upload</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* --- Modals --- */}
      {showNewFolderModal && (
        <ModalWrapper onClose={() => setShowNewFolderModal(false)} title="New folder">
          <input autoFocus value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                 className="w-full border-2 border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 outline-none font-medium text-slate-700 transition-colors" />
          <div className="flex justify-end gap-3 mt-8">
            <button onClick={() => setShowNewFolderModal(false)} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleCreateFolder} className="px-6 py-2.5 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all">Create</button>
          </div>
        </ModalWrapper>
      )}

      {showShareModal && (
        <ModalWrapper onClose={() => setShowShareModal(false)} title="Share link">
          <p className="text-sm text-slate-500 mb-5 font-medium">Anyone with this link can view this {selectedItem?.type}:</p>
          <div className="flex items-center gap-2 p-1.5 bg-slate-50 border-2 border-slate-100 rounded-xl">
            <input readOnly value={getShareUrl(selectedItem)} className="flex-1 bg-transparent px-3 py-2 text-sm font-medium text-slate-600 outline-none truncate" />
            <button onClick={() => copyToClipboard(getShareUrl(selectedItem))} className={`p-2.5 rounded-lg font-bold flex items-center transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-50 shadow-sm'}`}>
              {copied ? <><Check className="h-4 w-4 mr-1.5" /> Copied</> : <><Copy className="h-4 w-4 mr-1.5" /> Copy</>}
            </button>
          </div>
          <button onClick={() => setShowShareModal(false)} className="w-full mt-8 bg-slate-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg">Done</button>
        </ModalWrapper>
      )}
    </div>
  );
}

// Redesigned NavItem component
function NavItem({ icon, label, active, onClick, hasChildren }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}>
      <div className="flex items-center">
        <span className={`mr-3 h-5 w-5 ${active ? 'text-indigo-600' : 'text-slate-400'}`}>{icon}</span> 
        {label}
      </div>
      {hasChildren && <ChevronRight className={`h-4 w-4 ${active ? 'text-indigo-400' : 'text-slate-300'}`} />}
    </button>
  );
}

function ModalWrapper({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-black text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="h-5 w-5 text-slate-400" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}