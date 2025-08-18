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
    console.log("🔄 Starting NDA document generation for user:", userId);
    
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
    console.log("✅ PDF generated successfully, size:", pdfBytes.byteLength, "bytes");

    const fileName = `nda_${Date.now()}.pdf`;
    const filePath = `${userId}/nda/${fileName}`;
    console.log("🔄 Uploading to storage path:", filePath);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("user-documents")
      .upload(filePath, new Blob([pdfBytes], { type: "application/pdf" }));

    if (uploadError) {
      console.error("❌ Storage upload failed:", uploadError);
      throw uploadError;
    }
    
    console.log("✅ File uploaded successfully to:", uploadData.path);

    const documentRecord = {
      user_id: userId,
      document_type: "nda",
      document_name: "Beta Tester NDA",
      file_path: uploadData.path,
      file_size: pdfBytes.byteLength,
      mime_type: "application/pdf",
      status: "active",
      visibility: "private",
      folder_category: "legal",
      verified_by: "system",
      verified_at: new Date().toISOString(),
      metadata: {
        auto_generated: true,
        signed_at: new Date().toISOString(),
        signer_name: signerName,
        signer_email: email || null,
        username: username || null,
      },
    };

    console.log("🔄 Inserting document record:", documentRecord);

    const { error: docError } = await supabase
      .from("user_documents")
      .insert([documentRecord]);

    if (docError) {
      console.error("❌ Database insert failed:", docError);
      throw docError;
    }

    console.log("✅ NDA document successfully stored in user profile");
    return uploadData.path;
  } catch (error) {
    console.error("❌ NDA PDF generation/storage failed:", error);
    
    // Log additional context for debugging
    console.error("Error context:", {
      userId,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return null; // Silent fail - do not block user flow
  }
};
