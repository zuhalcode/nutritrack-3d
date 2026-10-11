'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sliders, Check, Download, Upload } from 'lucide-react';
import { useFoodLogStore } from '../features/food-log/store';
import { NutrientTargets } from '../features/food-log/types';

interface TargetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TargetSettingsModal({ isOpen, onClose }: TargetSettingsModalProps) {
  const targets = useFoodLogStore((s) => s.targets);
  const setTargets = useFoodLogStore((s) => s.setTargets);
  const entries = useFoodLogStore((s) => s.entries);
  const importEntries = useFoodLogStore((s) => s.importEntries);

  const [formData, setFormData] = useState<NutrientTargets>({ ...targets });
  const [importNotice, setImportNotice] = useState<string | null>(null);

  const handleSave = () => {
    setTargets(formData);
    onClose();
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nutritrack-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          importEntries(parsed);
          setImportNotice(`Successfully restored ${parsed.length} entries.`);
        } else {
          setImportNotice('Invalid backup file format.');
        }
      } catch {
        setImportNotice('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 25 }}
          className="relative w-full max-w-lg bg-[#0e1118] border-t sm:border border-white/[0.1] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[88dvh] overflow-y-auto pb-[calc(1rem+env(safe-area-inset-bottom,0px))]"
        >
          {/* Mobile Sheet Drag Handle */}
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto -mt-1 mb-1 sm:hidden shrink-0" />

          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#b6f028]" />
              <h3 className="text-sm sm:text-base font-bold text-white">Metabolic Targets & Backup</h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Close settings"
              className="min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-colors touch-manipulation cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-xs font-mono text-zinc-400 uppercase">Daily Nutrient Goals</h4>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="text-[11px] font-mono text-zinc-400">Calories (kcal)</label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                  className="w-full mt-1 min-h-[44px] px-3 py-2 bg-[#141824] border border-white/[0.08] rounded-xl text-base sm:text-sm font-mono text-white focus:outline-none focus:border-[#b6f028]"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-cyan-400">Protein (g)</label>
                <input
                  type="number"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: Number(e.target.value) })}
                  className="w-full mt-1 min-h-[44px] px-3 py-2 bg-[#141824] border border-white/[0.08] rounded-xl text-base sm:text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-lime-400">Carbohydrates (g)</label>
                <input
                  type="number"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: Number(e.target.value) })}
                  className="w-full mt-1 min-h-[44px] px-3 py-2 bg-[#141824] border border-white/[0.08] rounded-xl text-base sm:text-sm font-mono text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-purple-400">Fats (g)</label>
                <input
                  type="number"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: Number(e.target.value) })}
                  className="w-full mt-1 min-h-[44px] px-3 py-2 bg-[#141824] border border-white/[0.08] rounded-xl text-base sm:text-sm font-mono text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400">Fiber (g)</label>
                <input
                  type="number"
                  value={formData.fiber}
                  onChange={(e) => setFormData({ ...formData, fiber: Number(e.target.value) })}
                  className="w-full mt-1 min-h-[44px] px-3 py-2 bg-[#141824] border border-white/[0.08] rounded-xl text-base sm:text-sm font-mono text-white focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400">Sodium (mg)</label>
                <input
                  type="number"
                  value={formData.sodium}
                  onChange={(e) => setFormData({ ...formData, sodium: Number(e.target.value) })}
                  className="w-full mt-1 min-h-[44px] px-3 py-2 bg-[#141824] border border-white/[0.08] rounded-xl text-base sm:text-sm font-mono text-white focus:outline-none focus:border-zinc-400"
                />
              </div>
            </div>
          </div>

          {/* Backup / Export / Import */}
          <div className="pt-3 border-t border-white/[0.08] space-y-2.5 sm:space-y-3">
            <h4 className="text-xs font-mono text-zinc-400 uppercase">Data Backup & Restore</h4>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                onClick={handleExport}
                className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-[#141824] hover:bg-[#1a2030] border border-white/[0.08] text-xs font-mono text-zinc-200 flex items-center justify-center gap-2 touch-manipulation cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON
              </button>

              <label className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-[#141824] hover:bg-[#1a2030] border border-white/[0.08] text-xs font-mono text-zinc-200 flex items-center justify-center gap-2 cursor-pointer text-center touch-manipulation">
                <Upload className="w-3.5 h-3.5" />
                Restore JSON
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>
            {importNotice && (
              <p className="text-[11px] font-mono text-[#b6f028]">{importNotice}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-xs font-mono text-zinc-400 hover:text-white rounded-xl transition-colors touch-manipulation cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#b6f028] text-black font-mono font-bold text-xs flex items-center gap-2 touch-manipulation cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Save Targets
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
