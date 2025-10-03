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
    drawText(`Effective Date: ${new Date().toLocaleDateString()}`, 72, height - 96, 10);
    
    let yPos = height - 132;
    const lineHeight = 14;
    const smallLineHeight = 12;

    // Signer Information
    drawText("SIGNER INFORMATION", 72, yPos, 12);
    yPos -= lineHeight;
    
    if (firstName) {
      drawText(`First Name: ${firstName}`, 72, yPos, 10);
      yPos -= smallLineHeight;
    }
    if (lastName) {
      drawText(`Last Name: ${lastName}`, 72, yPos, 10);
      yPos -= smallLineHeight;
    }
    if (email) {
      drawText(`Email: ${email}`, 72, yPos, 10);
      yPos -= smallLineHeight;
    }
    if (username) {
      drawText(`Username: ${username}`, 72, yPos, 10);
      yPos -= smallLineHeight;
    }
    yPos -= lineHeight;

    // Agreement Body
    drawText("1. CONFIDENTIAL INFORMATION", 72, yPos, 12);
    yPos -= lineHeight;
    
    const wrapText = (text: string, maxWidth: number) => {
      const words = text.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = testLine.length * 5; // Approximate character width
        if (testWidth > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine) lines.push(currentLine);
      return lines;
    };

    const para1 = "As a beta tester for ClearMarket, you will have access to confidential and proprietary information including but not limited to: product features, business strategies, user data, technical specifications, and future development plans.";
    wrapText(para1, 450).forEach(line => {
      drawText(line, 72, yPos, 9);
      yPos -= smallLineHeight;
    });
    yPos -= lineHeight;

    drawText("2. NON-DISCLOSURE OBLIGATIONS", 72, yPos, 12);
    yPos -= lineHeight;
    
    const para2 = "You agree to keep all confidential information strictly private and not disclose it to any third party without prior written consent from ClearMarket. You will use this information solely for beta testing purposes.";
    wrapText(para2, 450).forEach(line => {
      drawText(line, 72, yPos, 9);
      yPos -= smallLineHeight;
    });
    yPos -= lineHeight;

    drawText("3. DURATION", 72, yPos, 12);
    yPos -= lineHeight;
    
    const para3 = "This agreement remains in effect for the duration of the beta testing period and for two (2) years following the public launch of ClearMarket or termination of your beta access, whichever comes first.";
    wrapText(para3, 450).forEach(line => {
      drawText(line, 72, yPos, 9);
      yPos -= smallLineHeight;
    });
    yPos -= lineHeight;

    drawText("4. PERMITTED DISCLOSURES", 72, yPos, 12);
    yPos -= lineHeight;
    
    const para4 = "You may share feedback and bug reports with ClearMarket staff through official channels. You may not publicly post, tweet, blog, or otherwise share screenshots, features, or details about ClearMarket.";
    wrapText(para4, 450).forEach(line => {
      drawText(line, 72, yPos, 9);
      yPos -= smallLineHeight;
    });
    yPos -= lineHeight;

    drawText("5. ACKNOWLEDGMENT", 72, yPos, 12);
    yPos -= lineHeight;
    
    const para5 = "By signing this agreement, you acknowledge that you understand these obligations and agree to be bound by them. Breach of this agreement may result in immediate termination of beta access and potential legal action.";
    wrapText(para5, 450).forEach(line => {
      drawText(line, 72, yPos, 9);
      yPos -= smallLineHeight;
    });

    // Footer/Signature
    const signerName = `${firstName || ""} ${lastName || ""}`.trim() || username || "[Unknown]";
    drawText(`Digital Signature: ${signerName}`, 72, 140, 10);
    drawText(`Signed at: ${new Date().toISOString()}`, 72, 125, 9);
    drawText("Document generated automatically by ClearMarket", 72, 110, 8);
    drawText("This is a legally binding agreement.", 72, 95, 8);

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

    const displaySigner = username || `${firstName || ''} ${lastName || ''}`.trim() || 'User';
    const dateStr = new Date().toISOString().slice(0, 10);
    const computedDocName = `NDA - ${displaySigner} - ${dateStr}`;

    const documentRecord = {
      user_id: userId,
      document_type: "nda",
      document_name: computedDocName,
      file_path: uploadData.path,
      file_size: pdfBytes.byteLength,
      mime_type: "application/pdf",
      status: "active",
      visibility: "private",
      folder_category: "legal",
      verified_by: userId,
      verified_at: new Date().toISOString(),
      metadata: {
        auto_generated: true,
        signed_at: new Date().toISOString(),
        signer_name: `${firstName || ''} ${lastName || ''}`.trim() || username || '[Unknown]',
        signer_email: email || null,
        username: username || null,
      },
    };

    console.log("🔄 Saving document record:", documentRecord);

    const { data: existingDoc } = await supabase
      .from("user_documents")
      .select("id, file_path")
      .eq("user_id", userId)
      .eq("document_type", "nda")
      .maybeSingle();

    if (existingDoc?.id) {
      const { error: updateError } = await supabase
        .from("user_documents")
        .update({ ...documentRecord, file_path: uploadData.path })
        .eq("id", existingDoc.id);

      if (updateError) {
        console.error("❌ Database update failed:", updateError);
        throw updateError;
      }
    } else {
      const { error: insertError } = await supabase
        .from("user_documents")
        .insert([documentRecord]);

      if (insertError) {
        console.error("❌ Database insert failed:", insertError);
        throw insertError;
      }
    }

    // Clean up previous file if path changed
    try {
      if (existingDoc?.file_path && existingDoc.file_path !== uploadData.path) {
        await supabase.storage
          .from("user-documents")
          .remove([existingDoc.file_path]);
        console.log("🧹 Removed old NDA file:", existingDoc.file_path);
      }
    } catch (cleanupErr) {
      console.warn("⚠️ Could not remove old NDA file:", cleanupErr);
    }

    console.log("✅ NDA document successfully stored in user profile");
    return uploadData.path;
  } catch (error) {
    console.error("❌ NDA PDF generation/storage failed:", error);
    
    // Log detailed error information
    if (error && typeof error === 'object') {
      const err = error as any;
      console.error("Detailed error:", {
        userId,
        message: err.message || 'Unknown error',
        code: err.code,
        details: err.details,
        hint: err.hint,
        statusCode: err.statusCode,
        stack: err.stack
      });
      
      // Log specific storage errors
      if (err.message?.includes('bucket') || err.message?.includes('storage')) {
        console.error("⚠️ Storage bucket 'user-documents' may not exist or policies are not configured");
        console.error("Please create the bucket in Supabase dashboard: Storage > Create bucket");
      }
    }
    
    return null; // Silent fail - do not block user flow
  }
};
