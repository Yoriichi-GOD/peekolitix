import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

export const exportToPDF = async (reportContent, metadata) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let cursorY = 20;
  const marginX = 20;
  const maxLineHeight = pageHeight - 30; // Leave room for footer

  const addHeader = (pageNum) => {
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text("STRATEGIC INTELLIGENCE BRIEFING", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(9);
    doc.setFont("times", "italic");
    doc.text("CLASSIFICATION: CONFIDENTIAL / INTERNAL USE ONLY", pageWidth / 2, 26, { align: "center" });
    
    doc.setLineWidth(0.2);
    doc.line(marginX, 32, pageWidth - marginX, 32);
    return 40; // New cursorY
  };

  // --- 1. INITIAL HEADER ---
  cursorY = addHeader(1);
  
  // --- 2. METADATA SECTION ---
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.text(`TOPIC: ${metadata.topic.toUpperCase()}`, marginX, cursorY);
  doc.text(`DATE: ${new Date().toLocaleDateString()}`, pageWidth - marginX, cursorY, { align: "right" });
  
  cursorY += 6;
  doc.text(`MODE: ${metadata.mode}`, marginX, cursorY);
  doc.text(`PERSPECTIVE: ${metadata.perspective}`, pageWidth - marginX, cursorY, { align: "right" });

  cursorY += 8;
  doc.line(marginX, cursorY, pageWidth - marginX, cursorY);

  // --- 3. REPORT BODY WITH ADVANCED CLEANING ---
  cursorY += 12;
  doc.setFont("times", "normal");
  doc.setFontSize(11);

  // Clean the markdown content with double-pass sanitization
  const cleanContent = reportContent
    .replace(/```json[\s\S]*?```/gi, "") // Case-insensitive JSON block removal
    .replace(/JSON BLOCK:?/gi, "")       // Specifically target the title
    .replace(/\{[\s\S]*?"dominanceScore"[\s\S]*?\}/gi, "") // Catch-all for raw JSON objects
    .replace(/#/g, "")                   // Remove markdown headers
    .replace(/\*\*/g, "")                // Remove bold
    .trim();

  const lines = doc.splitTextToSize(cleanContent, pageWidth - (marginX * 2));
  
  lines.forEach((line) => {
    // Skip empty lines or purely whitespace lines if they repeat too much
    if (line.trim().length === 0 && cursorY === 40) return;

    if (cursorY > maxLineHeight) {
      doc.addPage();
      cursorY = addHeader();
      doc.setFont("times", "normal");
      doc.setFontSize(11);
    }
    doc.text(line, marginX, cursorY);
    cursorY += 7; // Line height
  });

  // --- 4. FOOTER NUMBERING ---
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("times", "italic");
    doc.text(`Intelligence Briefing | Peekolitix Strategic Unit | Page ${i} of ${pageCount}`, pageWidth / 2, 288, { align: "center" });
  }

  // --- 5. CHROME-PROOF DOWNLOAD via native jsPDF save ---
  const filename = `Intelligence_Report_${metadata.topic.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')}.pdf`;
  
  if (Capacitor.isNativePlatform()) {
    try {
      // For Mobile: Convert to Base64 and use Filesystem/Share
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      
      const savedFile = await Filesystem.writeFile({
        path: filename,
        data: pdfBase64,
        directory: Directory.Cache
      });

      await Share.share({
        title: 'Intelligence Briefing',
        text: 'Sharing your strategic intelligence report.',
        url: savedFile.uri,
        dialogTitle: 'Share PDF'
      });
    } catch (err) {
      console.error("Native PDF Export Failed:", err);
      alert("Failed to export PDF: " + err.message);
    }
  } else {
    // For Web: Use standard doc.save()
    doc.save(filename);
  }
};


