import { supabase } from "@/integrations/supabase/client";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface NdaDocParams {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
}

export const generateAndSaveNDA = async ({
  userId,
  firstName,
  lastName,
  email,
  username,
}: NdaDocParams): Promise<string | null> => {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const drawText = (text: string, x: number, y: number, size = 12) => {
      page.drawText(text, {
        x,
        y,
        size,
        font,
        color: rgb(0, 0, 0),
      });
    };

    // Header
    drawText("ClearMarket Beta Tester Non-Disclosure Agreement", 72, height - 72, 16);
    drawText(`Effective Date: ${new Date().toLocaleDateString()}`, 72, height - 96);

    // Body summary
    const signerName = `${firstName || ""} ${lastName || ""}`.trim() || username || "[Unknown]";
    drawText(`Signed by: ${signerName}`, 72, height - 132);
    if (email) drawText(`Email: ${email}`, 72, height - 150);
    if (username) drawText(`Username: ${username}`, 72, height - 168);

    drawText(
      "This is a digitally generated confirmation of your NDA acceptance.",
      72,
      height - 204
    );
    drawText(
      "By signing, you agree to keep ClearMarket confidential information private.",
      72,
      height - 220
    );

    // Footer
    drawText(`Signed at: ${new Date().toISOString()}`, 72, 120);
    drawText("Document generated automatically by ClearMarket", 72, 100, 10);

    const pdfBytes = await pdfDoc.save();

    const fileName = `nda_${Date.now()}.pdf`;
    const filePath = `${userId}/nda/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("user-documents")
      .upload(filePath, new Blob([pdfBytes], { type: "application/pdf" }));

    if (uploadError) throw uploadError;

    const { error: docError } = await supabase
      .from("user_documents")
      .insert([
        {
          user_id: userId,
          document_type: "nda",
          document_name: "Beta Tester NDA",
          file_path: uploadData.path,
          file_size: pdfBytes.byteLength,
          mime_type: "application/pdf",
          status: "active",
          visibility: "private",
          folder_category: "legal",
          metadata: {
            auto_generated: true,
            signed_at: new Date().toISOString(),
            signer_name: signerName,
            signer_email: email || null,
            username: username || null,
          },
        },
      ]);

    if (docError) throw docError;

    return uploadData.path;
  } catch (error) {
    console.error("NDA PDF generation/storage failed:", error);
    return null; // Silent fail - do not block user flow
  }
};
