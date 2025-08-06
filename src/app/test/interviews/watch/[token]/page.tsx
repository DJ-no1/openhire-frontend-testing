'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import LiveVideo from '../../../../../components/live-video';

export default function SimpleWatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const interviewId = params.interviewId as string;
  const recruiterId = searchParams.get('recruiter') || 'recruiter-1';

  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Live Interview Watch</h1>
          <p className="text-gray-600">Interview ID: {interviewId}</p>
        </div>

        <LiveVideo
          interviewId={interviewId}
          role="recruiter"
          userId={recruiterId}
          onConnectionStatusChange={setConnectionStatus}
        />
      </div>
    </div>
  );
};
