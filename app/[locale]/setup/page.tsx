'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { 
  ArrowLeft, 
  HelpCircle, 
  Settings, 
  Sparkles, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Logo from '../../../components/Logo';
import CopyCodeBlock from '../../../components/CopyCodeBlock';
import { detectOllamaUrl } from '../../../hooks/useAIProvider';

export default function SetupPage() {
  const router = useRouter();
  const locale = useLocale();

  // OS selection tab state (saves to localStorage)
  const [selectedOS, setSelectedOS] = useState<'windows' | 'mac' | 'linux'>('windows');

  // Checklist states
  const [checklist, setChecklist] = useState({
    terminalOpen: false,
    ollamaRunning: false,
    urlSet: false,
    testConnection: false,
    ready: false
  });

  // Load selected OS from localStorage on mount
  useEffect(() => {
    const savedOS = localStorage.getItem('viralspy_setup_os') as 'windows' | 'mac' | 'linux' | null;
    if (savedOS && ['windows', 'mac', 'linux'].includes(savedOS)) {
      setSelectedOS(savedOS);
    }
  }, []);

  const handleOSChange = (os: 'windows' | 'mac' | 'linux') => {
    setSelectedOS(os);
    localStorage.setItem('viralspy_setup_os', os);
  };

  const toggleChecklist = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // State for live config values
  const [inputUrl, setInputUrl] = useState('http://localhost:11434');
  const [inputModel, setInputModel] = useState('llama3');
  const [config, setConfig] = useState({
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'llama3'
  });

  const [showSaved, setShowSaved] = useState(false);
  const [autoDetectStatus, setAutoDetectStatus] = useState<'idle' | 'detecting' | 'success' | 'failed'>('idle');
  const [autoDetectMessage, setAutoDetectMessage] = useState('');
  const [ollamaDetected, setOllamaDetected] = useState(false);
  const [autoStatus, setAutoStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [installGuideExpanded, setInstallGuideExpanded] = useState(false);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    inUse: false,
    cors: false,
    ipChanged: false,
    slow: false,
    ram: false,
    cloud: false
  });

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('viralspy_ai_config');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const url = parsed.ollamaUrl || 'http://localhost:11434';
        const model = parsed.ollamaModel || 'llama3';
        setConfig({ ollamaUrl: url, ollamaModel: model });
        setInputUrl(url);
        setInputModel(model);
      } catch {}
    }
  }, []);

  // Live auto-check every 10 seconds using the stored ollamaUrl from localStorage
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const stored = localStorage.getItem('viralspy_ai_config');
        let url = 'http://localhost:11434';
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.ollamaUrl) url = parsed.ollamaUrl;
          } catch {}
        }
        
        const res = await fetch(`${url.replace(/\/$/, '')}/api/tags`, {
          signal: AbortSignal.timeout(2000)
        });
        if (res.ok) {
          setOllamaDetected(true);
          setChecklist((prev) => ({
            ...prev,
            ollamaRunning: true,
            urlSet: true
          }));
        } else {
          setOllamaDetected(false);
        }
      } catch {
        setOllamaDetected(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // Live connection checker in Section 4
  const ollamaUrl = config.ollamaUrl;
  useEffect(() => {
    const checkTags = async () => {
      try {
        const res = await fetch(
          `${ollamaUrl.replace(/\/$/, '')}/api/tags`,
          { signal: AbortSignal.timeout(2000) }
        );
        if (res.ok) setAutoStatus('connected');
        else setAutoStatus('disconnected');
      } catch {
        setAutoStatus('disconnected');
      }
    };
    checkTags();
    const interval = setInterval(checkTags, 10000);
    return () => clearInterval(interval);
  }, [ollamaUrl]);

  // Client-side auto-detect URLs
  const runAutoDetect = async () => {
    setAutoDetectStatus('detecting');
    setAutoDetectMessage('');
    const urlsToTry = [
      'http://localhost:11434',
      'http://127.0.0.1:11434', 
      'http://172.29.130.173:11434',
      'http://172.17.0.1:11434',
      'http://172.28.0.1:11434',
      'http://172.30.0.1:11434',
    ];
    for (const url of urlsToTry) {
      try {
        const res = await fetch(`${url}/api/tags`, {
          signal: AbortSignal.timeout(2000)
        });
        if (res.ok) {
          setAutoDetectStatus('success');
          setAutoDetectMessage(`✅ Found at ${url}`);
          setInputUrl(url);

          // Save to localStorage
          const current = JSON.parse(localStorage.getItem('viralspy_ai_config') || '{}');
          const updated = {
            ...current,
            provider: 'ollama',
            ollamaUrl: url,
            ollamaModel: inputModel
          };
          localStorage.setItem('viralspy_ai_config', JSON.stringify(updated));
          setConfig({
            ollamaUrl: url,
            ollamaModel: inputModel
          });
          window.dispatchEvent(new Event('viralspy_ai_config_updated'));
          return;
        }
      } catch (err) {
        // ignore and try next
      }
    }
    setAutoDetectStatus('failed');
    setAutoDetectMessage('❌ Ollama not detected');
  };

  const saveToSettings = () => {
    const current = JSON.parse(
      localStorage.getItem('viralspy_ai_config') || '{}'
    );
    const updated = {
      ...current,
      provider: 'ollama',
      ollamaUrl: inputUrl,
      ollamaModel: inputModel
    };
    localStorage.setItem('viralspy_ai_config', JSON.stringify(updated));
    setConfig({
      ollamaUrl: inputUrl,
      ollamaModel: inputModel
    });
    window.dispatchEvent(new Event('viralspy_ai_config_updated'));
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const allChecked = 
    checklist.terminalOpen && 
    checklist.ollamaRunning && 
    checklist.urlSet && 
    checklist.testConnection && 
    checklist.ready;

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#1A1A1A] flex flex-col justify-between font-sans relative">
      {/* Background soft highlights */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-orange-400/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-400/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Bar */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-50 py-3.5 px-4 sm:px-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Logo />
          </div>
          <button
            onClick={() => router.push(getLocalizedPath('/settings'))}
            className="flex items-center space-x-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-650 hover:text-gray-900 rounded-xl text-xs font-bold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </header>

      {/* Content Container */}
      <main className="flex-grow max-w-3xl mx-auto w-full py-8 px-4 sm:px-6 space-y-8 z-10">
        
        {/* SECTION 0 — PAGE HEADER */}
        <div className="space-y-4 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight leading-tight">
            Local AI Setup Guide 🦙
          </h1>
          <p className="text-sm sm:text-base text-gray-500 font-medium max-w-2xl leading-relaxed">
            Get Ollama running in 5 minutes — free, private, no API costs
          </p>

          {/* OS selector tabs */}
          <div className="flex justify-center sm:justify-start gap-2 border-b border-gray-200 pb-4 pt-2">
            {(['windows', 'mac', 'linux'] as const).map((os) => (
              <button
                key={os}
                onClick={() => handleOSChange(os)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  selectedOS === os
                    ? 'bg-[#FF6B4A] text-white border border-[#FF6B4A]'
                    : 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-600'
                }`}
              >
                {os === 'windows' && '🪟 Windows (WSL)'}
                {os === 'mac' && '🍎 Mac'}
                {os === 'linux' && '🐧 Linux'}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 1 — QUICK START (returning users) */}
        <div className="border-l-4 border-[#FF6B4A] bg-white rounded-2xl p-6 shadow-card space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              ⚡ Already have Ollama? Start here
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Run these commands every time you restart your computer
            </p>
          </div>

          {selectedOS === 'windows' && (
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center font-bold text-xs">1</span>
                  <span className="font-bold text-gray-800 text-xs">Open WSL Terminal</span>
                </div>
                <p className="text-xs text-gray-600 pl-7">
                  Press Windows + S, type 'Ubuntu' or 'WSL', press Enter
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center font-bold text-xs">2</span>
                  <span className="font-bold text-gray-800 text-xs">Kill existing + Start Ollama</span>
                </div>
                <div className="pl-7 space-y-2">
                  <p className="text-xs text-gray-650 font-bold block">Run this single command:</p>
                  <CopyCodeBlock code="sudo kill -9 $(sudo lsof -t -i:11434) 2>/dev/null; sleep 2 && OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS='*' ollama serve" />
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-xl text-xs space-y-1">
                    <p className="font-semibold">⚠️ Keep this terminal open the entire time you use ViralSpy. Closing it stops Ollama.</p>
                    <p className="text-[11px] text-amber-700 font-medium">Enter your password when asked. Keep this terminal open — don't close it!</p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center font-bold text-xs">3</span>
                  <span className="font-bold text-gray-800 text-xs">Find your WSL IP (run in a NEW terminal)</span>
                </div>
                <div className="pl-7 space-y-2">
                  <p className="text-xs text-gray-650 font-bold block">Open a second WSL terminal and run:</p>
                  <CopyCodeBlock code="hostname -I" />
                  <p className="text-xs text-gray-600">Copy the first IP shown (looks like 172.x.x.x)</p>
                  <p className="text-xs text-gray-600 font-semibold">Use this IP in ViralSpy Settings as your Ollama URL: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px] text-[#FF6B4A]">http://[your-ip]:11434</code></p>
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-xl text-xs">
                    <p className="font-semibold">⚠️ Your WSL IP changes every time you restart Windows. Run hostname -I after each reboot and update it in Settings, or use the Auto-detect button.</p>
                  </div>
                </div>
              </div>

              {/* Windows Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => router.push(getLocalizedPath('/settings'))}
                  className="flex items-center space-x-1.5 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-650 hover:text-gray-900 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <Settings className="h-3.5 w-3.5 text-[#FF6B4A]" />
                  <span>⚙️ Go to Settings to update URL</span>
                </button>
                <button
                  onClick={runAutoDetect}
                  disabled={autoDetectStatus === 'detecting'}
                  className="flex items-center space-x-1.5 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-650 hover:text-gray-900 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  {autoDetectStatus === 'detecting' ? (
                    <>
                      <span className="animate-spin text-xs">⏳</span>
                      <span>Detecting...</span>
                    </>
                  ) : (
                    <span>🔍 Auto-detect URL</span>
                  )}
                </button>
                {autoDetectMessage && (
                  <span className={`text-xs font-bold ml-2 ${autoDetectStatus === 'success' ? 'text-green-600 animate-pulse' : 'text-red-500'}`}>
                    {autoDetectMessage}
                  </span>
                )}
              </div>
            </div>
          )}

          {selectedOS === 'mac' && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center font-bold text-xs">1</span>
                  <span className="font-bold text-gray-800 text-xs">Open Terminal</span>
                </div>
                <p className="text-xs text-gray-600 pl-7">
                  Open Terminal (Cmd + Space → type Terminal)
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center font-bold text-xs">2</span>
                  <span className="font-bold text-gray-800 text-xs">Start Ollama</span>
                </div>
                <div className="pl-7 space-y-1">
                  <CopyCodeBlock code="ollama serve" />
                  <p className="text-xs text-gray-500 italic">Keep this terminal open</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center font-bold text-xs">3</span>
                  <span className="font-bold text-gray-800 text-xs">Ollama URL</span>
                </div>
                <p className="text-xs text-gray-650 pl-7">
                  Your URL is always: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px] text-[#FF6B4A]">http://localhost:11434</code>. No IP hunting needed on Mac! 🎉
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => router.push(getLocalizedPath('/settings'))}
                  className="flex items-center space-x-1.5 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-650 hover:text-gray-900 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <Settings className="h-3.5 w-3.5 text-[#FF6B4A]" />
                  <span>⚙️ Go to Settings</span>
                </button>
              </div>
            </div>
          )}

          {selectedOS === 'linux' && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center font-bold text-xs">1</span>
                  <span className="font-bold text-gray-800 text-xs">Start Ollama</span>
                </div>
                <div className="pl-7 space-y-2">
                  <CopyCodeBlock code="ollama serve" />
                  <p className="text-xs text-gray-650 font-medium">Or to run in background:</p>
                  <CopyCodeBlock code="nohup ollama serve &" />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center font-bold text-xs">2</span>
                  <span className="font-bold text-gray-800 text-xs">Ollama URL</span>
                </div>
                <p className="text-xs text-gray-650 pl-7">
                  Your URL is always: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px] text-[#FF6B4A]">http://localhost:11434</code>
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => router.push(getLocalizedPath('/settings'))}
                  className="flex items-center space-x-1.5 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-650 hover:text-gray-900 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <Settings className="h-3.5 w-3.5 text-[#FF6B4A]" />
                  <span>⚙️ Go to Settings</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2 — SESSION CHECKLIST */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            📋 Every session checklist
          </h2>
          
          <div className="grid grid-cols-1 gap-2.5">
            {/* Checkbox 1 */}
            <div 
              onClick={() => toggleChecklist('terminalOpen')}
              className={`flex items-center gap-3 p-3.5 bg-white border rounded-xl cursor-pointer select-none transition-all ${
                checklist.terminalOpen 
                  ? 'border-[#FF6B4A] text-[#FF6B4A] font-semibold bg-[#FF6B4A]/5' 
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50/50'
              }`}
            >
              <div className={`h-5 w-5 rounded-full flex items-center justify-center transition-all ${
                checklist.terminalOpen ? 'bg-[#FF6B4A] text-white' : 'border border-gray-300'
              }`}>
                {checklist.terminalOpen && <span className="text-[10px]">✓</span>}
              </div>
              <span className="text-xs">WSL terminal is open</span>
            </div>

            {/* Checkbox 2 */}
            <div 
              onClick={() => toggleChecklist('ollamaRunning')}
              className={`flex items-center justify-between p-3.5 bg-white border rounded-xl cursor-pointer select-none transition-all ${
                checklist.ollamaRunning 
                  ? 'border-[#FF6B4A] text-[#FF6B4A] font-semibold bg-[#FF6B4A]/5' 
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center transition-all ${
                  checklist.ollamaRunning ? 'bg-[#FF6B4A] text-white' : 'border border-gray-300'
                }`}>
                  {checklist.ollamaRunning && <span className="text-[10px]">✓</span>}
                </div>
                <span className="text-xs">Ollama is running (ollama serve)</span>
              </div>
              {ollamaDetected ? (
                <span className="text-[10px] font-bold text-green-600 flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded border border-green-200">
                  <span>●</span> Ollama detected
                </span>
              ) : (
                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                  <span>○</span> Not detected
                </span>
              )}
            </div>

            {/* Checkbox 3 */}
            <div 
              onClick={() => toggleChecklist('urlSet')}
              className={`flex items-center gap-3 p-3.5 bg-white border rounded-xl cursor-pointer select-none transition-all ${
                checklist.urlSet 
                  ? 'border-[#FF6B4A] text-[#FF6B4A] font-semibold bg-[#FF6B4A]/5' 
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50/50'
              }`}
            >
              <div className={`h-5 w-5 rounded-full flex items-center justify-center transition-all ${
                checklist.urlSet ? 'bg-[#FF6B4A] text-white' : 'border border-gray-300'
              }`}>
                {checklist.urlSet && <span className="text-[10px]">✓</span>}
              </div>
              <span className="text-xs">Ollama URL is set in ViralSpy Settings</span>
            </div>

            {/* Checkbox 4 */}
            <div 
              onClick={() => toggleChecklist('testConnection')}
              className={`flex items-center gap-3 p-3.5 bg-white border rounded-xl cursor-pointer select-none transition-all ${
                checklist.testConnection 
                  ? 'border-[#FF6B4A] text-[#FF6B4A] font-semibold bg-[#FF6B4A]/5' 
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50/50'
              }`}
            >
              <div className={`h-5 w-5 rounded-full flex items-center justify-center transition-all ${
                checklist.testConnection ? 'bg-[#FF6B4A] text-white' : 'border border-gray-300'
              }`}>
                {checklist.testConnection && <span className="text-[10px]">✓</span>}
              </div>
              <span className="text-xs">Test Connection shows green ✓</span>
            </div>

            {/* Checkbox 5 */}
            <div 
              onClick={() => toggleChecklist('ready')}
              className={`flex items-center gap-3 p-3.5 bg-white border rounded-xl cursor-pointer select-none transition-all ${
                checklist.ready 
                  ? 'border-[#FF6B4A] text-[#FF6B4A] font-semibold bg-[#FF6B4A]/5' 
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50/50'
              }`}
            >
              <div className={`h-5 w-5 rounded-full flex items-center justify-center transition-all ${
                checklist.ready ? 'bg-[#FF6B4A] text-white' : 'border border-gray-300'
              }`}>
                {checklist.ready && <span className="text-[10px]">✓</span>}
              </div>
              <span className="text-xs">Ready to generate briefs! 🚀</span>
            </div>
          </div>

          {allChecked && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center space-y-3 animate-fade-in">
              <p className="text-xs font-bold text-green-800">
                🎉 You're all set! Go generate some viral content!
              </p>
              <button
                onClick={() => router.push(getLocalizedPath('/dashboard'))}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                🚀 Go to Dashboard
              </button>
            </div>
          )}
        </div>

        {/* SECTION 3 — FRESH INSTALL GUIDE */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-4">
          <button 
            onClick={() => setInstallGuideExpanded(!installGuideExpanded)}
            className="w-full flex items-center justify-between font-bold text-gray-900 hover:text-[#FF6B4A] transition-colors"
          >
            <span className="text-lg">🆕 First time? Install Ollama</span>
            {installGuideExpanded ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
          </button>

          {installGuideExpanded && (
            <div className="space-y-6 pt-2 border-t border-gray-100 animate-fade-in">
              {/* STEP 1 */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">STEP 1 — Download Ollama</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <a 
                    href="https://ollama.com/download/OllamaSetup.exe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-blue-200 hover:border-blue-400 bg-blue-50/20 hover:bg-blue-50/45 p-4 rounded-xl text-left block transition-all"
                  >
                    <span className="font-bold text-blue-700 text-xs block mb-1">🪟 Windows Installer</span>
                    <span className="text-[10px] text-blue-500 font-medium block">Windows 10 / 11</span>
                  </a>
                  <a 
                    href="https://ollama.com/download/Ollama-darwin.zip"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-gray-200 hover:border-gray-300 bg-gray-50/45 hover:bg-gray-50/70 p-4 rounded-xl text-left block transition-all"
                  >
                    <span className="font-bold text-gray-855 text-xs block mb-1">🍎 Mac Download</span>
                    <span className="text-[10px] text-gray-400 font-medium block">Apple Silicon / Intel</span>
                  </a>
                  <div className="border border-orange-200 bg-orange-50/10 p-4 rounded-xl text-left">
                    <span className="font-bold text-orange-700 text-xs block mb-1">🐧 Linux Installation</span>
                    <span className="text-[10px] text-orange-500 font-medium block mb-2">One command:</span>
                    <CopyCodeBlock code="curl -fsSL https://ollama.com/install.sh | sh" />
                  </div>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">STEP 2 — Choose and download a model</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Card 1 */}
                  <div className="border border-orange-200 bg-orange-50/5 p-4 rounded-xl flex flex-col justify-between min-h-[240px] relative transition-all">
                    <div>
                      <span className="bg-orange-100 text-[#FF6B4A] text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wide block w-fit mb-1.5">🌟 RECOMMENDED</span>
                      <span className="font-bold text-gray-800 text-xs block mb-1">Llama 3 (8B)</span>
                      <p className="text-[10px] text-gray-500 mt-1 leading-normal">
                        Size: 4.7 GB<br/>
                        RAM needed: 8 GB<br/>
                        Speed: ⚡ Fast<br/>
                        Quality: ★★★★☆
                      </p>
                    </div>
                    <div className="mt-4">
                      <span className="text-[9px] text-gray-450 font-bold block mb-1">Run this command:</span>
                      <CopyCodeBlock code="ollama pull llama3" />
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="border border-gray-250 p-4 rounded-xl flex flex-col justify-between min-h-[240px] relative transition-all">
                    <div>
                      <span className="bg-green-100 text-green-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wide block w-fit mb-1.5">🐣 LOW-END COMPUTERS</span>
                      <span className="font-bold text-gray-800 text-xs block mb-1">Gemma 3 (4B)</span>
                      <p className="text-[10px] text-gray-500 mt-1 leading-normal">
                        Size: 2.5 GB<br/>
                        RAM needed: 4 GB<br/>
                        Speed: ⚡⚡ Very Fast<br/>
                        Quality: ★★★☆☆
                      </p>
                    </div>
                    <div className="mt-4">
                      <span className="text-[9px] text-gray-450 font-bold block mb-1">Run this command:</span>
                      <CopyCodeBlock code="ollama pull gemma3" />
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="border border-gray-250 p-4 rounded-xl flex flex-col justify-between min-h-[240px] relative transition-all">
                    <div>
                      <span className="bg-blue-100 text-blue-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wide block w-fit mb-1.5">💪 POWERFUL COMPUTERS</span>
                      <span className="font-bold text-gray-800 text-xs block mb-1">Llama 3 (70B)</span>
                      <p className="text-[10px] text-gray-500 mt-1 leading-normal">
                        Size: 40 GB<br/>
                        RAM needed: 48 GB<br/>
                        Speed: 🐢 Slow<br/>
                        Quality: ★★★★★
                      </p>
                    </div>
                    <div className="mt-4">
                      <span className="text-[9px] text-gray-450 font-bold block mb-1">Run this command:</span>
                      <CopyCodeBlock code="ollama pull llama3:70b" />
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-[#FF6B4A] font-bold">
                  Not sure? Pick Llama 3 (8B) — works on most modern laptops with 8GB RAM 🎉
                </p>

                {/* How to run the pull command */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-2 mt-3 text-left">
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase">How to run the pull command:</span>
                  {selectedOS === 'windows' ? (
                    <div className="text-xs text-gray-650 space-y-2.5">
                      <p>1. Press <strong>Windows + R</strong> → type <code className="bg-white px-1.5 py-0.5 rounded border border-gray-200 font-mono">cmd</code> → Enter</p>
                      <p>2. Paste this and press Enter:</p>
                      <CopyCodeBlock code="ollama pull llama3" />
                      <p>3. Wait 5-10 minutes for download</p>
                      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-xl text-xs flex gap-2">
                        <span className="shrink-0">⏳</span>
                        <div>
                          <strong>Progress note:</strong> You'll see: <code className="font-mono text-[11px]">pulling manifest...</code>, <code className="font-mono text-[11px]">pulling abc123... ████ 45%</code>. That means it's working! Just wait.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-650 space-y-1.5">
                      <p>Open Terminal, paste and press Enter:</p>
                      <CopyCodeBlock code="ollama pull llama3" />
                    </div>
                  )}
                </div>
              </div>

              {/* STEP 3 */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-700">STEP 3 — Verify installation</h3>
                <div className="text-xs text-gray-650 bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-2 text-left">
                  <p>Test Ollama is working by running this in your terminal:</p>
                  <CopyCodeBlock code="curl http://localhost:11434/api/tags" />
                  <p>You should see JSON with your model name.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4 — CONFIGURE VIRALSPY */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            🔗 Connect to ViralSpy
          </h2>

          {selectedOS === 'windows' ? (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs">
                <p className="font-bold mb-1">🪟 Windows WSL Users:</p>
                <p>Ollama runs inside Linux (WSL), not Windows. You need your WSL IP address — not localhost.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: Find your IP */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-2">
                  <span className="font-bold text-gray-800 text-xs block">Find your IP</span>
                  <CopyCodeBlock code="hostname -I" />
                  <p className="text-[11px] text-gray-500">Run this in WSL terminal</p>
                  <p className="text-[11px] text-gray-500">Copy the first number: 172.x.x.x</p>
                </div>

                {/* Right Column: Enter in Settings */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-3">
                  <span className="font-bold text-gray-800 text-xs block">Enter in Settings</span>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-extrabold uppercase tracking-wide text-gray-450 block mb-1">Ollama URL</label>
                      <input 
                        type="text"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        className="w-full text-xs font-mono px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#FF6B4A] text-gray-755 font-semibold"
                        placeholder="http://172.x.x.x:11434"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold uppercase tracking-wide text-gray-450 block mb-1">Model</label>
                      <input 
                        type="text"
                        value={inputModel}
                        onChange={(e) => setInputModel(e.target.value)}
                        className="w-full text-xs font-mono px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#FF6B4A] text-gray-755 font-semibold"
                        placeholder="llama3"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-3">
                <span className="font-bold text-gray-800 text-xs block">Easy! Just use:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-wide text-gray-450 block mb-1">Ollama URL</label>
                    <input 
                      type="text"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#FF6B4A] text-gray-755 font-semibold"
                      placeholder="http://localhost:11434"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-wide text-gray-450 block mb-1">Model</label>
                    <input 
                      type="text"
                      value={inputModel}
                      onChange={(e) => setInputModel(e.target.value)}
                      className="w-full text-xs font-mono px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#FF6B4A] text-gray-755 font-semibold"
                      placeholder="llama3"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Live connection checker, Auto-detect button, Save button */}
          <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Connection status indicator */}
            <div className="flex items-center gap-2">
              {autoStatus === 'connected' ? (
                <span className="text-xs font-bold text-green-600 flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                  <span className="animate-pulse text-base">●</span> Connected — {inputModel} ready
                </span>
              ) : (
                <span className="text-xs font-bold text-red-600 flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                  <span className="text-base">○</span> Not connected — start Ollama first
                </span>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={runAutoDetect}
                disabled={autoDetectStatus === 'detecting'}
                className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 text-gray-700"
              >
                {autoDetectStatus === 'detecting' ? (
                  <>
                    <span className="animate-spin text-xs">⏳</span>
                    <span>Detecting...</span>
                  </>
                ) : (
                  <span>🔍 Auto-detect my URL</span>
                )}
              </button>

              <button
                onClick={saveToSettings}
                className="px-5 py-2.5 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center gap-1.5 shadow-sm"
              >
                <span>💾 Save to ViralSpy Settings</span>
              </button>
            </div>
          </div>

          {/* Auto-detect result & Save messages */}
          {(autoDetectMessage || showSaved) && (
            <div className="flex items-center gap-3 justify-end text-xs font-bold">
              {autoDetectMessage && (
                <span className={autoDetectStatus === 'success' ? 'text-green-600' : 'text-red-500'}>
                  {autoDetectMessage}
                </span>
              )}
              {showSaved && (
                <span className="text-green-600 animate-pulse bg-green-50 px-2 py-1 rounded">
                  ✅ Saved!
                </span>
              )}
            </div>
          )}
        </div>

        {/* SECTION 5 — TROUBLESHOOTING */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <HelpCircle className="h-4 w-4 text-[#FF6B4A]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800">Having problems? Click to expand:</h2>
          </div>

          <div className="divide-y divide-gray-150 text-xs">
            {/* Item 1 */}
            <div className="py-3">
              <button 
                onClick={() => toggleExpanded('inUse')}
                className="w-full flex items-center justify-between font-bold text-gray-700 hover:text-[#FF6B4A] transition-colors"
              >
                <span>▶ "Address already in use" error</span>
                {expanded.inUse ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
              </button>
              {expanded.inUse && (
                <div className="mt-2 text-gray-605 leading-relaxed animate-fade-in pl-1 space-y-2 text-left">
                  <p>Another Ollama is running. Kill it first:</p>
                  <CopyCodeBlock code="sudo kill -9 $(sudo lsof -t -i:11434)" />
                  <p>Then start again:</p>
                  <CopyCodeBlock code="OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS='*' ollama serve" />
                </div>
              )}
            </div>

            {/* Item 2 */}
            <div className="py-3">
              <button 
                onClick={() => toggleExpanded('cors')}
                className="w-full flex items-center justify-between font-bold text-gray-700 hover:text-[#FF6B4A] transition-colors animate-fade-in"
              >
                <span>▶ ViralSpy can't connect (fetch failed)</span>
                {expanded.cors ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
              </button>
              {expanded.cors && (
                <div className="mt-2 text-gray-605 leading-relaxed animate-fade-in pl-1 space-y-2 text-left">
                  <p>Ollama is blocking browser requests (CORS). Always start Ollama with:</p>
                  <CopyCodeBlock code="OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS='*' ollama serve" />
                  <p className="font-semibold text-gray-800">The <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px] text-[#FF6B4A]">OLLAMA_ORIGINS='*'</code> part is critical for ViralSpy to connect.</p>
                </div>
              )}
            </div>

            {/* Item 3 */}
            <div className="py-3">
              <button 
                onClick={() => toggleExpanded('ipChanged')}
                className="w-full flex items-center justify-between font-bold text-gray-700 hover:text-[#FF6B4A] transition-colors"
              >
                <span>▶ My WSL IP changed after reboot</span>
                {expanded.ipChanged ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
              </button>
              {expanded.ipChanged && (
                <div className="mt-2 text-gray-650 leading-relaxed animate-fade-in pl-1 space-y-2 text-left">
                  <p>Normal! Run this in WSL terminal to find new IP:</p>
                  <CopyCodeBlock code="hostname -I" />
                  <p>Update in Settings or click Auto-detect.</p>
                </div>
              )}
            </div>

            {/* Item 4 */}
            <div className="py-3">
              <button 
                onClick={() => toggleExpanded('slow')}
                className="w-full flex items-center justify-between font-bold text-gray-700 hover:text-[#FF6B4A] transition-colors"
              >
                <span>▶ Download is very slow</span>
                {expanded.slow ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
              </button>
              {expanded.slow && (
                <p className="mt-2 text-gray-600 leading-relaxed animate-fade-in pl-1 text-left">
                  Normal — model is 4-5 GB. Leave it running, laptop plugged in.
                </p>
              )}
            </div>

            {/* Item 5 */}
            <div className="py-3">
              <button 
                onClick={() => toggleExpanded('ram')}
                className="w-full flex items-center justify-between font-bold text-gray-700 hover:text-[#FF6B4A] transition-colors"
              >
                <span>▶ Not enough RAM</span>
                {expanded.ram ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
              </button>
              {expanded.ram && (
                <div className="mt-2 text-gray-600 leading-relaxed animate-fade-in pl-1 space-y-2 text-left">
                  <p>Try pulling the smaller Gemma 3 model instead:</p>
                  <CopyCodeBlock code="ollama pull gemma3" />
                  <p>Then change the model to <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px] text-[#FF6B4A]">gemma3</code> in Settings.</p>
                </div>
              )}
            </div>

            {/* Item 6 */}
            <div className="py-3">
              <button 
                onClick={() => toggleExpanded('cloud')}
                className="w-full flex items-center justify-between font-bold text-gray-700 hover:text-[#FF6B4A] transition-colors"
              >
                <span>▶ I want to use cloud API instead</span>
                {expanded.cloud ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
              </button>
              {expanded.cloud && (
                <div className="mt-2 text-gray-600 leading-relaxed animate-fade-in pl-1 space-y-2 text-left">
                  <p>No problem! Go to Settings → select BYOK. Groq is free and instant:</p>
                  <a 
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white rounded-xl text-xs font-bold transition-all shadow-sm w-fit"
                  >
                    <span>Get free Groq key →</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 6 — FOOTER ACTIONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => router.push(getLocalizedPath('/dashboard'))}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Sparkles className="h-4 w-4" />
            <span>🚀 Go to Dashboard</span>
          </button>
          <button
            onClick={() => router.push(getLocalizedPath('/settings'))}
            className="w-full sm:w-auto px-6 py-3.5 bg-white border border-gray-250 hover:border-[#FF6B4A] hover:text-[#FF6B4A] text-gray-650 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Settings className="h-4 w-4" />
            <span>⚙️ Open Settings</span>
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push(getLocalizedPath('/settings'))}
            className="text-xs text-gray-550 hover:text-[#FF6B4A] transition-colors font-medium underline"
          >
            Need a cloud API instead? Use BYOK in Settings →
          </button>
        </div>

      </main>

      {/* Footer Bar */}
      <footer className="w-full max-w-3xl mx-auto py-6 border-t border-gray-200 flex items-center justify-between text-xs text-gray-550 mt-12 px-4 sm:px-6">
        <div>© 2026 ViralSpy.</div>
        <div className="text-[#FF6B4A] italic font-semibold">Quietly Rise</div>
      </footer>
    </div>
  );
}
