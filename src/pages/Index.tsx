import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import logo from "@/assets/logo.png";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { TEMPLATE_ROWS, QUARTERS, emptySar, type SarData, type Page2Entry } from "@/lib/sarTemplate";
import { getOrCreateDraftKey, loadDraft, saveDraft, uploadProof } from "@/lib/draftStorage";
import { generateSarPdf, downloadPdf } from "@/lib/sarPdf";
import { Trash2, Plus, Upload, FileDown, Save } from "lucide-react";

const STEPS = ["Basics", "Course Table (16)", "Class Entries", "Proofs", "Review"] as const;

const Index = () => {
  const [draftKey] = useState(getOrCreateDraftKey);
  const [step, setStep] = useState(0);
  const [sar, setSar] = useState<SarData>(emptySar());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    document.title = "SAR Generator – Quarterly Self Assessment Report";
    (async () => {
      const existing = await loadDraft(draftKey);
      if (existing && (existing.name || existing.regNo || existing.quarter)) {
        setSar(existing);
        toast.success("Draft loaded");
      }
      setLoading(false);
    })();
  }, [draftKey]);

  const update = <K extends keyof SarData>(k: K, v: SarData[K]) => setSar((s) => ({ ...s, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveDraft(draftKey, sar);
      toast.success("Draft saved");
    } catch (e) {
      toast.error("Save failed");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
  setGenerating(true);

  try {
    // 🔍 DEBUG: check data before saving
    console.log("Before Save:", sar);

    await saveDraft(draftKey, sar);

    // 🔍 DEBUG: confirm after save
    console.log("After Save:", sar);

    // 🔍 VERY IMPORTANT: check role & signature
    console.log("ROLE:", sar.role);
    console.log("SIGNATURE:", sar.signatureUrl);

    const bytes = await generateSarPdf(sar);

    downloadPdf(
      bytes,
      `SAR-${sar.name || "report"}-${sar.quarter || "Q"}.pdf`
    );

    toast.success("PDF downloaded");

  } catch (e) {
    console.error("PDF ERROR:", e);
    toast.error("PDF generation failed");
  } finally {
    setGenerating(false);
  }
};

  const handleUpload = async (files: FileList | null) => {
    if (!files) return;
    toast.info(`Uploading ${files.length} file(s)…`);
    const urls: string[] = [];
    for (const f of Array.from(files)) {
      try {
        const url = await uploadProof(f);
        urls.push(url);
      } catch (e) {
        console.error(e);
        toast.error(`Failed: ${f.name}`);
      }
    }
    update("proofUrls", [...sar.proofUrls, ...urls]);
    toast.success(`${urls.length} uploaded`);
  };

  const updateEntry = (i: number, k: keyof Page2Entry, v: string) => {
    const ne = [...sar.entries];
    ne[i] = { ...ne[i], [k]: v };
    update("entries", ne);
  };

  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
  <div className="container py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    
    {/* LEFT SIDE (LOGO + TEXT) */}
    <div className="flex items-center gap-3">
      
      {/* LOGO */}
      <img
        src={logo}
        alt="logo"
        className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
      />

      {/* TEXT */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          SAR Generator
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Quarterly Self Assessment Report — pixel-matched to FORM-3-(2024)
        </p>
      </div>
    </div>

    {/* RIGHT SIDE BUTTONS */}
    <div className="flex gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSave}
        disabled={saving}
        className="flex-1 sm:flex-none"
      >
        <Save className="w-4 h-4 mr-1" />
        {saving ? "Saving…" : "Save draft"}
      </Button>

      <Button
        size="sm"
        onClick={handleGenerate}
        disabled={generating}
        className="flex-1 sm:flex-none"
      >
        <FileDown className="w-4 h-4 mr-1" />
        {generating ? "Generating…" : "Download PDF"}
      </Button>
    </div>
  </div>
</header>
      <div className="container py-4 sm:py-6 px-3 sm:px-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                step === i ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-accent"
              }`}
            >
              {i + 1}. {s}
            </button>
          ))}
        </div>

        {step === 0 && (
          <Card className="p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input value={sar.name} onChange={(e) => update("name", e.target.value)} />
              </div>
              <div>
                <Label>Mobile No</Label>
                <Input value={sar.mobile} onChange={(e) => update("mobile", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Reg. No (up to 7 characters)</Label>
              <Input
                value={sar.regNo}
                maxLength={7}
                onChange={(e) => update("regNo", e.target.value.toUpperCase())}
                className="font-mono tracking-widest uppercase"
              />
            </div>
            <div>
              <Label className="mb-2 block">Quarter</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {QUARTERS.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => update("quarter", q.id)}
                    className={`p-3 rounded border text-left transition ${
                      sar.quarter === q.id ? "border-primary bg-primary/10" : "hover:bg-accent"
                    }`}
                  >
                    <div className="font-semibold">{q.label}</div>
                    <div className="text-xs text-muted-foreground">{q.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}

        {step === 1 && (
          <Card className="p-2 sm:p-4 overflow-x-auto">
            <p className="text-sm text-muted-foreground mb-3 px-2">
              Edit the "Details of subjects taken" column for each of the 16 fixed rows. Course names, time and points are template-fixed.
            </p>
            <table className="w-full min-w-[640px] text-sm border-collapse">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-2 w-10">S.No</th>
                  <th className="border p-2 text-left">Course Name</th>
                  <th className="border p-2 w-20">Time</th>
                  <th className="border p-2 w-16">Points</th>
                  <th className="border p-2 text-left">Details (editable)</th>
                </tr>
              </thead>
              <tbody>
                {TEMPLATE_ROWS.map((r, i) => (
                  <tr key={r.sno}>
                    <td className="border p-2 text-center">{r.sno}</td>
                    <td className="border p-2">{r.course}</td>
                    <td className="border p-2 text-center">{r.time}</td>
                    <td className="border p-2 text-center">{r.points}</td>
                    <td className="border p-1">
                      <Textarea
                        rows={2}
                        value={sar.courses[i] ?? ""}
                        onChange={(e) => {
                          const nc = [...sar.courses];
                          nc[i] = e.target.value;
                          update("courses", nc);
                        }}
                        className="min-h-[50px] text-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Page-2 class entries (Date / Trust / Place / Participants / Duration / Course details)</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  update("entries", [...sar.entries, { date: "", trust: "", place: "", participants: "", duration: "", courseDetails: "" }])
                }
              >
                <Plus className="w-4 h-4 mr-1" /> Add row
              </Button>
            </div>
            {sar.entries.map((e, i) => (
              <div key={i} className="border rounded p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-sm">Entry #{i + 1}</div>
                  {sar.entries.length > 1 && (
                    <Button size="sm" variant="ghost" onClick={() => update("entries", sar.entries.filter((_, j) => j !== i))}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input placeholder="Date" value={e.date} onChange={(ev) => updateEntry(i, "date", ev.target.value)} />
                  <Input placeholder="Trust/Centre/Institution" value={e.trust} onChange={(ev) => updateEntry(i, "trust", ev.target.value)} />
                  <Input placeholder="Place" value={e.place} onChange={(ev) => updateEntry(i, "place", ev.target.value)} />
                  <Input placeholder="No. of Participants" value={e.participants} onChange={(ev) => updateEntry(i, "participants", ev.target.value)} />
                  <Input placeholder="Duration (From-to)" value={e.duration} onChange={(ev) => updateEntry(i, "duration", ev.target.value)} />
                  <Input placeholder="Course Details" value={e.courseDetails} onChange={(ev) => updateEntry(i, "courseDetails", ev.target.value)} />
                </div>
              </div>
            ))}
            <div className="grid sm:grid-cols-2 gap-3 pt-3 border-t">
              <div>
                <Label>Place</Label>
                <Input value={sar.place} onChange={(ev) => update("place", ev.target.value)} />
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={sar.dateSigned} onChange={(ev) => update("dateSigned", ev.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                 onClick={() => update("role", "ASST")}
                 className={sar.role === "ASST" ? "bg-primary text-white" : ""}>
                 Asst. Professor
                </Button>
                <Button
                 onClick={() => update("role", "PROF")}
                 className={sar.role === "PROF" ? "bg-primary text-white" : ""}>
                  Professor
                </Button>
              </div>
              </div>
              <Label>Upload Signature</Label>
              <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                
                const url = await uploadProof(file);
                update("signatureUrl", url);
                toast.success("Signature uploaded");}}/>
            
          </Card>
        )}

        {step === 3 && (
          <Card className="p-6 space-y-4">
            <div>
              <Label className="block mb-2">Upload proof images (JPG/PNG)</Label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer hover:bg-accent">
                <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click to select multiple images</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
              </label>
            </div>
            {sar.proofUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {sar.proofUrls.map((u, i) => (
                  <div key={u} className="relative group border rounded overflow-hidden">
                    <img src={u} alt={`proof ${i + 1}`} className="w-full h-32 object-cover" />
                    <button
                      onClick={() => update("proofUrls", sar.proofUrls.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {step === 4 && (
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold">Review & Generate</h2>
            <dl className="grid sm:grid-cols-2 gap-3 text-sm">
              <div><dt className="text-muted-foreground">Name</dt><dd className="font-medium">{sar.name || "—"}</dd></div>
              <div><dt className="text-muted-foreground">Mobile</dt><dd className="font-medium">{sar.mobile || "—"}</dd></div>
              <div><dt className="text-muted-foreground">Reg No</dt><dd className="font-medium font-mono">{sar.regNo || "—"}</dd></div>
              <div><dt className="text-muted-foreground">Quarter</dt><dd className="font-medium">{sar.quarter || "—"}</dd></div>
              <div><dt className="text-muted-foreground">Page-2 entries</dt><dd className="font-medium">{sar.entries.length}</dd></div>
              <div><dt className="text-muted-foreground">Role</dt><dd className="font-medium">{sar.role || "—"}</dd></div>
              <div><dt className="text-muted-foreground">Signature</dt>
              <dd>
                {sar.signatureUrl ? (
                  <img src={sar.signatureUrl} className="h-12 mt-1 border" />
                ) : (
                  "—"
                  )}
                  </dd>
                  </div>
              <div><dt className="text-muted-foreground">Proof images</dt><dd className="font-medium">{sar.proofUrls.length}</dd></div>
            </dl>
            <Button size="lg" onClick={handleGenerate} disabled={generating} className="w-full">
              <FileDown className="w-4 h-4 mr-2" />
              {generating ? "Generating PDF…" : "Generate & Download SAR PDF"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Your draft is auto-saved. Use the same browser to edit later. Draft key:{" "}
              <code className="font-mono">{draftKey.slice(0, 8)}…</code>
            </p>
          </Card>
        )}

        <div className="flex justify-between mt-6">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
            ← Back
          </Button>
          <Button disabled={step === STEPS.length - 1} onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}>
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
