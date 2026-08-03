'use client';

import { useState } from 'react';
import { analyzeSkillGap } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface Analysis {
  readinessScore: number;
  strengths: string[];
  gaps: string[];
  learningPath: string[];
  summary: string;
}

export default function SkillGapAnalyzer() {
  const [targetRole, setTargetRole] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setAnalysis(null);

    try {
      const token = getToken();
      if (!token) throw new Error('Not logged in');

      const result = await analyzeSkillGap(targetRole, token);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-[#E5E1D8] shadow-sm md:col-span-2">
      <h2 className="text-lg font-semibold mb-1 text-[#1A1A1A]">AI Skill Gap Analyzer</h2>
      <p className="text-sm text-[#8A877D] mb-4">
        See how your profile stacks up against a target role
      </p>

      <form onSubmit={handleAnalyze} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Target role (e.g. Frontend Developer)"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          required
          className="flex-1 px-3 py-2 border border-[#E5E1D8] rounded-lg text-sm text-[#1A1A1A] placeholder:text-[#8A877D] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#4F46E5] text-white font-medium px-4 py-2 rounded-lg text-sm hover:bg-[#4338CA] transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {analysis && (
        <div className="space-y-5 pt-4 border-t border-[#E5E1D8]">
          {/* Readiness score */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-[#1A1A1A]">Readiness Score</span>
              <span className="text-sm font-bold text-[#4F46E5]">{analysis.readinessScore}/100</span>
            </div>
            <div className="w-full h-2 bg-[#F5F3EE] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4F46E5] transition-all"
                style={{ width: `${analysis.readinessScore}%` }}
              />
            </div>
          </div>

          <p className="text-sm text-[#5B5952]">{analysis.summary}</p>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">Strengths</h3>
              <ul className="space-y-1">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-[#5B5952] flex gap-1.5">
                    <span className="text-green-600">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">Gaps</h3>
              <ul className="space-y-1">
                {analysis.gaps.map((g, i) => (
                  <li key={i} className="text-sm text-[#5B5952] flex gap-1.5">
                    <span className="text-amber-600">!</span> {g}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">Learning Path</h3>
              <ol className="space-y-1">
                {analysis.learningPath.map((l, i) => (
                  <li key={i} className="text-sm text-[#5B5952] flex gap-1.5">
                    <span className="text-[#4F46E5] font-medium">{i + 1}.</span> {l}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}