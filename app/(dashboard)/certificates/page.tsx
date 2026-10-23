"use client";

import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = ["All", "Development", "Data Science", "Design", "Soft Skills", "Event"];

const certificates = [
  { id:"cert-001", title:"Full-Stack Web Development",      issuer:"TechMentor India",  date:"Dec 2024", category:"Development",  xp:200, gradient:"from-violet-500 to-purple-600",  icon:"💻", verified:true  },
  { id:"cert-002", title:"Data Science Fundamentals",       issuer:"DataFirst",         date:"Nov 2024", category:"Data Science", xp:150, gradient:"from-blue-500 to-cyan-600",     icon:"📊", verified:true  },
  { id:"cert-003", title:"Volunteer of the Year – NSS",     issuer:"NSS VIT",           date:"Oct 2024", category:"Event",        xp:100, gradient:"from-emerald-500 to-teal-600",  icon:"🤝", verified:true  },
  { id:"cert-004", title:"Hackathon Participant – SPIT",    issuer:"SPIT Mumbai",       date:"Sep 2024", category:"Event",        xp:80,  gradient:"from-orange-500 to-amber-500",  icon:"💡", verified:false },
  { id:"cert-005", title:"UI/UX Design Fundamentals",       issuer:"Designo Labs",      date:"Aug 2024", category:"Design",       xp:120, gradient:"from-pink-500 to-rose-600",     icon:"🎨", verified:true  },
  { id:"cert-006", title:"Public Speaking Masterclass",     issuer:"Toastmasters",      date:"Jul 2024", category:"Soft Skills",  xp:90,  gradient:"from-yellow-500 to-orange-500", icon:"🎤", verified:true  },
  { id:"cert-007", title:"Python for Machine Learning",     issuer:"IIT Bombay Online", date:"Jun 2024", category:"Data Science", xp:180, gradient:"from-indigo-500 to-blue-600",   icon:"🤖", verified:true  },
  { id:"cert-008", title:"React & Next.js Advanced",        issuer:"TechMentor India",  date:"May 2024", category:"Development",  xp:160, gradient:"from-cyan-500 to-blue-600",    icon:"⚛️", verified:true  },
];

interface UploadedCert { id: string; title: string; issuer: string; date: string; category: string; xp: number; gradient: string; icon: string; verified: boolean; }

export default function CertificatesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [extraCerts, setExtraCerts] = useState<UploadedCert[]>([]);
  const [uploadForm, setUploadForm] = useState({ title: "", issuer: "", date: "", category: "Development" });
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const allCertificates = [...certificates, ...extraCerts];

  const handleUpload = async () => {
    if (!uploadForm.title || !uploadForm.issuer) { alert("Please enter the certificate title and issuer."); return; }
    setUploading(true);
    await new Promise((r) => setTimeout(r, 1200));
    const newCert: UploadedCert = {
      id: `cert-${Date.now()}`,
      title: uploadForm.title,
      issuer: uploadForm.issuer,
      date: uploadForm.date || new Date().toLocaleDateString("en-IN", { month:"short", year:"numeric" }),
      category: uploadForm.category,
      xp: 100,
      gradient: "from-slate-500 to-slate-700",
      icon: "📜",
      verified: false,
    };
    setExtraCerts((prev) => [newCert, ...prev]);
    setUploading(false);
    setUploadSuccess(true);
    setTimeout(() => { setUploadSuccess(false); setShowUpload(false); setUploadForm({ title:"", issuer:"", date:"", category:"Development" }); setFileName(""); }, 2000);
  };

  const filtered = allCertificates.filter((c) => {
    const matchCat = category === "All" || c.category === category;
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.issuer.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalXP = allCertificates.reduce((sum, c) => sum + c.xp, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {uploadSuccess && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg">
          <span>✅</span><span className="font-semibold text-sm">Certificate uploaded!</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">My Certificates</h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-0.5">{allCertificates.length} certificates earned · {totalXP} XP total</p>
        </div>
        <Button variant="gradient" size="sm" onClick={() => setShowUpload(true)}>+ Upload Certificate</Button>
      </div>

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Upload Certificate</h3>
              <button onClick={() => setShowUpload(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
            </div>

            {/* File drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center cursor-pointer hover:border-brand-400 transition-colors"
            >
              <div className="text-3xl mb-2">📄</div>
              <p className="text-sm font-medium text-slate-700">{fileName || "Click to choose file"}</p>
              <p className="text-xs text-slate-400 mt-1">PDF, JPG or PNG · Max 5MB</p>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
              />
            </div>

            <Input label="Certificate title *" placeholder="e.g. React Developer Certification" value={uploadForm.title}
              onChange={(e) => setUploadForm((f) => ({ ...f, title: e.target.value }))} />
            <Input label="Issuing organization *" placeholder="e.g. Coursera, IIT, HackerRank" value={uploadForm.issuer}
              onChange={(e) => setUploadForm((f) => ({ ...f, issuer: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Issue date" type="month" value={uploadForm.date}
                onChange={(e) => setUploadForm((f) => ({ ...f, date: e.target.value }))} />
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Category</label>
                <select value={uploadForm.category} onChange={(e) => setUploadForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
                  {categories.slice(1).map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setShowUpload(false)}>Cancel</Button>
              <Button variant="gradient" className="flex-1" loading={uploading} onClick={handleUpload}>Upload →</Button>
            </div>
          </div>
        </div>
      )}

      {/* XP banner */}
      <div className="rounded-2xl gradient-brand p-5 text-white flex items-center gap-4">
        <div className="text-4xl">🏆</div>
        <div>
          <p className="font-bold text-lg">{totalXP} XP from certificates</p>
          <p className="text-blue-100 text-sm">Keep earning to reach Platinum status!</p>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search certificates…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all ${category === c ? "gradient-brand text-white" : "bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--muted)]"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((cert, i) => (
          <div key={cert.id}
            style={{ animationDelay: `${i * 60}ms` }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-card hover-lift overflow-hidden flex flex-col animate-slide-up">
            <div className={`h-24 bg-gradient-to-br ${cert.gradient} flex items-center justify-center text-4xl relative`}>
              {cert.icon}
              {cert.verified && (
                <span className="absolute top-2 right-2 text-[10px] font-bold bg-white/90 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  ✓ Verified
                </span>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <p className="text-xs text-[var(--primary)] font-semibold mb-1">{cert.category}</p>
              <h3 className="font-bold text-sm text-[var(--foreground)] line-clamp-2 flex-1 mb-2">{cert.title}</h3>
              <p className="text-xs text-[var(--muted-foreground)] mb-1">{cert.issuer}</p>
              <p className="text-xs text-[var(--muted-foreground)] mb-3">{cert.date} · +{cert.xp} XP</p>
              <div className="flex gap-2 mt-auto">
                <button className="flex-1 text-xs font-semibold text-[var(--primary)] border border-[var(--border)] rounded-lg py-1.5 hover:bg-[var(--muted)] transition-colors">
                  View
                </button>
                <button className="flex-1 text-xs font-semibold text-white gradient-brand rounded-lg py-1.5 hover:opacity-90 transition-opacity">
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
