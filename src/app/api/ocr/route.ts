import { NextResponse } from "next/server";
import Tesseract from "tesseract.js";

// Disable Next.js body parser so we can read raw FormData
export const config = { api: { bodyParser: false } };

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const mimeType = file.type;
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp", "application/pdf"];
    if (!allowed.includes(mimeType)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${mimeType}. Use JPG, PNG, or PDF.` },
        { status: 415 }
      );
    }

    // Convert File → Buffer for Tesseract
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`[api/ocr] Running OCR on ${file.name} (${(buffer.byteLength / 1024).toFixed(1)} KB)`);

    const { data } = await Tesseract.recognize(buffer, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`[api/ocr] Progress: ${(m.progress * 100).toFixed(0)}%`);
        }
      },
    });

    const rawText = data.text?.trim() ?? "";
    console.log("[api/ocr] Extracted text:", rawText.slice(0, 200));

    if (!rawText || rawText.length < 5) {
      return NextResponse.json(
        { error: "Could not extract text — ensure the image is clear and not blurry." },
        { status: 422 }
      );
    }

    // Parse key fields from extracted text using heuristics
    const parsed = parseReceiptText(rawText);

    return NextResponse.json({ rawText, parsed });
  } catch (err) {
    console.error("[api/ocr] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "OCR failed" },
      { status: 500 }
    );
  }
}

// ─── Heuristic Receipt Parser ──────────────────────────────────────────────────
interface ParsedReceipt {
  merchant?: string;
  amount?: string;
  date?: string;
  category?: string;
}

function parseReceiptText(text: string): ParsedReceipt {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const parsed: ParsedReceipt = {};

  // ── Amount: look for patterns like $42.50, USD 42.50, Total 42.50, etc.
  const amountPatterns = [
    /(?:total|grand\s*total|amount\s*due|subtotal|bill)[:\s]*[\$£€]?\s*(\d+[\.,]\d{2})/i,
    /[\$£€]\s*(\d+[\.,]\d{2})/,
    /(\d+[\.,]\d{2})\s*(?:USD|INR|EUR|GBP)/i,
    /(\d+[\.,]\d{2})/,
  ];
  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      parsed.amount = `$${parseFloat(match[1].replace(",", ".")).toFixed(2)}`;
      break;
    }
  }

  // ── Date: various date formats
  const datePatterns = [
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
    /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})/i,
    /(\d{4}[\/\-]\d{2}[\/\-]\d{2})/,
  ];
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      parsed.date = match[1];
      break;
    }
  }

  // ── Merchant: typically the first non-empty line with 3+ chars
  for (const line of lines.slice(0, 5)) {
    if (line.length >= 3 && !/^\d/.test(line) && !line.match(/receipt|invoice|bill|thank/i)) {
      parsed.merchant = line.replace(/[^a-zA-Z0-9\s&\-']/g, "").trim();
      if (parsed.merchant.length >= 2) break;
    }
  }

  // ── Category: keyword matching
  const categoryMap: [RegExp, string][] = [
    [/restaurant|cafe|coffee|food|meal|dine|bistro|pizza|burger|hotel\s*restaurant/i, "Meals"],
    [/hotel|inn|resort|lodg|accommodation|stay/i, "Hotel"],
    [/airline|airways|flight|air\s*india|spicejet|indigo|delta|united|lufthansa/i, "Flight"],
    [/uber|lyft|ola|taxi|cab|metro|transport|train|bus/i, "Ground Transport"],
    [/office|stationery|supply|amazon|store|shop/i, "Office"],
  ];
  for (const [pattern, cat] of categoryMap) {
    if (pattern.test(text)) { parsed.category = cat; break; }
  }

  return parsed;
}
