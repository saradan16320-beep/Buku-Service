import React, { useState } from 'react';
import { DIAGNOSTIC_TOPICS } from '../data/diagnosticGuide';
import { TroubleshootingTopic } from '../types';
import { X, BookOpen, AlertCircle, CheckCircle, Search, HelpCircle } from 'lucide-react';

interface TroubleshootingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TroubleshootingModal: React.FC<TroubleshootingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTopic, setActiveTopic] = useState<TroubleshootingTopic | null>(
    DIAGNOSTIC_TOPICS[0]
  );

  if (!isOpen) return null;

  const filteredTopics = DIAGNOSTIC_TOPICS.filter((t) => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchSymptoms = t.symptoms.some((s) => s.toLowerCase().includes(q));
      const matchCauses = t.possibleCauses.some((c) => c.toLowerCase().includes(q));
      return matchTitle || matchSymptoms || matchCauses;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-5 sm:p-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Panduan Diagnosa & Gejala Masalah Motor
              </h2>
              <p className="text-xs text-slate-400">
                Penyebab dan solusi kendala umum: Gredek CVT, mesin brebet, rem decit, aki drop, dll.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari keluhan (gredek, brebet, busi, aki, rem...)"
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 text-xs">
            {['all', 'cvt_transmisi', 'mesin', 'pengereman', 'kelistrikan', 'kaki_kaki'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl capitalize whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat === 'all'
                  ? 'Semua Topik'
                  : cat === 'cvt_transmisi'
                  ? 'CVT / Gir'
                  : cat === 'kaki_kaki'
                  ? 'Setang & Roda'
                  : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content Layout: 2 Columns */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 overflow-hidden min-h-0">
          {/* Topic list */}
          <div className="md:col-span-5 overflow-y-auto space-y-2 pr-1 max-h-[50vh] md:max-h-[55vh]">
            {filteredTopics.map((topic) => {
              const isSelected = activeTopic?.id === topic.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => setActiveTopic(topic)}
                  className={`w-full text-left p-3 rounded-2xl border transition ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/40 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-200 leading-snug">
                    {topic.title}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10px]">
                    <span
                      className={`font-semibold uppercase px-1.5 py-0.2 rounded ${
                        topic.urgencyLevel === 'tinggi'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      Urgensi: {topic.urgencyLevel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Topic Detail View */}
          <div className="md:col-span-7 bg-slate-950/90 rounded-2xl border border-slate-800 p-4 sm:p-5 overflow-y-auto max-h-[50vh] md:max-h-[55vh] space-y-4">
            {activeTopic ? (
              <>
                <div>
                  <h3 className="text-base font-extrabold text-white tracking-tight">
                    {activeTopic.title}
                  </h3>
                  <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-amber-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Tingkat Perhatian: <strong>{activeTopic.urgencyLevel.toUpperCase()}</strong></span>
                  </div>
                </div>

                {/* Gejala / Symptoms */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Gejala Yang Terasa / Terdengar:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {activeTopic.symptoms.map((sym, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0"></span>
                        <span>{sym}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Penyebab / Causes */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Kemungkinan Penyebab:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {activeTopic.possibleCauses.map((cause, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></span>
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Solusi / Recommended solutions */}
                <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-xl">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Tindakan & Solusi Servis:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-emerald-200">
                    {activeTopic.recommendedSolutions.map((sol, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-bold text-emerald-400">•</span>
                        <span>{sol}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-xs text-slate-500">
                Pilih topik masalah di sebelah kiri
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
