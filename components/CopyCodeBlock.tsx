'use client';

import React, { useState } from 'react';

export default function CopyCodeBlock({ 
  code 
}: { code: string }) {
  const [copied, setCopied] = useState(false);
  
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="flex items-center gap-2 bg-gray-900 rounded-xl px-4 py-3 my-2">
      <code className="text-green-400 font-mono text-sm flex-1 break-all">
        {code}
      </code>
      <button
        onClick={copy}
        className="text-gray-400 hover:text-white transition-colors text-xs px-2 py-1 rounded-md hover:bg-gray-700 shrink-0 font-sans font-medium"
      >
        {copied ? '✅ Copied!' : '📋 Copy'}
      </button>
    </div>
  );
}
