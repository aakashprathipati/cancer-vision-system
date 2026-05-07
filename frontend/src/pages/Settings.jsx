import { useState } from 'react';
import { Save, Shield, Cpu, Bell, Sliders } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Settings = () => {
  const [sensitivity, setSensitivity] = useState(95);

  const getSensitivityLabel = (val) => {
    if (val >= 90) return 'High';
    if (val >= 60) return 'Moderate';
    return 'Low';
  };

  const handleSave = () => {
    const savePromise = new Promise((resolve) => setTimeout(resolve, 1000));
    toast.promise(savePromise, {
      loading: 'Saving configuration...',
      success: 'Settings Saved Successfully!',
      error: 'Failed to save settings.',
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="w-full h-full bg-[#050505] p-12 lg:p-20 overflow-y-auto pl-28 lg:pl-12"
    >
      <div className="max-w-4xl mx-auto">
        
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-white mb-4">System <span className="font-semibold text-glow">Settings</span></h1>
            <p className="text-zinc-400 text-lg">Configure AI engine parameters and system preferences.</p>
          </div>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-4 bg-brand hover:bg-brand/80 text-white rounded-2xl font-bold transition-all hover:scale-105 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            <Save className="w-5 h-5" />
            <span>Save Configuration</span>
          </button>
        </header>

        <div className="space-y-8">
          
          {/* AI Engine Configuration */}
          <section className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
              <Cpu className="w-6 h-6 text-brand" />
              Engine Parameters
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="flex justify-between text-sm font-medium text-zinc-300 mb-2">
                  <span>Diagnostic Sensitivity</span>
                  <span className="text-brand font-bold">{getSensitivityLabel(sensitivity)} ({sensitivity}%)</span>
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseInt(e.target.value))}
                  className="w-full accent-brand cursor-pointer" 
                />
                <p className="text-xs text-zinc-500 mt-2">Adjust the threshold for false-positive detection vs strict malignancy confirmation.</p>
              </div>

              <div className="pt-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="block text-sm font-medium text-zinc-300">Enable Heuristic Fallback</span>
                    <span className="block text-xs text-zinc-500 mt-1">Use Canvas API variance analysis when primary nnU-Net fails.</span>
                  </div>
                  <div className="relative">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-14 h-7 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand"></div>
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* Privacy & Security */}
          <section className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
              <Shield className="w-6 h-6 text-emerald-500" />
              Security & Compliance
            </h2>
            
            <div className="space-y-6">
              <div className="pt-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="block text-sm font-medium text-zinc-300">Strict Data Anonymization</span>
                    <span className="block text-xs text-zinc-500 mt-1">Automatically scrub metadata (EXIF/DICOM headers) from uploaded scans.</span>
                  </div>
                  <div className="relative">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-14 h-7 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-white/5">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="block text-sm font-medium text-zinc-300">Local Telemetry Archive</span>
                    <span className="block text-xs text-zinc-500 mt-1">Store inference results only on local disk (HIPAA Mode).</span>
                  </div>
                  <div className="relative">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-14 h-7 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* User Interface */}
          <section className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
              <Sliders className="w-6 h-6 text-purple-500" />
              Interface Preferences
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Color Profile</label>
                <select className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none">
                  <option>High Contrast Dark</option>
                  <option>Medical Standard (Light)</option>
                  <option>Neon Terminal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Animation Level</label>
                <select className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors appearance-none">
                  <option>Full (Cinematic)</option>
                  <option>Reduced</option>
                  <option>None (Performance Mode)</option>
                </select>
              </div>
            </div>
          </section>

        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
