import { useUser, RedirectToSignIn, UserButton } from "@clerk/clerk-react";
import { useState } from "react";

export default function Home() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [files, setFiles] = useState([]);

  // ⏳ Wait until Clerk loads
  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // 🔒 Protect page
  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  // 📂 Handle Drop
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => prev.concat(droppedFiles));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* 🔝 Header */}
      <header className="flex justify-between items-center p-4 bg-white shadow">
        <h1 className="text-xl font-semibold">ML Storage</h1>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {user?.fullName}
          </span>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </header>

      {/* 📂 Main Content */}
      <div className="p-6">
        
        {/* DropZone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center bg-white hover:bg-gray-50 transition"
        >
          <p className="text-gray-600 mb-2">
            Drag & drop files here
          </p>
          <p className="text-sm text-gray-400">
            Upload your datasets / files
          </p>
        </div>

        {/* File Grid */}
        <h2 className="mt-8 mb-4 text-lg font-medium">Your Files</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {files.map((file, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                📁
              </div>

              <div className="text-sm truncate">
                {file.name}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}