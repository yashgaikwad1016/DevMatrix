import PDFDocument from "pdfkit";

export const generateRequirementPDF = (project, requirement) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers = [];

      doc.on("data", (buffer) => buffers.push(buffer));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // Header
      doc
        .fillColor("#0f172a")
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("DEVMATRIX", { align: "left" })
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#64748b")
        .text("Project Requirements Specification & Client Brief", { align: "left" });

      doc.moveDown(1);
      doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(1);

      // Project Overview Block
      doc.fillColor("#0f172a").fontSize(14).font("Helvetica-Bold").text("1. Project Information");
      doc.moveDown(0.5);

      const client = project.users_projects_client_idTousers || project.users || {};
      const fields = [
        ["Project Number:", project.project_number],
        ["Project Name:", project.project_name],
        ["Client Name:", client.name || "N/A"],
        ["Client Email:", client.email || "N/A"],
        ["College / University:", `${client.college || ""} ${client.university ? " / " + client.university : ""}`.trim() || "N/A"],
        ["Domain:", project.domain || "N/A"],
        ["Project Type:", project.project_type ? project.project_type.toUpperCase() : "N/A"],
        ["Priority:", project.priority ? project.priority.toUpperCase() : "NORMAL"],
        ["Target Deadline:", project.deadline ? new Date(project.deadline).toLocaleDateString() : "Flexible"],
        ["Requirement Version:", `Version ${requirement.version} (${requirement.status.toUpperCase()})`],
      ];

      fields.forEach(([key, val]) => {
        doc
          .fontSize(10)
          .font("Helvetica-Bold")
          .fillColor("#475569")
          .text(key, { continued: true, width: 140 })
          .font("Helvetica")
          .fillColor("#0f172a")
          .text(`  ${val}`);
      });

      doc.moveDown(1);
      doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(1);

      // Description
      doc.fillColor("#0f172a").fontSize(14).font("Helvetica-Bold").text("2. Project Scope & Description");
      doc.moveDown(0.5);
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#334155")
        .text(requirement.description || project.short_description || "No detailed description provided.", {
          lineGap: 4,
        });

      if (requirement.additional_requirements) {
        doc.moveDown(0.8);
        doc.font("Helvetica-Bold").text("Additional Instructions:");
        doc.font("Helvetica").text(requirement.additional_requirements, { lineGap: 4 });
      }

      doc.moveDown(1);
      doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(1);

      // Technologies
      doc.fillColor("#0f172a").fontSize(14).font("Helvetica-Bold").text("3. Requested Technology Stack");
      doc.moveDown(0.5);

      const techs = requirement.project_technologies || [];
      if (techs.length > 0) {
        techs.forEach((t) => {
          doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .fillColor("#2563eb")
            .text(`• [${t.category.toUpperCase()}] `, { continued: true })
            .font("Helvetica")
            .fillColor("#0f172a")
            .text(t.technology_name + (t.recommendation_note ? ` (${t.recommendation_note})` : ""));
        });
      } else {
        doc.fontSize(10).font("Helvetica").fillColor("#64748b").text("Client requested recommended technology stack from team.");
      }

      doc.moveDown(1);
      doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(1);

      // Design Preferences
      const design = requirement.project_designs;
      if (design) {
        doc.fillColor("#0f172a").fontSize(14).font("Helvetica-Bold").text("4. UI/UX & Design Guidelines");
        doc.moveDown(0.5);
        doc.fontSize(10).font("Helvetica").fillColor("#334155");
        doc.text(`Design Style: ${design.design_style || "Modern"}`);
        doc.text(`Font Family: ${design.font_family || "Inter / System"}`);
        doc.text(`Color Palette: Primary ${design.primary_color || "#2563eb"} | Accent ${design.accent_color || "#3b82f6"} | Background ${design.background_color || "#ffffff"}`);
        if (design.reference_url) doc.text(`Reference Website: ${design.reference_url}`);
        if (design.custom_instructions) doc.text(`Instructions: ${design.custom_instructions}`);

        doc.moveDown(1);
        doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
        doc.moveDown(1);
      }

      // AI Features
      const aiFeatures = requirement.project_ai_features || [];
      if (aiFeatures.length > 0) {
        doc.fillColor("#0f172a").fontSize(14).font("Helvetica-Bold").text("5. AI/ML Module Specifications");
        doc.moveDown(0.5);
        aiFeatures.forEach((ai) => {
          doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .fillColor("#7c3aed")
            .text(`• ${ai.feature_name}: `, { continued: true })
            .font("Helvetica")
            .fillColor("#334155")
            .text(ai.description || "Core AI integration");
        });
        doc.moveDown(1);
      }

      // Functional Requirements
      const frs = requirement.functional_requirements || [];
      if (frs.length > 0) {
        doc.fillColor("#0f172a").fontSize(14).font("Helvetica-Bold").text("6. Key Functional Requirements");
        doc.moveDown(0.5);
        frs.forEach((fr, i) => {
          doc
            .fontSize(10)
            .font("Helvetica-Bold")
            .fillColor("#0f172a")
            .text(`${fr.requirement_code || "FR-" + (i + 1)}: ${fr.title} [Priority: ${fr.priority.toUpperCase()}]`);
          if (fr.description) {
            doc.font("Helvetica").fillColor("#475569").text(`   ${fr.description}`);
          }
          doc.moveDown(0.3);
        });
      }

      // Footer
      doc.moveDown(2);
      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#94a3b8")
        .text(`Generated automatically by DevMatrix on ${new Date().toLocaleString()} | Confidential Client Document`, {
          align: "center",
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export const generateQuotationPDF = (quotation, project) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers = [];

      doc.on("data", (buffer) => buffers.push(buffer));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // Header
      doc
        .fillColor("#0f172a")
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("DEVMATRIX", { align: "left" })
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#64748b")
        .text("Official Commercial Quotation & Cost Breakdown", { align: "left" });

      doc.moveDown(1);
      doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(1);

      // Meta
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor("#475569")
        .text("Quotation Number: ", { continued: true })
        .font("Helvetica")
        .fillColor("#0f172a")
        .text(quotation.quotation_number);

      doc
        .font("Helvetica-Bold")
        .fillColor("#475569")
        .text("Project: ", { continued: true })
        .font("Helvetica")
        .fillColor("#0f172a")
        .text(`${project.project_name} (${project.project_number})`);

      doc
        .font("Helvetica-Bold")
        .fillColor("#475569")
        .text("Date: ", { continued: true })
        .font("Helvetica")
        .fillColor("#0f172a")
        .text(new Date(quotation.created_at).toLocaleDateString());

      doc.moveDown(1);
      doc.fillColor("#0f172a").fontSize(12).font("Helvetica-Bold").text("Deliverables Breakdown");
      doc.moveDown(0.5);

      const items = quotation.quotation_items || [];
      items.forEach((item, idx) => {
        doc
          .fontSize(10)
          .font("Helvetica-Bold")
          .fillColor("#0f172a")
          .text(`${idx + 1}. ${item.item_name}`, { continued: true, width: 350 })
          .font("Helvetica")
          .fillColor("#2563eb")
          .text(`₹${Number(item.amount).toLocaleString("en-IN")}`, { align: "right" });

        if (item.description) {
          doc.fontSize(9).font("Helvetica").fillColor("#64748b").text(`   ${item.description}`);
        }
        doc.moveDown(0.4);
      });

      doc.moveDown(1);
      doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(0.5);

      // Financials Summary
      const summaryLines = [
        ["Subtotal", `₹${Number(quotation.subtotal).toLocaleString("en-IN")}`],
        ["Referral Discount", `-₹${Number(quotation.referral_discount).toLocaleString("en-IN")}`],
        ["Total Amount", `₹${Number(quotation.total_amount).toLocaleString("en-IN")}`],
        [`Advance Payment (${quotation.advance_percentage}%)`, `₹${Number(quotation.advance_amount).toLocaleString("en-IN")}`],
        ["Remaining Upon Completion", `₹${Number(quotation.remaining_amount).toLocaleString("en-IN")}`],
      ];

      summaryLines.forEach(([label, amount]) => {
        doc
          .fontSize(10)
          .font(label.includes("Total") ? "Helvetica-Bold" : "Helvetica")
          .fillColor("#0f172a")
          .text(label, { continued: true, width: 350 })
          .text(amount, { align: "right" });
      });

      doc.moveDown(1.5);
      doc
        .fontSize(9)
        .font("Helvetica-Oblique")
        .fillColor("#64748b")
        .text("Terms: 40% advance payment unlocks sprint kickoff. Remaining balance is due prior to final deliverable transfer.");

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export const generateReceiptPDF = (receipt, payment, project) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers = [];

      doc.on("data", (buffer) => buffers.push(buffer));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      doc
        .fillColor("#0f172a")
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("DEVMATRIX", { align: "left" })
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#16a34a")
        .text("PAYMENT RECEIPT - SUCCESSFUL", { align: "left" });

      doc.moveDown(1);
      doc.strokeColor("#e2e8f0").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(1);

      const rows = [
        ["Receipt Number:", receipt.receipt_number],
        ["Payment Number:", payment.payment_number],
        ["Razorpay Payment ID:", payment.razorpay_payment_id || "N/A"],
        ["Date & Time:", new Date(payment.paid_at || receipt.issued_at).toLocaleString()],
        ["Project:", `${project.project_name} (${project.project_number})`],
        ["Payment Type:", (receipt.receipt_type || payment.payment_type).toUpperCase()],
        ["Amount Paid:", `₹${Number(receipt.amount).toLocaleString("en-IN")}`],
        ["Status:", "PAID & VERIFIED"],
      ];

      rows.forEach(([k, v]) => {
        doc
          .fontSize(10)
          .font("Helvetica-Bold")
          .fillColor("#475569")
          .text(k, { continued: true, width: 180 })
          .font("Helvetica")
          .fillColor("#0f172a")
          .text(`  ${v}`);
      });

      doc.moveDown(2);
      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#94a3b8")
        .text("This is an electronically generated receipt issued by DevMatrix. Thank you for your partnership!", {
          align: "center",
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export default { generateRequirementPDF, generateQuotationPDF, generateReceiptPDF };
