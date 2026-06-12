'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { 
  ArrowLeft, 
  Download, 
  Terminal, 
  CheckCircle, 
  Cpu, 
  HelpCircle, 
  Settings, 
  Sparkles, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Logo from '../../../components/Logo';
import CopyCodeBlock from '../../../components/CopyCodeBlock';

export default function SetupPage() {
  const router = useRouter();
  const locale = useLocale();

  // Completed steps tracker
  const [stepsCompleted, setStepsCompleted] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
  });

  // OS selection tabs for Step 2 and Step 3
  const [step2OS, setStep2OS] = useState<'windows' | 'mac' | 'linux'>('windows');
  const [step3OS, setStep3OS] = useState<'windows' | 'mac_linux'>('windows');
  
  // Show Linux Command block state in Step 1
  const [showLinuxCmd, setShowLinuxCmd] = useState(false);

  // Troubleshooting accordion states
  const [expandedTrouble, setExpandedTrouble] = useState<Record<string, boolean>>({
    inUse: false,
    slow: false,
    refused: false,
    wsl: false,
    ram: false,
    cloud: false,
  });

  const [detectedUrl, setDetectedUrl] = useState('http://localhost:11434');
  const [modelName, setModelName] = useState('llama3');
  const [detecting, setDetecting] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [showSaved, setShowSaved] = useState(false);
  const ollamaUrl = 'http://localhost:11434';

  const detectUrl = async () => {
    setDetecting(true);
    setDetectionStatus('idle');
    const urlsToTry = [
      'http://localhost:11434',
      'http://127.0.0.1:11434', 
      'http://172.29.130.173:11434',
      'http://172.17.0.1:11434',
    ];
    for (const url of urlsToTry) {
      try {
        const res = await fetch(`/api/ollama-test?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        if (data.connected) {
          setDetectedUrl(url);
          setDetectionStatus('success');
          setDetecting(false);
          return;
        }
      } catch (err) {
        // ignore and continue
      }
    }
    setDetectionStatus('failed');
    setDetecting(false);
  };

  const saveToSettings = () => {
    const current = JSON.parse(
      localStorage.getItem('viralspy_ai_config') || '{}'
    )
    localStorage.setItem('viralspy_ai_config', 
      JSON.stringify({
        ...current,
        provider: 'ollama',
        ollamaUrl: detectedUrl || ollamaUrl,
        ollamaModel: modelName
      })
    )
    // Mark step 4 completed
    setStepsCompleted((prev) => ({ ...prev, 4: true }));
    // Show success toast
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 3000)
    // Smooth scroll to Step 5
    setTimeout(() => {
      stepRefs[5]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const stepRefs = {
    1: useRef<HTMLDivElement>(null),
    2: useRef<HTMLDivElement>(null),
    3: useRef<HTMLDivElement>(null),
    4: useRef<HTMLDivElement>(null),
    5: useRef<HTMLDivElement>(null),
  };

  const toggleTrouble = (key: string) => {
    setExpandedTrouble((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleStepComplete = (step: 1 | 2 | 3 | 4) => {
    setStepsCompleted((prev) => ({
      ...prev,
      [step]: true,
    }));
    
    // Smooth scroll to the next step
    const nextStep = (step + 1) as 1 | 2 | 3 | 4 | 5;
    setTimeout(() => {
      stepRefs[nextStep]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

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
        
        {/* Intro */}
        <div className="space-y-4 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight leading-tight">
            Set up Local AI in 5 minutes 🦙
          </h1>
          <p className="text-sm sm:text-base text-gray-500 font-medium max-w-2xl leading-relaxed">
            Run AI on your own computer — completely free, completely private. Follow these steps one by one!
          </p>

          {/* Awesome Note Card */}
          <div className="bg-[#EBF8F2] border border-[#CBEFDF] rounded-2xl p-5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
            <h3 className="font-bold text-[#14532D] text-sm flex items-center gap-1.5">
              <span>✅ Why Local AI is awesome:</span>
            </h3>
            <ul className="mt-3 space-y-2 text-xs font-semibold text-[#166534]">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span><strong>Completely FREE</strong> — no API bills ever</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span><strong>Private</strong> — your ideas never leave your computer</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span><strong>Works offline</strong> — no internet needed</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span><strong>Fast</strong> — uses your own GPU</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Global Progress Bar Tracker */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex justify-between items-center shadow-card">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Setup Progress</div>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((step) => {
              const isDone = step === 5 ? stepsCompleted[4] : stepsCompleted[step as 1 | 2 | 3 | 4];
              return (
                <div key={step} className="flex items-center">
                  <div 
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                      isDone 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isDone ? '✓' : step}
                  </div>
                  {step < 5 && (
                    <div className={`w-6 h-0.5 mx-1 transition-all ${isDone ? 'bg-green-300' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1 */}
        <div 
          ref={stepRefs[1]}
          className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-4 transition-all duration-300 relative overflow-hidden ${
            stepsCompleted[1] ? 'opacity-85 border-green-200' : ''
          }`}
        >
          {stepsCompleted[1] && (
            <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
              <span>✓ Completed</span>
            </div>
          )}

          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center font-black shrink-0 text-sm">
              1
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                <span>Download Ollama</span>
                <span className="text-xl">🖥️</span>
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Ollama is a free app that runs AI on your computer. Click the button for your computer type:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Windows */}
            <a 
              href="https://ollama.com/download/OllamaSetup.exe"
              className="border border-blue-200 hover:border-blue-400 bg-blue-50/20 hover:bg-blue-50/45 p-4 rounded-xl text-left block transition-all"
            >
              <span className="font-bold text-blue-700 text-xs block mb-1">🪟 I use Windows</span>
              <span className="text-[10px] text-blue-500 font-medium leading-tight block">Works on Windows 10 and 11</span>
            </a>

            {/* Mac */}
            <a 
              href="https://ollama.com/download/Ollama-darwin.zip"
              className="border border-gray-200 hover:border-gray-300 bg-gray-50/40 hover:bg-gray-50/70 p-4 rounded-xl text-left block transition-all"
            >
              <span className="font-bold text-gray-800 text-xs block mb-1">🍎 I use Mac</span>
              <span className="text-[10px] text-gray-400 font-medium leading-tight block">Works on Mac with Apple Silicon or Intel</span>
            </a>

            {/* Linux */}
            <button 
              type="button"
              onClick={() => setShowLinuxCmd(!showLinuxCmd)}
              className="border border-orange-200 hover:border-orange-300 bg-orange-50/10 hover:bg-orange-50/25 p-4 rounded-xl text-left block transition-all w-full"
            >
              <span className="font-bold text-orange-700 text-xs block mb-1">🐧 I use Linux</span>
              <span className="text-[10px] text-orange-500 font-medium leading-tight block">One command install</span>
            </button>
          </div>

          {showLinuxCmd && (
            <div className="animate-fade-in bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-1">
              <span className="text-[10px] text-gray-500 font-bold uppercase">Linux Terminal command:</span>
              <CopyCodeBlock code="curl -fsSL https://ollama.com/install.sh | sh" />
            </div>
          )}

          <div className="text-[10px] text-gray-450 italic">
            Not sure which one? Windows users: pick 🪟 | MacBook users: pick 🍎
          </div>

          <div className="pt-2">
            <button
              onClick={() => handleStepComplete(1)}
              className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              ✅ I downloaded and installed Ollama!
            </button>
          </div>
        </div>

        {/* STEP 2 */}
        <div 
          ref={stepRefs[2]}
          className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-4 transition-all duration-300 relative overflow-hidden ${
            stepsCompleted[2] ? 'opacity-85 border-green-200' : ''
          }`}
        >
          {stepsCompleted[2] && (
            <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
              <span>✓ Completed</span>
            </div>
          )}

          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center font-black shrink-0 text-sm">
              2
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                <span>Start Ollama</span>
                <span className="text-xl">▶️</span>
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Launch the Ollama daemon so local AI clients can communicate with it.
              </p>
            </div>
          </div>

          {/* OS instructions tabs */}
          <div className="flex border-b border-gray-200">
            {['windows', 'mac', 'linux'].map((os) => (
              <button
                key={os}
                onClick={() => setStep2OS(os as any)}
                className={`py-2 px-4 text-xs font-bold transition-all border-b-2 -mb-[1px] capitalize ${
                  step2OS === os
                    ? 'border-[#FF6B4A] text-[#FF6B4A]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {os}
              </button>
            ))}
          </div>

          {/* OS-specific instruction content */}
          <div className="text-xs leading-relaxed text-gray-650 bg-gray-50/50 p-4 rounded-xl border border-gray-150">
            {step2OS === 'windows' && (
              <div className="space-y-3">
                <p>After installing, find Ollama in your Start Menu and click it. You'll see a llama icon 🦙 appear in your taskbar at the bottom right.</p>
                <div className="bg-gray-200/50 text-gray-500 text-[10px] font-mono border border-gray-300 rounded p-4 text-center select-none">
                  Ollama appears here in taskbar → 🦙
                </div>
              </div>
            )}
            {step2OS === 'mac' && (
              <p>After installing, open Ollama from your Applications folder. You'll see a llama icon 🦙 in your menu bar at the top right.</p>
            )}
            {step2OS === 'linux' && (
              <div className="space-y-2">
                <p>Run this command in Terminal to spin up the local server:</p>
                <CopyCodeBlock code="ollama serve" />
              </div>
            )}
          </div>

          {/* Info checking card */}
          <div className="bg-[#EEF6FC] border border-[#D5EAFD] rounded-xl p-4 space-y-2">
            <div className="font-bold text-[#1E3A8A] text-xs flex items-center gap-1.5">
              <span>💡 How do you know it's running?</span>
            </div>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Open your browser and navigate to: <code className="bg-white/80 px-1 py-0.5 rounded font-mono">http://localhost:11434</code>. If you see some text, Ollama is successfully running!
            </p>
            <div className="pt-1">
              <a 
                href="http://localhost:11434"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 hover:underline bg-white border border-blue-200 px-3 py-1.5 rounded-lg shadow-sm"
              >
                <span>🔗 Test if Ollama is running →</span>
              </a>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => handleStepComplete(2)}
              className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              ✅ Ollama is running!
            </button>
          </div>
        </div>

        {/* STEP 3 */}
        <div 
          ref={stepRefs[3]}
          className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-4 transition-all duration-300 relative overflow-hidden ${
            stepsCompleted[3] ? 'opacity-85 border-green-200' : ''
          }`}
        >
          {stepsCompleted[3] && (
            <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
              <span>✓ Completed</span>
            </div>
          )}

          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center font-black shrink-0 text-sm">
              3
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                <span>Give Ollama a Brain</span>
                <span className="text-xl">🧠</span>
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Ollama needs a 'brain' to think with. These brains are called models. We recommend Llama 3 — it's smart, fast, and free!
              </p>
            </div>
          </div>

          {/* Model cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Llama 3 (8B) */}
            <div className="border border-orange-200 bg-orange-50/5 p-4 rounded-xl flex flex-col justify-between h-52 relative transition-all">
              <div>
                <span className="bg-orange-100 text-[#FF6B4A] text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wide block w-fit mb-1.5">🌟 Recommended</span>
                <span className="font-bold text-gray-800 text-xs block mb-1">Llama 3 (8B)</span>
                <p className="text-[10px] text-gray-450 mt-1 leading-normal">Size: 4.7 GB | Speed: ⚡ Fast</p>
                <p className="text-[10px] text-gray-500 italic mt-2">"Great for most computers"</p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] text-gray-400 font-bold block">Needs: 8GB RAM</span>
                <CopyCodeBlock code="ollama pull llama3" />
              </div>
            </div>

            {/* Gemma 3 (4B) */}
            <div className="border border-gray-250 p-4 rounded-xl flex flex-col justify-between h-52 relative transition-all">
              <div>
                <span className="bg-green-100 text-green-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wide block w-fit mb-1.5">🐣 For Older Computers</span>
                <span className="font-bold text-gray-800 text-xs block mb-1">Gemma 3 (4B)</span>
                <p className="text-[10px] text-gray-450 mt-1 leading-normal">Size: 2.5 GB | Speed: ⚡⚡ Faster</p>
                <p className="text-[10px] text-gray-500 italic mt-2">"Works on computers with 4GB RAM"</p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] text-gray-400 font-bold block">Needs: 4GB RAM</span>
                <CopyCodeBlock code="ollama pull gemma3" />
              </div>
            </div>

            {/* Llama 3 (70B) */}
            <div className="border border-gray-250 p-4 rounded-xl flex flex-col justify-between h-52 relative transition-all">
              <div>
                <span className="bg-blue-100 text-blue-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wide block w-fit mb-1.5">💪 For Powerful PCs</span>
                <span className="font-bold text-gray-800 text-xs block mb-1">Llama 3 (70B)</span>
                <p className="text-[10px] text-gray-450 mt-1 leading-normal">Size: 40 GB | Speed: 🐢 Slower</p>
                <p className="text-[10px] text-gray-500 italic mt-2">"Best quality briefs"</p>
              </div>
              <div className="space-y-2">
                <span className="text-[9px] text-gray-400 font-bold block">Needs: 48GB RAM</span>
                <CopyCodeBlock code="ollama pull llama3:70b" />
              </div>
            </div>
          </div>

          <div className="text-[10px] text-[#FF6B4A] font-bold">
            Not sure which to pick? Pick Llama 3 (8B) — it works on most laptops! 🎉
          </div>

          {/* How to run instructions */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">How to download the brain:</h3>
            
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setStep3OS('windows')}
                className={`py-1.5 px-3 text-xs font-bold transition-all border-b-2 -mb-[1px] ${
                  step3OS === 'windows'
                    ? 'border-[#FF6B4A] text-[#FF6B4A]'
                    : 'border-transparent text-gray-500 hover:text-gray-850'
                }`}
              >
                Windows
              </button>
              <button
                onClick={() => setStep3OS('mac_linux')}
                className={`py-1.5 px-3 text-xs font-bold transition-all border-b-2 -mb-[1px] ${
                  step3OS === 'mac_linux'
                    ? 'border-[#FF6B4A] text-[#FF6B4A]'
                    : 'border-transparent text-gray-500 hover:text-gray-850'
                }`}
              >
                Mac / Linux
              </button>
            </div>

            <div className="text-xs leading-relaxed text-gray-650 bg-gray-50/50 p-4 rounded-xl border border-gray-150">
              {step3OS === 'windows' ? (
                <ol className="list-decimal pl-4 space-y-1.5">
                  <li>Press the <strong>Windows key + R</strong> on your keyboard.</li>
                  <li>Type <code className="bg-white px-1.5 py-0.5 rounded border font-mono">cmd</code> and press Enter.</li>
                  <li>A black terminal window opens.</li>
                  <li>Copy and paste this command and press Enter:
                    <CopyCodeBlock code="ollama pull llama3" />
                  </li>
                  <li>Wait for it to finish downloading (takes 5-10 minutes on average internet).</li>
                </ol>
              ) : (
                <ol className="list-decimal pl-4 space-y-1.5">
                  <li>Open <strong>Terminal</strong> (Press Cmd+Space, type Terminal, and press Enter).</li>
                  <li>Copy and paste this command and press Enter:
                    <CopyCodeBlock code="ollama pull llama3" />
                  </li>
                  <li>Wait for it to finish!</li>
                </ol>
              )}
            </div>
          </div>

          <div className="text-[11px] text-gray-500 bg-[#FAF8F5] border border-orange-100 rounded-xl p-3.5 flex items-start gap-2">
            <span className="shrink-0 mt-0.5">⏳</span>
            <div>
              <strong>Progress note:</strong> While it downloads, you will see output like <code className="font-mono text-[10px] bg-white px-1 py-0.25 rounded">pulling manifest...</code> and <code className="font-mono text-[10px] bg-white px-1 py-0.25 rounded">pulling abc123... 45%</code>. That means it is working! Just let it finish.
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => handleStepComplete(3)}
              className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
            >
              ✅ Download finished!
            </button>
          </div>
        </div>

        {/* STEP 4 */}
        <div 
          ref={stepRefs[4]}
          className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-4 transition-all duration-300 relative overflow-hidden ${
            stepsCompleted[4] ? 'opacity-85 border-green-200' : ''
          }`}
        >
          {stepsCompleted[4] && (
            <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
              <span>✓ Completed</span>
            </div>
          )}

          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center font-black shrink-0 text-sm">
              4
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                <span>Connect to ViralSpy</span>
                <span className="text-xl">🔗</span>
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Connect the local Ollama instance inside ViralSpy configurations.
              </p>
            </div>
          </div>

          {/* WSL / Normal instructions */}
          <div className="space-y-3">
            <div className="bg-[#FAF8F5] border border-orange-100 rounded-xl p-4 space-y-1.5">
              <span className="font-bold text-gray-800 text-xs block">🪟 Windows Users:</span>
              <p className="text-[11px] text-gray-550 leading-relaxed">
                If you installed Ollama on Windows normally (not inside WSL), just use the default <code className="bg-white px-1 py-0.5 rounded border font-mono text-[10px]">http://localhost:11434</code>.
              </p>
              <p className="text-[11px] text-gray-550 leading-relaxed">
                If you are running ViralSpy inside WSL (Linux on Windows) but Ollama is running on the Windows side, you need your WSL IP address. Run this command in your Linux terminal to fetch the address:
              </p>
              <CopyCodeBlock code="hostname -I" />
              <p className="text-[10px] text-gray-400 italic">Use the first IP address shown (looks like 172.x.x.x).</p>
            </div>

            <div className="bg-[#FAF8F5] border border-orange-100 rounded-xl p-4">
              <span className="font-bold text-gray-800 text-xs block">🍎🐧 Mac and Linux Users:</span>
              <p className="text-[11px] text-gray-550 leading-relaxed mt-1">
                Just use: <code className="bg-white px-1 py-0.5 rounded border font-mono text-[10px]">http://localhost:11434</code>. Easy!
              </p>
            </div>
          </div>

          {/* Auto-detect button and warning card */}
          <div className="pt-2 space-y-4">
            <button
              type="button"
              onClick={detectUrl}
              disabled={detecting}
              className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-650 hover:text-gray-900 border border-gray-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              {detecting ? (
                <>
                  <span className="animate-spin text-sm">⌛</span>
                  <span>Detecting...</span>
                </>
              ) : (
                <span>🔍 Auto-detect my Ollama URL</span>
              )}
            </button>
            
            {detectionStatus === 'success' && (
              <p className="text-xs font-semibold text-green-600 mt-2">
                ✅ Found at {detectedUrl}!
              </p>
            )}
            {detectionStatus === 'failed' && (
              <p className="text-xs font-semibold text-red-505 mt-2">
                ❌ Ollama not detected. Make sure it's running (Step 2)
              </p>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <p className="font-semibold text-amber-800 mb-2">
                🪟 Windows Users — Important!
              </p>
              <p className="text-amber-700 text-sm mb-3">
                If Ollama is running inside WSL (Linux), localhost won't work. You need your WSL IP.
              </p>
              <p className="text-amber-700 text-sm mb-2">
                Run this in your Linux terminal to find your IP:
              </p>
              <CopyCodeBlock code="hostname -I" />
              <p className="text-amber-700 text-sm mt-2">
                Use the first number shown (looks like 172.x.x.x) and replace localhost with it.
              </p>
              <p className="text-amber-700 text-sm mt-2 font-medium">
                Then start Ollama with:
              </p>
              <CopyCodeBlock code="OLLAMA_HOST=0.0.0.0:11434 ollama serve" />
            </div>
          </div>

          {/* Display copyable fields */}
          <div className="space-y-2.5 pt-2">
            <span className="text-xs font-bold text-gray-700 block">Configure URL and Model Name:</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-150">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase block">Ollama URL</span>
                <input
                  type="text"
                  value={detectedUrl}
                  onChange={(e) => setDetectedUrl(e.target.value)}
                  className={`w-full text-xs font-mono px-3 py-2 bg-white rounded-lg border focus:outline-none focus:border-[#FF6B4A] ${
                    detectionStatus === 'success' ? 'border-green-500 bg-green-50/10 text-green-700 font-bold' : 'border-gray-200 text-gray-750'
                  }`}
                  placeholder="http://localhost:11434"
                />
              </div>
              
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase block">Model Name</span>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-[#FF6B4A] text-gray-750"
                  placeholder="llama3"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={saveToSettings}
              className="px-5 py-3 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center gap-1.5 shadow-sm"
            >
              <span>💾 Save these settings to ViralSpy</span>
            </button>
            {showSaved && (
              <span className="text-xs font-bold text-green-600 animate-pulse">
                ✅ Saved! You can now generate briefs.
              </span>
            )}
          </div>
        </div>

        {/* STEP 5 */}
        <div 
          ref={stepRefs[5]}
          className={`bg-gradient-to-br from-white to-orange-50/15 border rounded-2xl p-6 shadow-card space-y-4 transition-all duration-300 ${
            stepsCompleted[4] ? 'border-[#FF6B4A]' : 'opacity-50 border-gray-200'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center font-black shrink-0 text-sm">
              5
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                <span>You're all set!</span>
                <span className="text-xl">🎉</span>
              </h2>
            </div>
          </div>

          <div className="bg-orange-50/20 border border-orange-100 rounded-xl p-5 text-gray-750 space-y-2 leading-relaxed">
            <div className="font-bold text-gray-850 text-sm">🦙 Your local AI is ready!</div>
            <p className="text-xs">
              ViralSpy will now generate content briefs using AI running on <strong>YOUR computer</strong>.
            </p>
            <p className="text-xs font-semibold text-gray-650">
              No monthly bills. No data sent anywhere. Just pure AI power on your machine!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => router.push(getLocalizedPath('/dashboard'))}
              disabled={!stepsCompleted[4]}
              className="px-5 py-3 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              <span>🚀 Start generating briefs →</span>
            </button>
            
            <button
              onClick={() => router.push(getLocalizedPath('/settings'))}
              disabled={!stepsCompleted[4]}
              className="px-5 py-3 bg-white border border-gray-250 hover:border-[#FF6B4A] hover:text-[#FF6B4A] text-gray-650 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Settings className="h-4 w-4" />
              <span>⚙️ Go to Settings</span>
            </button>
          </div>
        </div>

        {/* Troubleshooting Section */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <HelpCircle className="h-4 w-4 text-[#FF6B4A]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800">Having problems? Click to expand:</h2>
          </div>

          <div className="divide-y divide-gray-150 text-xs">
            {/* Trouble 1 */}
            <div className="py-3">
              <button 
                onClick={() => toggleTrouble('inUse')}
                className="w-full flex items-center justify-between font-bold text-gray-700 hover:text-[#FF6B4A] transition-colors"
              >
                <span>▶ Ollama says "address already in use"</span>
                {expandedTrouble.inUse ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedTrouble.inUse && (
                <p className="mt-2 text-gray-500 leading-relaxed animate-fade-in pl-1">
                  This means Ollama is already running! That's actually good. Just skip to Step 4.
                </p>
              )}
            </div>

            {/* Trouble 2 */}
            <div className="py-3">
              <button 
                onClick={() => toggleTrouble('slow')}
                className="w-full flex items-center justify-between font-bold text-gray-700 hover:text-[#FF6B4A] transition-colors"
              >
                <span>▶ The download is very slow</span>
                {expandedTrouble.slow ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedTrouble.slow && (
                <p className="mt-2 text-gray-500 leading-relaxed animate-fade-in pl-1">
                  That's normal — the model is 4-5 GB. You can leave it running and come back later. Make sure your laptop is plugged in!
                </p>
              )}
            </div>

            {/* Trouble 3 */}
            <div className="py-3">
              <button 
                onClick={() => toggleTrouble('refused')}
                className="w-full flex items-center justify-between font-bold text-gray-700 hover:text-[#FF6B4A] transition-colors"
              >
                <span>▶ I see "connection refused" in ViralSpy</span>
                {expandedTrouble.refused ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedTrouble.refused && (
                <p className="mt-2 text-gray-500 leading-relaxed animate-fade-in pl-1">
                  Ollama might not be running. Go back to Step 2 and start Ollama again.
                </p>
              )}
            </div>

            {/* Trouble 4 */}
            <div className="py-3">
              <button 
                onClick={() => toggleTrouble('wsl')}
                className="w-full flex items-center justify-between font-bold text-gray-700 hover:text-[#FF6B4A] transition-colors"
              >
                <span>▶ Windows: ViralSpy can't connect to Ollama</span>
                {expandedTrouble.wsl ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedTrouble.wsl && (
                <div className="mt-2 text-gray-500 leading-relaxed animate-fade-in pl-1 space-y-2">
                  <p>If you're using WSL (Linux on Windows):</p>
                  <ol className="list-decimal pl-4 space-y-1.5">
                    <li>Open your Linux terminal</li>
                    <li>Get your WSL IP address:
                      <CopyCodeBlock code="hostname -I" />
                    </li>
                    <li>Copy the first IP address (looks like 172.x.x.x)</li>
                    <li>In ViralSpy Settings, change the Ollama URL to: <code className="font-mono bg-gray-100 px-1 py-0.25 rounded text-[10px]">http://[your-ip]:11434</code></li>
                    <li>Launch Ollama to listen on all interfaces by running this command:
                      <CopyCodeBlock code="OLLAMA_HOST=0.0.0.0:11434 ollama serve" />
                    </li>
                  </ol>
                </div>
              )}
            </div>

            {/* Trouble 5 */}
            <div className="py-3">
              <button 
                onClick={() => toggleTrouble('ram')}
                className="w-full flex items-center justify-between font-bold text-gray-700 hover:text-[#FF6B4A] transition-colors"
              >
                <span>▶ My computer doesn't have enough RAM</span>
                {expandedTrouble.ram ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedTrouble.ram && (
                <div className="mt-2 text-gray-500 leading-relaxed animate-fade-in pl-1 space-y-1">
                  <p>Try pulling the smaller Gemma 3 model instead:</p>
                  <CopyCodeBlock code="ollama pull gemma3" />
                  <p>Then, in Settings, change the Model name to: <code className="font-mono bg-gray-100 px-1 py-0.25 rounded">gemma3</code>.</p>
                </div>
              )}
            </div>

            {/* Trouble 6 */}
            <div className="py-3">
              <button 
                onClick={() => toggleTrouble('cloud')}
                className="w-full flex items-center justify-between font-bold text-gray-700 hover:text-[#FF6B4A] transition-colors"
              >
                <span>▶ I want to use a cloud API instead</span>
                {expandedTrouble.cloud ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {expandedTrouble.cloud && (
                <div className="mt-2 text-gray-500 leading-relaxed animate-fade-in pl-1 space-y-2">
                  <p>No problem! Go to Settings and choose <strong>"Bring Your Own Key"</strong> instead of Local AI.</p>
                  <p>Groq is free and works great. You can get a free key here:</p>
                  <a 
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-[#FF6B4A] hover:underline"
                  >
                    <span>Open Groq Key Console</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

      </main>

      {/* Footer Bar */}
      <footer className="w-full max-w-3xl mx-auto py-6 border-t border-gray-200 flex items-center justify-between text-xs text-gray-550 mt-12 px-4 sm:px-6">
        <div>© 2026 ViralSpy.</div>
        <div className="text-[#FF6B4A] italic">Quietly Rise</div>
      </footer>
    </div>
  );
}
