import jsPDF from "jspdf";
import { getData, logoImage } from "@/utils";
import { Button } from "@mui/material";
import { useResultCtx } from "@/app/context/resultContext";

type UserData = {
  first_name: string;
  last_name: string;
  dob: string;
  address: string;
  score: number;
};

const emailPDF = async (userDetails: UserData, goodCreditStanding: boolean) => {
  const request = await fetch("/api/send-email/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userDetails, goodCreditStanding }),
  });
  const response = await request.json();
};

const generateCreditReportPDF = async (
  userData: UserData,
  activeToken: string,
  xmlResult?: Document
) => {
  // Dynamic import for jsPDF to avoid SSR issues
  const { jsPDF } = await import("jspdf");

  const { first_name, last_name, address, dob, score } = userData;
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Color palette
  const colors = {
    primary: "#1e40af",
    secondary: "#0d9488",
    accent: "#d97706",
    success: "#16a34a",
    warning: "#d97706",
    error: "#dc2626",
    gray: {
      100: "#f3f4f6",
      300: "#d1d5db",
      600: "#4b5563",
      800: "#1f2937",
    },
    equifax: "#a32639",
  };

  // Helper functions
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const setFillColor = (color: string) => {
    const rgb = hexToRgb(color);
    if (rgb) pdf.setFillColor(rgb.r, rgb.g, rgb.b);
  };

  const setTextColor = (color: string) => {
    const rgb = hexToRgb(color);
    if (rgb) pdf.setTextColor(rgb.r, rgb.g, rgb.b);
  };

  const centerText = (text: string, y: number) => {
    const textWidth = pdf.getTextWidth(text);
    pdf.text(text, (pageWidth - textWidth) / 2, y);
  };

  const drawCard = (
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor?: string
  ) => {
    pdf.setDrawColor(230, 230, 230);
    pdf.setLineWidth(0.5);

    if (fillColor) {
      setFillColor(fillColor);
      pdf.roundedRect(x, y, width, height, 3, 3, "FD");
    } else {
      pdf.roundedRect(x, y, width, height, 3, 3, "S");
    }

    // Add subtle shadow effect
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.2);
    pdf.roundedRect(x + 0.5, y + 0.5, width, height, 3, 3, "S");
  };

  const getScoreColor = (score: number) => {
    if (score >= 800) return colors.success;
    if (score >= 740) return colors.secondary;
    if (score >= 670) return colors.warning;
    if (score >= 580) return colors.accent;
    return colors.error;
  };

  const getScoreRating = (score: number) => {
    if (score >= 800) return "Excellent";
    if (score >= 740) return "Very Good";
    if (score >= 670) return "Good";
    if (score >= 580) return "Fair";
    return "Poor";
  };

  // Header section
  const drawHeader = () => {
    // Background header bar
    setFillColor(colors.gray[100]);
    pdf.rect(0, 0, pageWidth, 45, "F");

    // Logo placeholder (you can replace with actual logo)
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    setTextColor(colors.primary);
    //pdf.text('Rented123', 20, 25);
    pdf.addImage(logoImage, "PNG", 10, 6, 23, 30);

    // Report title
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text(
      `${xmlResult ? "Comprehensive" : ""} Credit Report`,
      pageWidth - 20,
      20,
      { align: "right" }
    );

    // Date and powered by
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    pdf.text(`Date Pulled: ${currentDate}`, pageWidth - 20, 30, {
      align: "right",
    });

    setTextColor(colors.equifax);
    pdf.setFont("helvetica", "bold");
    pdf.text("Powered by Equifax", pageWidth - 20, 40, { align: "right" });

    // Reset text color
    setTextColor("#000000");
  };

  // Personal Information Section
  const drawPersonalInfo = () => {
    let currentY = 65;

    // Section header
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    setTextColor(colors.primary);
    pdf.text("Personal Information", 20, currentY);

    // Underline
    setFillColor(colors.primary);
    pdf.rect(20, currentY + 2, 52, 0.5, "F");

    currentY += 15;

    // Personal info card
    drawCard(20, currentY, pageWidth - 40, 50, colors.gray[100]);

    currentY += 15;

    // Personal details
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    setTextColor(colors.gray[800]);

    const personalInfo = [
      { label: "Full Name:", value: `${last_name}, ${first_name}` },
      { label: "Date of Birth:", value: dob },
      { label: "Current Address:", value: address },
    ];

    personalInfo.forEach((info, index) => {
      pdf.setFont("helvetica", "bold");
      pdf.text(info.label, 30, currentY);
      pdf.setFont("helvetica", "normal");
      pdf.text(info.value, 70, currentY);
      currentY += 10;
    });
  };

  // Credit Score Section with Visualization
  const drawCreditScore = () => {
    let currentY = 150;

    // Section header
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    setTextColor(colors.primary);
    pdf.text("Credit Score Overview", 20, currentY);

    // Underline
    setFillColor(colors.primary);
    pdf.rect(20, currentY + 2, 60, 0.5, "F");

    currentY += 20;

    // Credit score card
    const scoreColor = getScoreColor(score);
    drawCard(20, currentY, pageWidth - 40, 80);

    // Large score display
    pdf.setFontSize(48);
    pdf.setFont("helvetica", "bold");
    setTextColor(scoreColor);
    pdf.text(score.toString(), 40, currentY + 40);

    // Score rating
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    setTextColor(scoreColor);
    pdf.text(getScoreRating(score), 40, currentY + 55);

    // Score range indicator
    currentY += 20;
    const scoreRanges = [
      { min: 300, max: 579, label: "Poor", color: colors.error },
      { min: 580, max: 669, label: "Fair", color: colors.accent },
      { min: 670, max: 739, label: "Good", color: colors.warning },
      { min: 740, max: 799, label: "Very Good", color: colors.secondary },
      { min: 800, max: 850, label: "Excellent", color: colors.success },
    ];

    // Draw score scale
    const scaleStartX = 120;
    const scaleWidth = 60;
    const scaleHeight = 8;

    scoreRanges.forEach((range, index) => {
      const segmentWidth = scaleWidth / scoreRanges.length;
      const x = scaleStartX + index * segmentWidth;

      setFillColor(range.color);
      pdf.rect(x, currentY + 20, segmentWidth - 1, scaleHeight, "F");

      // Highlight current score range
      if (score >= range.min && score <= range.max) {
        pdf.setDrawColor(50, 50, 50);
        pdf.setLineWidth(2);
        pdf.rect(x, currentY + 20, segmentWidth - 1, scaleHeight, "S");
      }
    });

    // Scale labels
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    setTextColor(colors.gray[600]);
    pdf.text("300", scaleStartX, currentY + 35);
    pdf.text("850", scaleStartX + scaleWidth - 10, currentY + 35);

    // Score interpretation
    currentY += 50;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    setTextColor(colors.gray[800]);

    const interpretation = getScoreInterpretation(score);
    const splitText = pdf.splitTextToSize(interpretation, pageWidth - 60);
    pdf.text(splitText, 30, currentY);
  };

  const getScoreInterpretation = (score: number) => {
    if (score >= 800) {
      return "Exceptional credit score! You qualify for the best interest rates and credit terms available. Lenders view you as a very low-risk borrower.";
    } else if (score >= 740) {
      return "Very good credit score. You'll likely qualify for competitive interest rates and favorable credit terms from most lenders.";
    } else if (score >= 670) {
      return "Good credit score. You should qualify for most credit products, though you may not get the very best rates available.";
    } else if (score >= 580) {
      return "Fair credit score. You may face higher interest rates and more restrictive terms. Consider working to improve your credit.";
    } else {
      return "Poor credit score. You may have difficulty qualifying for credit, and when you do, expect high interest rates and strict terms.";
    }
  };

  // Key Factors Section (for basic report)
  const drawKeyFactors = () => {
    let currentY = 270;

    if (currentY > pageHeight - 50) {
      pdf.addPage();
      currentY = 20;
    }

    // Section header
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    setTextColor(colors.primary);
    pdf.text("Understanding Your Credit", 20, currentY);

    // Underline
    setFillColor(colors.primary);
    pdf.rect(20, currentY + 2, 65, 0.5, "F");

    currentY += 20;

    // Key factors card
    drawCard(20, currentY, pageWidth - 40, 60, colors.gray[100]);

    currentY += 15;

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    setTextColor(colors.gray[800]);

    const keyFactors = [
      "• Payment history accounts for 35% of your credit score",
      "• Credit utilization should be kept below 30%",
      "• Length of credit history affects 15% of your score",
      "• Credit mix and new accounts impact the remaining 20%",
    ];

    keyFactors.forEach((factor) => {
      pdf.text(factor, 30, currentY);
      currentY += 10;
    });
  };

  // Footer
  const drawFooter = () => {
    const footerY = pageHeight - 30;

    // Footer line
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(20, footerY, pageWidth - 20, footerY);

    // Footer text
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    setTextColor(colors.gray[600]);

    pdf.text(
      "This report is confidential and intended solely for the named individual.",
      20,
      footerY + 10
    );
    pdf.text(`Report ID: CR-${Date.now()}`, 20, footerY + 18);

    //pdf.text("Page 1 of 1", pageWidth - 20, footerY + 10, { align: "right" });
    pdf.text("Generated by Rented123", pageWidth - 20, footerY + 10, {
      align: "right",
    });
  };

  // Generate the PDF
  drawHeader();
  drawPersonalInfo();
  drawCreditScore();
  drawKeyFactors();
  drawFooter();

  // Set PDF properties
  pdf.setProperties({
    title: xmlResult ? "Full Credit Report" : "Basic Credit Report",
    author: "Rented123",
    keywords: `${last_name} ${score}`,
  });

  return pdf;
};

