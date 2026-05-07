import { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Calendar, Activity, ChevronDown, X, Eye, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Database = () => {
  const [scans, setScans] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedScan, setSelectedScan] = useState(null);

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/patients/');
        const patients = await response.json();
        
        let allScans = [];
        patients.forEach(patient => {
          patient.scans.forEach(scan => {
            let status = 'PENDING';
            let type = 'Unknown';
            let confidence = '0%';
            
            if (scan.inference_result) {
               const result = scan.inference_result;
               if (result.confidence_score_melanoma > 50) {
                 type = 'Malignant Melanoma';
                 confidence = result.confidence_score_melanoma.toFixed(1) + '%';
                 status = 'CRITICAL ALERT';
               } else if (result.confidence_score_bcc > 50) {
                 type = 'Basal Cell Carcinoma';
                 confidence = result.confidence_score_bcc.toFixed(1) + '%';
                 status = 'PRIORITY';
               } else if (result.confidence_score_scc > 50) {
                 type = 'Squamous Cell Carcinoma';
                 confidence = result.confidence_score_scc.toFixed(1) + '%';
                 status = 'PRIORITY';
               } else {
                 type = 'Benign / Clear';
                 confidence = '99%';
                 status = 'BENIGN';
               }
            }
            
            allScans.push({
              id: `SCN-${scan.id}`,
              date: new Date(scan.uploaded_at).toISOString().split('T')[0],
              patient: `${patient.first_name} ${patient.last_name}`,
              status: status,
              type: type,
              confidence: confidence,
              image: scan.image_reference || '/scan.png',
              rawId: scan.id
            });
          });
        });
        setScans(allScans);
      } catch (e) {
        console.error('Failed to fetch from DB', e);
      }
    };
    fetchScans();
  }, []);

  const handleDelete = async (scan) => {
    try {
      await fetch(`http://localhost:8000/api/v1/scans/${scan.rawId}/`, { method: 'DELETE' });
      setScans(scans.filter(s => s.id !== scan.id));
      setActiveMenu(null);
    } catch(e) {
      console.error(e);
    }
  };

  const filteredScans = scans.filter(scan => {
    const matchesSearch = scan.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          scan.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          scan.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || scan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="w-full h-full bg-[#050505] p-12 lg:p-20 overflow-y-auto pl-28 lg:pl-12"
    >
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-12">
          <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-white mb-4">Diagnostic <span className="font-semibold text-glow">Database</span></h1>
          <p className="text-zinc-400 text-lg">Review and manage historical dermatoscopic inferences.</p>
        </header>

        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500/70" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by ID, Patient, or Type..."
                className="w-full bg-[#0a0a0a] border border-cyan-900/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-4 border rounded-2xl text-white transition-all duration-300 ${showFilters ? 'bg-cyan-900/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-[#0a0a0a] border-cyan-900/50 hover:border-cyan-500/50 hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]'}`}
            >
              <Filter className="w-5 h-5 text-cyan-400" />
              <span className="font-medium tracking-wide">Filter Results</span>
              <ChevronDown className={`w-4 h-4 text-cyan-400 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 bg-[#0a0a0a] border border-white/10 rounded-2xl flex flex-wrap gap-6 items-center">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Status Category</label>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand/50"
                    >
                      <option value="All">All Statuses</option>
                      <option value="CRITICAL ALERT">Critical Alert</option>
                      <option value="PRIORITY">Priority</option>
                      <option value="EVALUATION ADVISED">Evaluation Advised</option>
                      <option value="BENIGN">Benign</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-[#0a0a0a] border border-cyan-900/30 rounded-3xl overflow-visible shadow-[0_0_40px_rgba(6,182,212,0.05)] relative z-10">
          <div className="overflow-x-auto overflow-y-visible min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-cyan-900/30 bg-cyan-950/10">
                  <th className="py-5 px-6 font-semibold text-cyan-400/70 text-sm tracking-widest uppercase">Scan Image</th>
                  <th className="py-5 px-6 font-semibold text-cyan-400/70 text-sm tracking-widest uppercase">Scan ID</th>
                  <th className="py-5 px-6 font-semibold text-cyan-400/70 text-sm tracking-widest uppercase">Date</th>
                  <th className="py-5 px-6 font-semibold text-cyan-400/70 text-sm tracking-widest uppercase">Patient Profile</th>
                  <th className="py-5 px-6 font-semibold text-cyan-400/70 text-sm tracking-widest uppercase">Analysis Status</th>
                  <th className="py-5 px-6 font-semibold text-cyan-400/70 text-sm tracking-widest uppercase">Detected Type</th>
                  <th className="py-5 px-6 font-semibold text-cyan-400/70 text-sm tracking-widest uppercase">Confidence</th>
                  <th className="py-5 px-6 font-semibold text-cyan-400/70 text-sm tracking-widest uppercase text-right">Actions</th>
                </tr>
              </thead>
              <motion.tbody variants={containerVariants} initial="hidden" animate="show">
                {filteredScans.length > 0 ? filteredScans.map((scan, index) => (
                  <motion.tr 
                    variants={itemVariants}
                    key={index} 
                    className="border-b border-cyan-900/10 hover:bg-cyan-950/20 hover:shadow-[inset_0_0_20px_rgba(6,182,212,0.05)] transition-all duration-300 group cursor-pointer relative"
                  >
                    <td className="py-3 px-6" onClick={() => setSelectedScan(scan)}>
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-cyan-500/20 group-hover:border-cyan-400/80 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300 shrink-0 relative group/img">
                        <img src={scan.image || "/scan.png"} alt="Patient Scan" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-125" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none backdrop-blur-[2px]">
                          <Search className="w-5 h-5 text-cyan-300 drop-shadow-[0_0_5px_rgba(103,232,249,1)]" />
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6 font-mono text-zinc-200 group-hover:text-cyan-100 transition-colors">{scan.id}</td>
                    <td className="py-5 px-6 text-zinc-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> {scan.date}
                    </td>
                    <td className="py-5 px-6 text-zinc-300">{scan.patient}</td>
                    <td className="py-5 px-6">
                      <span className={`inline-flex px-3 py-1.5 text-xs font-bold tracking-wider uppercase rounded-full border shadow-[0_0_10px_currentcolor] opacity-90
                        ${scan.status === 'CRITICAL ALERT' ? 'bg-critical/10 text-rose-400 border-rose-500/50' : 
                          scan.status === 'PRIORITY' ? 'bg-orange-500/10 text-orange-400 border-orange-500/50' :
                          scan.status === 'EVALUATION ADVISED' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/50'}`}
                      >
                        {scan.status}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-white font-medium group-hover:text-cyan-50 transition-colors">{scan.type}</td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_3px_rgba(6,182,212,0.8)]" />
                        <span className="font-mono text-zinc-200">{scan.confidence}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-right relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === scan.id ? null : scan.id); }}
                        className="p-2 text-zinc-500 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-full transition-all duration-300 focus:outline-none"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      
                      <AnimatePresence>
                        {activeMenu === scan.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-8 top-12 w-48 bg-[#0a0a0a] border border-cyan-500/30 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.15)] z-50 overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button 
                              onClick={() => { setSelectedScan(scan); setActiveMenu(null); }}
                              className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-cyan-900/30 hover:text-cyan-300 transition-colors flex items-center gap-3 border-b border-cyan-900/20"
                            >
                              <Eye className="w-4 h-4" /> View Full Image
                            </button>
                            <button 
                              onClick={() => handleDelete(scan)}
                              className="w-full text-left px-4 py-3 text-sm text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors flex items-center gap-3"
                            >
                              <Trash2 className="w-4 h-4" /> Delete Record
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-zinc-500 font-medium">
                      No matching diagnostic records found.
                    </td>
                  </tr>
                )}
              </motion.tbody>
            </table>
          </div>
          
          <div className="p-6 border-t border-cyan-900/30 flex justify-between items-center text-sm text-zinc-500">
            <span>Showing <span className="text-cyan-400 font-bold">{filteredScans.length}</span> {filteredScans.length === 1 ? 'entry' : 'entries'}</span>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-cyan-900/50 rounded-lg hover:bg-cyan-900/20 hover:border-cyan-400/50 hover:text-cyan-300 transition-all disabled:opacity-50">Previous</button>
              <button className="px-4 py-2 border border-cyan-900/50 rounded-lg hover:bg-cyan-900/20 hover:border-cyan-400/50 hover:text-cyan-300 transition-all">Next</button>
            </div>
          </div>
        </div>

      </div>

      <AnimatePresence>
        {selectedScan && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setSelectedScan(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-[#050505] p-2 rounded-2xl border border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.3)] max-w-5xl w-full max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedScan(null)} 
                className="absolute top-6 right-6 bg-black/60 p-3 rounded-full text-white hover:text-cyan-400 z-10 transition-all border border-white/10 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.6)] backdrop-blur-sm group"
              >
                 <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>
              
              <div className="w-full bg-black/50 rounded-t-xl flex items-center justify-center overflow-hidden min-h-[40vh] max-h-[65vh]">
                <img 
                  src={selectedScan.image || "/scan.png"} 
                  alt="Full Patient Scan" 
                  className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(0,0,0,1)]" 
                />
              </div>
              
              <div className="p-8 border-t border-cyan-900/30 bg-gradient-to-b from-[#0a0a0a] to-[#050505] rounded-b-xl">
                 <div className="flex justify-between items-start">
                   <div>
                     <h3 className="text-3xl font-light text-white mb-3 tracking-tight">
                       Scan ID: <span className="font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">{selectedScan.id}</span>
                     </h3>
                     <div className="flex gap-6 text-zinc-400 text-lg">
                       <p className="flex items-center gap-2"><span className="text-zinc-500 uppercase text-xs font-bold tracking-widest">Patient</span> <span className="text-white font-medium">{selectedScan.patient}</span></p>
                       <p className="flex items-center gap-2"><span className="text-zinc-500 uppercase text-xs font-bold tracking-widest">Date</span> <span className="text-white font-medium">{selectedScan.date}</span></p>
                     </div>
                   </div>
                   <div className="text-right flex flex-col items-end">
                      <span className={`inline-flex px-4 py-2 text-sm font-bold tracking-wider uppercase rounded-full border shadow-[0_0_15px_currentcolor] mb-3
                        ${selectedScan.status === 'CRITICAL ALERT' ? 'bg-critical/10 text-rose-400 border-rose-500/50' : 
                          selectedScan.status === 'PRIORITY' ? 'bg-orange-500/10 text-orange-400 border-orange-500/50' :
                          selectedScan.status === 'EVALUATION ADVISED' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/50'}`}
                      >
                        {selectedScan.status}
                      </span>
                      <p className="text-xl text-white font-medium">{selectedScan.type}</p>
                      <p className="text-cyan-400 font-mono text-lg mt-1 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">Conf: {selectedScan.confidence}</p>
                   </div>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Database;
