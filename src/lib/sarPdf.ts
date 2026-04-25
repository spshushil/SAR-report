import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "pdf-lib";
import logoUrl from "@/assets/sky-yoga-logo.png";
import founderUrl from "@/assets/founder.jpg";
import { TEMPLATE_ROWS, type SarData } from "./sarTemplate";

const A4_W = 595.28;
const A4_H = 841.89;
const MARGIN_X = 36;
const BLACK = rgb(0, 0, 0);

async function fetchBytes(url: string) {
  const r = await fetch(url);
  return new Uint8Array(await r.arrayBuffer());
}

// Wrap text into lines that fit width
function wrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
  if (!text) return [""];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const trial = cur ? cur + " " + w : w;
    if (font.widthOfTextAtSize(trial, size) <= maxW) cur = trial;
    else {
      if (cur) lines.push(cur);
      // hard-break overlong word
      if (font.widthOfTextAtSize(w, size) > maxW) {
        let chunk = "";
        for (const ch of w) {
          if (font.widthOfTextAtSize(chunk + ch, size) <= maxW) chunk += ch;
          else { lines.push(chunk); chunk = ch; }
        }
        cur = chunk;
      } else cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawCell(
  page: PDFPage,
  text: string,
  x: number, y: number, w: number, h: number,
  font: PDFFont, size: number,
  opts: { align?: "left" | "center"; vAlign?: "top" | "middle"; padding?: number } = {}
) {
  const pad = opts.padding ?? 3;
  const lines = wrap(text, font, size, w - pad * 2);
  const lineH = size * 1.15;
  const totalH = lines.length * lineH;
  let startY: number;
  if (opts.vAlign === "middle") startY = y + h - (h - totalH) / 2 - size;
  else startY = y + h - pad - size;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const tw = font.widthOfTextAtSize(line, size);
    const tx = opts.align === "center" ? x + (w - tw) / 2 : x + pad;
    page.drawText(line, { x: tx, y: startY - i * lineH, size, font, color: BLACK });
  }
}

function drawRect(page: PDFPage, x: number, y: number, w: number, h: number) {
  page.drawRectangle({ x, y, width: w, height: h, borderColor: BLACK, borderWidth: 0.75 });
}

function drawHLine(page: PDFPage, x1: number, x2: number, y: number, thickness = 0.75) {
  page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, color: BLACK, thickness });
}