export const saves3LinkInWordPress = async (
  PDFfile: Blob,
  goodCreditStanding: boolean,
  fileName: string,
  last_name: string,
  dob: string
) => {
  // Upload to S3 and wait for the result
  try {
    const s3Url = await saveToS3(PDFfile, fileName); // This is the S3 URL where the PDF is stored
    const response = await fetch("/api/store-url", {
      method: "POST",
      body: JSON.stringify({
        last_name,
        dob,
        fileName,
        report_url: s3Url,
        goodCreditStanding,
      }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json", // Optional: Specify that you expect a JSON response
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error saving report URL:", errorData);
      return "An error occured";
    } else {
      const responseData = await response.json();
      console.log("Report URL saved successfully:", responseData);
      return s3Url;
    }
  } catch (error) {
    console.log(error);
    console.error("Failed to upload PDF:", error);
    return "An error occured";
  }
};

const saveToS3 = async (PDFfile: Blob, fileName: string) => {
  try {
    const PDFfileBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(PDFfile);
      reader.onloadend = () => {
        const base64data =
          (typeof reader.result === "string" && reader.result?.split(",")[1]) ||
          ""; // Extract base64 part only
        resolve(base64data);
      };
      reader.onerror = reject;
    });

    const response = await fetch("/api/store-pdf", {
      method: "POST",
      body: JSON.stringify({
        PDFfile: PDFfileBase64,
        fileName,
      }),
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.log({ errorData });

      return "An error occurred";
    }
    const data = await response.json();
    console.log(`File uploaded successfully`);
    return data.location; // This is the S3 URL
  } catch (err) {
    console.error("Error uploading file:", err);
    throw err; // Return the error in case something goes wrong
  }
};

export default function DownloadReportButton({
  userData,
  activeToken,
}: {
  userData: UserData;
  activeToken: string;
}) {
  const { XMLResult } = useResultCtx();
  const handleGenerateReport = async () => {
    try {
      const pdf = await generateCreditReportPDF(
        userData,
        activeToken,
        XMLResult as Document
      );

      // Download the PDF
      const filename = `Credit_Report_${userData.last_name}_${
        userData.first_name
      }_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(filename);

      //save pdf
      const pdfBlob = pdf.output("blob");
      const goodCreditStanding = userData.score > 580; //580 is minimum score
      await saves3LinkInWordPress(
        pdfBlob as Blob,
        goodCreditStanding,
        `${userData.last_name}_${userData.dob}_credit_report`,
        `${userData.last_name}`,
        `${userData.dob}`
      );

      //emailPDF(userData, goodCreditStanding);
    } catch (error) {
      console.error("Error generating credit report:", error);
      alert("Error generating credit report. Please try again.");
    }
  };
  return (
    <div>
      <div id="gauge-chart"></div>
      <Button
        sx={{ marginTop: "10px" }}
        type="submit"
        variant="contained"
        color="primary"
        onClick={handleGenerateReport}
      >
        Download Credit Report
      </Button>
    </div>
  );
}
