'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Logo from '../../../components/Logo';
import { supabase, getCurrentUser } from '../../../lib/supabase';
import { ArrowLeft, Loader2, Check } from 'lucide-react';

export default function FeedbackPage() {
  const router = useRouter();
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    overall_experience: '',
    ease_of_finding: '',
    design_rating: '',
    visually_appealing: '',
    navigation_ease: '',
    menu_clarity: '',
    loading_speed: '',
    technical_issues: '',
    trend_data_usefulness: '',
    brief_quality: '',
    mobile_experience: '',
    device_used: '',
    recommend_likelihood: '',
    visit_again: '',
    overall_satisfaction: '',
    improvement_area: '',
    suggestions: ''
  });

  const getLocalizedPath = (path: string) => {
    return locale === 'en' ? path : `/${locale}${path}`;
  };

  const handleSelect = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.substring(0, 1000);
    setFormData(prev => ({
      ...prev,
      suggestions: val
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let user = null;
    if (supabase) {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    }
    if (!user) {
      user = await getCurrentUser();
    }

    const payload = {
      ...formData,
      user_id: user?.id || null,
      user_email: user?.email || null,
      user_name: user?.user_metadata?.full_name || null,
    };

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Compute progress (16 radio questions total)
  const radioFields = [
    'overall_experience',
    'ease_of_finding',
    'design_rating',
    'visually_appealing',
    'navigation_ease',
    'menu_clarity',
    'loading_speed',
    'technical_issues',
    'trend_data_usefulness',
    'brief_quality',
    'mobile_experience',
    'device_used',
    'recommend_likelihood',
    'visit_again',
    'overall_satisfaction',
    'improvement_area'
  ];

  const answeredCount = radioFields.filter(f => formData[f as keyof typeof formData]).length;
  const progressPercent = Math.round((answeredCount / 16) * 100);

  // Helper render option group
  const renderOptionGroup = (field: string, options: string[]) => {
    const selectedValue = formData[field as keyof typeof formData];
    return (
      <div className="flex flex-wrap gap-2.5 mt-2">
        {options.map(opt => {
          const isSelected = selectedValue === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleSelect(field, opt)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                isSelected
                  ? 'bg-[#FF6B4A]/10 border-[#FF6B4A] text-[#FF6B4A]'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-[#FF6B4A]/5 hover:border-gray-300 hover:text-gray-750'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F7F5F2] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Soft background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-orange-400/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-[540px] bg-white border border-gray-200 rounded-3xl p-8 shadow-card flex flex-col items-center text-center space-y-6 animate-scale-up">
          {/* Animated checkmark container */}
          <div className="h-16 w-16 bg-[#FF6B4A]/10 text-[#FF6B4A] rounded-full flex items-center justify-center shadow-inner animate-bounce">
            <Check className="h-8 w-8 stroke-[3]" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-[#1A1A1A] tracking-tight">Thank you for your feedback! 🙏</h1>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              Your response helps us build ViralSpy better for every creator.
            </p>
          </div>

          <button
            onClick={() => router.push(getLocalizedPath('/dashboard'))}
            className="w-full py-3.5 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Back to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F2] text-[#1A1A1A] flex flex-col justify-between font-sans relative">
      {/* Background soft highlights */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-orange-400/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-400/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Sticky Header Bar */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-50 py-3.5 px-4 sm:px-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Logo />
          </div>
          <button
            onClick={() => router.push(getLocalizedPath('/dashboard'))}
            className="flex items-center space-x-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-650 hover:text-gray-900 rounded-xl text-xs font-bold transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-[680px] mx-auto w-full py-10 px-4 sm:px-6 z-10 space-y-8">
        
        {/* Error Toast */}
        {error && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl shadow-lg flex items-center space-x-2 animate-bounce">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="text-center sm:text-left space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight leading-none">
            Share Your Feedback
          </h1>
          <div className="h-1 w-16 bg-[#FF6B4A] rounded-full mx-auto sm:mx-0" />
          <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-md">
            Help us build ViralSpy better for creators. Takes 2 minutes.
          </p>
        </div>

        {/* Global Progress Bar */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-card space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-[#FF6B4A] uppercase tracking-wider">{progressPercent}% Completed</span>
            <span className="text-gray-400 font-semibold">{answeredCount} of 16 questions answered</span>
          </div>
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#FF6B4A] h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-6">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#FF6B4A]">Overall Experience</span>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#1A1A1A]">
                How would you rate your overall experience with ViralSpy?
              </label>
              {renderOptionGroup('overall_experience', ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor'])}
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-150/60">
              <label className="block text-sm font-bold text-[#1A1A1A]">
                How easy was it to find trending content in your niche?
              </label>
              {renderOptionGroup('ease_of_finding', ['Very Easy', 'Easy', 'Neutral', 'Difficult', 'Very Difficult'])}
            </div>
          </div>

          {/* SECTION 2 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-6">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#FF6B4A]">Design & Interface</span>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#1A1A1A]">
                How would you rate ViralSpy's design and appearance?
              </label>
              {renderOptionGroup('design_rating', ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor'])}
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-150/60">
              <label className="block text-sm font-bold text-[#1A1A1A]">
                Is ViralSpy visually appealing and easy on the eyes?
              </label>
              {renderOptionGroup('visually_appealing', ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'])}
            </div>
          </div>

          {/* SECTION 3 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-6">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#FF6B4A]">Navigation</span>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#1A1A1A]">
                How easy was it to navigate between trends and briefs?
              </label>
              {renderOptionGroup('navigation_ease', ['Very Easy', 'Easy', 'Neutral', 'Difficult', 'Very Difficult'])}
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-150/60">
              <label className="block text-sm font-bold text-[#1A1A1A]">
                Were the dashboard sections clear and understandable?
              </label>
              {renderOptionGroup('menu_clarity', ['Yes Very Clear', 'Mostly Clear', 'Neutral', 'Somewhat Confusing', 'Very Confusing'])}
            </div>
          </div>

          {/* SECTION 4 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-6">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#FF6B4A]">Performance</span>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#1A1A1A]">
                How satisfied are you with ViralSpy's loading speed?
              </label>
              {renderOptionGroup('loading_speed', ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'])}
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-150/60">
              <label className="block text-sm font-bold text-[#1A1A1A]">
                Did you encounter any technical issues while using ViralSpy?
              </label>
              {renderOptionGroup('technical_issues', ['No Issues', 'Minor Issues', 'Moderate Issues', 'Major Issues'])}
            </div>
          </div>

          {/* SECTION 5 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-6">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#FF6B4A]">Content & AI Quality</span>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#1A1A1A]">
                How useful was the trend data shown on the dashboard?
              </label>
              {renderOptionGroup('trend_data_usefulness', ['Very Useful', 'Useful', 'Neutral', 'Not Very Useful', 'Not Useful At All'])}
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-150/60">
              <label className="block text-sm font-bold text-[#1A1A1A]">
                How would you rate the AI-generated content briefs?
              </label>
              {renderOptionGroup('brief_quality', ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor'])}
            </div>
          </div>

          {/* SECTION 6 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-6">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#FF6B4A]">Mobile Experience</span>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#1A1A1A]">
                How was your experience using ViralSpy on your device?
              </label>
              {renderOptionGroup('mobile_experience', ['Excellent', 'Good', 'Average', 'Poor', 'Very Poor'])}
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-150/60">
              <label className="block text-sm font-bold text-[#1A1A1A]">
                Which device did you use to access ViralSpy?
              </label>
              {renderOptionGroup('device_used', ['Mobile Phone', 'Tablet', 'Laptop/Desktop', 'Other'])}
            </div>
          </div>

          {/* SECTION 7 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-6">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#FF6B4A]">Recommendation</span>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#1A1A1A]">
                How likely are you to recommend ViralSpy to other creators?
              </label>
              {renderOptionGroup('recommend_likelihood', ['Very Likely', 'Likely', 'Neutral', 'Unlikely', 'Very Unlikely'])}
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-150/60">
              <label className="block text-sm font-bold text-[#1A1A1A]">
                Would you visit and use ViralSpy again?
              </label>
              {renderOptionGroup('visit_again', ['Definitely', 'Probably', 'Not Sure', 'Probably Not', 'Definitely Not'])}
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-150/60">
              <label className="block text-sm font-bold text-[#1A1A1A]">
                How satisfied are you overall with ViralSpy?
              </label>
              {renderOptionGroup('overall_satisfaction', ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'])}
            </div>
          </div>

          {/* SECTION 8 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-card space-y-6">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#FF6B4A]">Improvement</span>
            
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#1A1A1A]">
                What aspect of ViralSpy needs the most improvement?
              </label>
              {renderOptionGroup('improvement_area', [
                'Design',
                'Navigation',
                'Loading Speed',
                'Trend Data Quality',
                'Brief Generation',
                'Mobile Experience',
                'Features/Functionality'
              ])}
            </div>
          </div>

          {/* FINAL SECTION */}
          <div className="bg-white border-l-4 border-l-[#FF6B4A] border-y border-r border-gray-200 rounded-2xl p-6 shadow-card space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#1A1A1A]">
                Anything else you'd like to tell us?
              </label>
              <p className="text-xs text-gray-400 font-semibold mt-1">
                Share any problems, suggestions, or ideas. We read every single response.
              </p>
            </div>
            
            <div className="relative">
              <textarea
                rows={5}
                value={formData.suggestions}
                onChange={handleTextChange}
                placeholder="Type your thoughts here..."
                className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#FF6B4A] focus:ring-1 focus:ring-[#FF6B4A] text-gray-750 placeholder-gray-300 transition-all resize-none"
              />
              <span className="absolute bottom-3 right-3.5 text-[10px] font-bold text-gray-400">
                {formData.suggestions.length} / 1000
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#FF6B4A] hover:bg-[#ff5a33] text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Feedback →</span>
              )}
            </button>
          </div>

        </form>
      </main>

      {/* Footer */}
      <footer className="max-w-[680px] mx-auto w-full py-6 border-t border-gray-200 flex justify-between items-center text-xs text-gray-550 mt-12 px-4">
        <div>© 2026 ViralSpy.</div>
        <div className="text-[#FF6B4A] italic">Quietly Rise</div>
      </footer>
    </div>
  );
}
