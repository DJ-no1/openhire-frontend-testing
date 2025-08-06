'use client';

import React, { useState } from 'react';

interface SimpleWatchButtonProps {
  interviewId: string;
  recruiterId: string;
}

const SimpleWatchButton: React.FC<SimpleWatchButtonProps> = ({
  interviewId,
  recruiterId
}) => {
  const [watchUrl, setWatchUrl] = useState<string>('');

  const generateWatchLink = () => {
    // Simple watch URL generation
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const url = `${baseUrl}/interviews/watch/${interviewId}?recruiter=${recruiterId}`;
    setWatchUrl(url);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(watchUrl);
    alert('Watch link copied!');
  };

  const openWatchPage = () => {
    window.open(watchUrl, '_blank');
  };

  return (
    <div className="space-y-3">
      {!watchUrl ? (
        <button
          onClick={generateWatchLink}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Generate Watch Link
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
            <input
              type="text"
              value={watchUrl}
              readOnly
              className="flex-1 bg-transparent text-sm outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
            >
              Copy
            </button>
          </div>
          <button
            onClick={openWatchPage}
            className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Watch Live Interview
            </button>
        </div>
      )}
    </div>
  );
};

export default SimpleWatchButton;