export async function generateSarPdf(sar: SarData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const tnr = await pdf.embedFont(StandardFonts.TimesRoman);
  const tnrB = await pdf.embedFont(StandardFonts.TimesRomanBold);

  const logoImg = await pdf.embedPng(await fetchBytes(logoUrl));
  const founderImg = await pdf.embedJpg(await fetchBytes(founderUrl));

  // ============== PAGE 1 ==============
  const p1 = pdf.addPage([A4_W, A4_H]);
  let y = A4_H - 40;

  // Logo top-left, founder top-right
  const logoH = 60;
  const logoW = (logoImg.width / logoImg.height) * logoH;
  p1.drawImage(logoImg, { x: MARGIN_X, y: y - logoH + 10, width: logoW, height: logoH });
  const founderH = 60;
  const founderW = (founderImg.width / founderImg.height) * founderH;
  p1.drawImage(founderImg, { x: A4_W - MARGIN_X - founderW, y: y - founderH + 10, width: founderW, height: founderH });

  // Header text (centered)
  const center = (txt: string, yy: number, font: PDFFont, size: number) => {
    const tw = font.widthOfTextAtSize(txt, size);
    p1.drawText(txt, { x: (A4_W - tw) / 2, y: yy, size, font, color: BLACK });
  };
  center("FORM-3-(2024)", y - 5, tnrB, 11);
  center("DIRECTORATE OF SMART- WCSC", y - 22, tnrB, 16);
  center("2/428,Vethathiri Nagar, Collectorate (po),Dindigul-624004.TamilNadu,India", y - 38, tnrB, 11);
  // email line with underlined email
  const cellLine = "Cell: 94427 35656, 94889 47444 E-mail : ";
  const email = "wcsc.smart@gmail.com";
  const cellLineW = tnrB.widthOfTextAtSize(cellLine, 11);
  const emailW = tnrB.widthOfTextAtSize(email, 11);
  const totalW = cellLineW + emailW;
  const sx = (A4_W - totalW) / 2;
  p1.drawText(cellLine, { x: sx, y: y - 54, size: 11, font: tnrB, color: BLACK });
  p1.drawText(email, { x: sx + cellLineW, y: y - 54, size: 11, font: tnrB, color: rgb(0, 0, 0.7) });
  drawHLine(p1, sx + cellLineW, sx + cellLineW + emailW, y - 56, 0.5);

  y -= 70;
  // Title with horizontal lines above & below
  drawHLine(p1, MARGIN_X, A4_W - MARGIN_X, y + 4, 0.6);
  center("ASSISTANT PROFESSOR  / PROFESSOR SELF ASSESSMENT REPORT", y - 10, tnrB, 14);
  drawHLine(p1, MARGIN_X, A4_W - MARGIN_X, y - 18, 0.6);

  // Quarter row
  y -= 40;
  const qW = (A4_W - MARGIN_X * 2) / 4;
  ["I Quarter", "II Quarter", "III Quarter", "IV Quarter"].forEach((label, i) => {
    const x = MARGIN_X + qW * i;
    const tw = tnrB.widthOfTextAtSize(label, 13);
    p1.drawText(label, { x: x + (qW - tw) / 2 - 15, y, size: 13, font: tnrB, color: BLACK });
    drawHLine(p1, x + (qW - tw) / 2 - 15, x + (qW - tw) / 2 - 15 + tw, y - 1, 0.4);
  });
  y -= 15;
  ["Apr-June", "July-Sept", "Oct - Dec", "Jan-Mar"].forEach((sub, i) => {
    const x = MARGIN_X + qW * i;
    const tw = tnrB.widthOfTextAtSize(sub, 12);
    p1.drawText(sub, { x: x + (qW - tw) / 2 - 25, y, size: 12, font: tnrB, color: BLACK });
    // checkbox to right of label
    const boxX = x + (qW - tw) / 2 - 25 + tw + 6;
    drawRect(p1, boxX, y - 3, 16, 16);
    if (sar.quarter === ["I", "II", "III", "IV"][i]) {

  // left line
  p1.drawLine({
    start: { x: boxX + 3, y: y + 3 },
    end: { x: boxX + 7, y: y - 1 },
    thickness: 1.5,
    color: BLACK,
  });

  // right line
  p1.drawLine({
    start: { x: boxX + 7, y: y - 1 },
    end: { x: boxX + 13, y: y + 6 },
    thickness: 1.5,
    color: BLACK,
  });
}
  });

  y -= 12;
  drawHLine(p1, MARGIN_X, A4_W - MARGIN_X, y, 0.6);

  // NAME / MOBILE
  y -= 25;
  p1.drawText("1.NAME:", { x: MARGIN_X, y, size: 13, font: tnrB, color: BLACK });
  const nameStart = MARGIN_X + 55;
  const nameEnd = MARGIN_X + 260;
  drawHLine(p1, nameStart, nameEnd, y - 2, 0.5);
  p1.drawText(sar.name, { x: nameStart + 4, y, size: 12, font: tnr, color: BLACK });

  p1.drawText("MOBILE NO:", { x: nameEnd + 15, y, size: 13, font: tnrB, color: BLACK });
  const mobStart = nameEnd + 95;
  const mobEnd = A4_W - MARGIN_X;
  drawHLine(p1, mobStart, mobEnd, y - 2, 0.5);
  p1.drawText(sar.mobile, { x: mobStart + 4, y, size: 12, font: tnr, color: BLACK });

  // REG NO boxes
  y -= 30;
  p1.drawText("2. REG.NO", { x: MARGIN_X, y, size: 13, font: tnrB, color: BLACK });
  const boxSize = 22;
  const boxStart = MARGIN_X + 90;
  for (let i = 0; i < 7; i++) {
    drawRect(p1, boxStart + i * boxSize, y - 5, boxSize, boxSize);
    const ch = sar.regNo[i] ?? "";
    if (ch) {
      const tw = tnrB.widthOfTextAtSize(ch, 13);
      p1.drawText(ch, { x: boxStart + i * boxSize + (boxSize - tw) / 2, y: y, size: 13, font: tnrB, color: BLACK });
    }
  }

  // Section title
  y -= 30;
  center("Details of course conducted by the Applicant", y, tnrB, 14);

  // ============== TABLE ==============
  y -= 18;
  const tableX = MARGIN_X;
  const tableW = A4_W - MARGIN_X * 2;
  const colW = [40, 170, 60, 45, tableW - 40 - 170 - 60 - 45]; // 5 columns
  const headers = ["S.No", "Course Name", "Time", "Points", "Details of subjects taken  as per SMART Master Guide (few example)"];
  const headerH = 40;

  // header row
  let cx = tableX;
  for (let i = 0; i < 5; i++) {
    drawRect(p1, cx, y - headerH, colW[i], headerH);
    drawCell(p1, headers[i], cx, y - headerH, colW[i], headerH, tnrB, 11, { align: "center", vAlign: "middle" });
    cx += colW[i];
  }
  y -= headerH;

  // 16 rows
  for (let i = 0; i < 16; i++) {
    const r = TEMPLATE_ROWS[i];
    const detail = sar.courses[i] || "";
    // measure required height based on tallest cell
    const padding = 3;
    const courseLines = wrap(r.course, tnrB, 10, colW[1] - padding * 2).length;
    const detailLines = wrap(detail, tnr, 10, colW[4] - padding * 2).length;
    const lines = Math.max(courseLines, detailLines, 2);
    const rowH = Math.max(28, lines * 12 + 8);

    cx = tableX;
    drawRect(p1, cx, y - rowH, colW[0], rowH);
    drawCell(p1, String(r.sno), cx, y - rowH, colW[0], rowH, tnr, 11, { align: "center", vAlign: "middle" });
    cx += colW[0];

    drawRect(p1, cx, y - rowH, colW[1], rowH);
    drawCell(p1, r.course, cx, y - rowH, colW[1], rowH, tnrB, 10, { vAlign: "middle" });
    cx += colW[1];

    drawRect(p1, cx, y - rowH, colW[2], rowH);
    drawCell(p1, r.time, cx, y - rowH, colW[2], rowH, tnrB, 10, { align: "center", vAlign: "middle" });
    cx += colW[2];

    drawRect(p1, cx, y - rowH, colW[3], rowH);
    drawCell(p1, r.points, cx, y - rowH, colW[3], rowH, tnrB, 10, { align: "center", vAlign: "middle" });
    cx += colW[3];

    drawRect(p1, cx, y - rowH, colW[4], rowH);
    drawCell(p1, detail, cx, y - rowH, colW[4], rowH, tnrB, 10, { vAlign: "middle" });

    y -= rowH;
  }

  // ============== PAGE 2 ==============
  const p2 = pdf.addPage([A4_W, A4_H]);
  let y2 = A4_H - 40;

  // Page 2 table
  const p2cols = [55, 105, 60, 60, 75, 145, 55]; // sums to 555 -> within 523 width? adjust
  const p2TableW = A4_W - MARGIN_X * 2;
  const sumCols = p2cols.reduce((a, b) => a + b, 0);
  const scale = p2TableW / sumCols;
  const cw = p2cols.map((c) => c * scale);
  const p2Headers = [
    "Date",
    "Nameof the Trust/Centre/ Institution",
    "Place",
    "Number of Participants",
    "Duration of classes (From-to)",
    "Course Details: Intropection/KayaKalpam/PDC/Special Disclourse/Vision Course/Aliyar Course etc…",
    "Points use of SMART Office only",
  ];
  const headerH2 = 60;
  let x2 = MARGIN_X;
  for (let i = 0; i < 7; i++) {
    drawRect(p2, x2, y2 - headerH2, cw[i], headerH2);
    drawCell(p2, p2Headers[i], x2, y2 - headerH2, cw[i], headerH2, tnrB, 10, { align: "center", vAlign: "middle" });
    x2 += cw[i];
  }
  y2 -= headerH2;

  // Entry rows (at least 1, expand if more)
  const entries = sar.entries.length ? sar.entries : [{ date: "", trust: "", place: "", participants: "", duration: "", courseDetails: "" }];
  // Compute total available height for entries (leave room for declaration/notes ~ 230pt)
  const reservedBottom = 250;
  const availableH = y2 - reservedBottom;
  const minRowH = 40;
  // measure each
  const rowHeights = entries.map((e) => {
    const padding = 3;
    const lines = Math.max(
      wrap(e.trust, tnr, 10, cw[1] - padding * 2).length,
      wrap(e.courseDetails, tnr, 10, cw[5] - padding * 2).length,
      wrap(e.duration, tnr, 10, cw[4] - padding * 2).length,
      2
    );
    return Math.max(minRowH, lines * 12 + 8);
  });
  const totalEntriesH = rowHeights.reduce((a, b) => a + b, 0);
  // If entries don't fill, add an empty filler row
  if (totalEntriesH < availableH) {
    rowHeights.push(availableH - totalEntriesH);
    entries.push({ date: "", trust: "", place: "", participants: "", duration: "", courseDetails: "" });
  }

  for (let r = 0; r < entries.length; r++) {
    const e = entries[r];
    const rowH = rowHeights[r];
    const cells = [e.date, e.trust, e.place, e.participants, e.duration, e.courseDetails, ""];
    let xx = MARGIN_X;
    for (let i = 0; i < 7; i++) {
      drawRect(p2, xx, y2 - rowH, cw[i], rowH);
      drawCell(p2, cells[i], xx, y2 - rowH, cw[i], rowH, tnr, 10, { vAlign: "top" });
      xx += cw[i];
    }
    y2 -= rowH;
  }

  // Declaration
  y2 -= 25;
  p2.drawText("The above particulars are true to the best of my knowledge and belief.", {
    x: MARGIN_X, y: y2, size: 12, font: tnrB, color: BLACK,
  });

  y2 -= 25;
  p2.drawText(`Place: ${sar.place}`, { x: MARGIN_X, y: y2, size: 12, font: tnrB, color: BLACK });
  const sigText = "Signature";
  const sigX = A4_W - MARGIN_X - 120;
  const sigY = y2 + 8; // align with Place text

  const signatureUrl = sar.signatureUrl;

// Label
p2.drawText("Signature", {
  x: sigX,
  y: sigY,
  size: 12,
  font: tnrB,
  color: BLACK,
});

// Line
const lineY = sigY - 15;
drawHLine(p2, sigX, sigX + 100, lineY, 0.5);

// 👇 IMAGE CENTER ALIGN + MOVE UP
if (sar.signatureUrl) {
  try {
    const sigBytes = await fetchBytes(sar.signatureUrl);

    let sigImg;
    if (sar.signatureUrl.toLowerCase().includes("png")) {
      sigImg = await pdf.embedPng(sigBytes);
    } else {
      sigImg = await pdf.embedJpg(sigBytes);
    }

    const imgWidth = 80;
    const imgHeight = 30;

    // ✅ center horizontally inside line
    const imgX = sigX + (100 - imgWidth) / 2;

    // ✅ center vertically on line + move slightly up
    const imgY = lineY - imgHeight / 2 + 8; // 👈 adjust here

    p2.drawImage(sigImg, {
      x: imgX,
      y: imgY,
      width: imgWidth,
      height: imgHeight,
    });

  } catch (e) {
    console.error("Signature load failed");
  }
}
  y2 -= 22;
  p2.drawText(`Date: ${sar.dateSigned}`, { x: MARGIN_X, y: y2, size: 12, font: tnrB, color: BLACK });
  const roleY = y2;

// Labels
p2.drawText("Asst. Professor", {
  x: A4_W - MARGIN_X - 220,
  y: roleY,
  size: 12,
  font: tnrB,
  color: BLACK,
});

p2.drawText("Professor", {
  x: A4_W - MARGIN_X - 100,
  y: roleY,
  size: 12,
  font: tnrB,
  color: BLACK,
});

// Boxes
const asstBoxX = A4_W - MARGIN_X - 240;
const profBoxX = A4_W - MARGIN_X - 120;

drawRect(p2, asstBoxX, roleY - 4, 14, 14);
drawRect(p2, profBoxX, roleY - 4, 14, 14);

// Tick logic
if (sar.role === "ASST") {
  // tick draw (line style)
  p2.drawLine({
    start: { x: asstBoxX + 3, y: roleY + 2 },
    end: { x: asstBoxX + 6, y: roleY - 2 },
    thickness: 1.5,
    color: BLACK,
  });
  p2.drawLine({
    start: { x: asstBoxX + 6, y: roleY - 2 },
    end: { x: asstBoxX + 11, y: roleY + 6 },
    thickness: 1.5,
    color: BLACK,
  });
}

if (sar.role === "PROF") {
  p2.drawLine({
    start: { x: profBoxX + 3, y: roleY + 2 },
    end: { x: profBoxX + 6, y: roleY - 2 },
    thickness: 1.5,
    color: BLACK,
  });
  p2.drawLine({
    start: { x: profBoxX + 6, y: roleY - 2 },
    end: { x: profBoxX + 11, y: roleY + 6 },
    thickness: 1.5,
    color: BLACK,
  });
}
  // Note
  y2 -= 28;
  p2.drawText("Note", { x: MARGIN_X, y: y2, size: 13, font: tnrB, color: BLACK });
  drawHLine(p2, MARGIN_X, MARGIN_X + tnrB.widthOfTextAtSize("Note", 13), y2 - 2, 0.5);

  const notes = [
    "1. Specify the subjects in detail, taken in FC, YYE, YHE, Introspection in all session. Classes should be conducted based on the SMART Masters Guide only.",
    "2. Points will not be given to the SAR which is not eligible and proof attached.",
    "3. Photo copy of Attendance should be enclosed along with SAR, wherever necessary.",
    "4. If you have any doubt in the instructions, please contact SMART Co – coordinator in office hours. Cell: 9442735656, 9488947444.",
  ];
  y2 -= 16;
  for (const note of notes) {
    const lines = wrap(note, tnrB, 11, A4_W - MARGIN_X * 2);
    for (const l of lines) {
      p2.drawText(l, { x: MARGIN_X, y: y2, size: 11, font: tnrB, color: BLACK });
      y2 -= 14;
    }
    y2 -= 2;
  }

  // ============== PROOF PAGES ==============
  for (const url of sar.proofUrls) {
    try {
      const bytes = await fetchBytes(url);
      let img;
      const head = url.toLowerCase();
      if (head.includes(".png")) img = await pdf.embedPng(bytes);
      else img = await pdf.embedJpg(bytes);

      const page = pdf.addPage([A4_W, A4_H]);
      const titleH = 30;
      page.drawText("Proof Attachment", { x: MARGIN_X, y: A4_H - 30, size: 14, font: tnrB, color: BLACK });
      const availW = A4_W - MARGIN_X * 2;
      const availHimg = A4_H - MARGIN_X * 2 - titleH;
      const ratio = Math.min(availW / img.width, availHimg / img.height);
      const w = img.width * ratio;
      const h = img.height * ratio;
      page.drawImage(img, {
        x: (A4_W - w) / 2,
        y: (A4_H - h - titleH) / 2,
        width: w, height: h,
      });
    } catch (e) {
      console.error("Failed to embed proof", url, e);
    }
  }

  return await pdf.save();
}

export function downloadPdf(bytes: Uint8Array, filename = "SAR.pdf") {
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
