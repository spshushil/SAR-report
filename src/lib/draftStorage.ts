import { supabase } from "@/integrations/supabase/client";
import type { SarData } from "./sarTemplate";

const KEY = "sar_draft_key";

export const getOrCreateDraftKey = () => {
  let k = localStorage.getItem(KEY);
  if (!k) {
    k = crypto.randomUUID();
    localStorage.setItem(KEY, k);
  }
  return k;
};

export const resetDraftKey = () => {
  const k = crypto.randomUUID();
  localStorage.setItem(KEY, k);
  return k;
};

export const loadDraft = async (draftKey: string): Promise<SarData | null> => {
  const { data, error } = await supabase
    .from("sar_drafts")
    .select("*")
    .eq("draft_key", draftKey)
    .maybeSingle();
  if (error || !data) return null;
  return {
    name: data.name ?? "",
    mobile: data.mobile ?? "",
    regNo: data.reg_no ?? "",
    quarter: data.quarter ?? "",
    courses: (data.courses as string[]) ?? [],
    entries: (data.entries as SarData["entries"]) ?? [],
    place: data.place ?? "",
    dateSigned: data.date_signed ?? "",
    proofUrls: (data.proof_urls as string[]) ?? [],
    role: (data as any).role ?? "",
    signatureUrl: (data as any).signature_url ?? "",
  };
};

export const saveDraft = async (draftKey: string, sar: SarData) => {
  const payload = {
    draft_key: draftKey,
    name: sar.name,
    mobile: sar.mobile,
    reg_no: sar.regNo,
    quarter: sar.quarter,
    courses: sar.courses,
    entries: sar.entries,
    place: sar.place,
    date_signed: sar.dateSigned,
    proof_urls: sar.proofUrls,
    role: sar.role,
    signature_url: sar.signatureUrl,
  };
  const { error } = await supabase.from("sar_drafts").upsert(payload as any, { onConflict: "draft_key" });
  if (error) throw error;
};

export const uploadProof = async (file: File): Promise<string> => {
  const path = `${crypto.randomUUID()}-${file.name}`;
  const { error } = await supabase.storage.from("sar-proofs").upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("sar-proofs").getPublicUrl(path);
  return data.publicUrl;
};
