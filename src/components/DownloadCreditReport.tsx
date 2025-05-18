import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
  xmlResult: Document
) => {
  const { first_name, last_name, address, dob, score } = userData;
  const pdf = new jsPDF();
  let pdfBlob;
  const pageWidth = pdf.internal.pageSize.getWidth();

  // Center alignment function
  const centerText = (text: string, y: number) => {
    const textWidth = pdf.getTextWidth(text);
    pdf.text(text, (pageWidth - textWidth) / 2, y);
  };
  //Image
  pdf.addImage(logoImage, "PNG", 10, 9, 23, 30);

  // Title
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text(`${xmlResult ? "Full" : "Basic"} Credit Report`, 80, 50);

  // Add Date Pulled and Name/ID Details
  pdf.setFontSize(10);
  pdf.text(`Date Pulled: ${new Date().toLocaleDateString()}`, 150, 12);
  pdf.text(`Name: ${last_name}, ${first_name} `, 150, 17);
  pdf.text(`DOB: ${dob}`, 150, 22);
  pdf.setFont("Helvetica", "bold");
  pdf.setTextColor("#a32639"); // Red color
  const poweredByText = "Powered by Equifax";
  pdf.text(poweredByText, 150, 27);
  pdf.setTextColor("#000"); // Red color
  pdf.setFont("Helvetica", "bold");

  if (xmlResult) {
    const {
      lastName,
      firstName,
      dateOfBirth,
      retrievedBankruptcies,
      retrievedLocalInquiries,
      retrievedTrades,
      retrievedLoans,
      retrievedCollections,
      retrievedLegalItems,
      retrievedAddresses,
      retrievedEmployments,
    } = getData(xmlResult);

    // Section: Response From Equifax
    pdf.setFont("helvetica", "bold");
    pdf.text("Personal Information", 10, 65);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Full Name: ${lastName}, ${firstName}`, 10, 70);
    pdf.text(`Date of Birth: ${dateOfBirth}`, 10, 75);

    // Section: Consumer Information
    pdf.setFont("helvetica", "bold");
    pdf.text("Consumer Information", 10, 90);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Credit Score: `, 10, 95);
    pdf.setFont("helvetica", "bold");
    pdf.text(`${score}`, 32, 95);
    pdf.setFont("helvetica", "normal");

    let posY = 105;
    const pageHeight = 265;
    const checkPageEnd = () => {
      if (posY > pageHeight) {
        pdf.addPage();
        posY = 20; // Reset position for new page
      }
    };
    posY += 5;
    pdf.setFont("helvetica", "bold");
    pdf.text("Addresses", 10, posY);
    pdf.setFont("helvetica", "normal");
    posY += 5;
    if (retrievedAddresses) {
      retrievedAddresses.forEach((address, index) => {
        checkPageEnd();
        const addressText = `${address.CivicNumber} ${address.StreetName}, ${address.City}, ${address.Province_code}, ${address.PostalCode}`;
        if (index === 0) {
          pdf.text(`Current Address: ${addressText}`, 10, posY);
          posY += 5;
          pdf.text(`Date Reported: ${address.DateReported}`, 10, posY);
          checkPageEnd();
        } else {
          pdf.text(`Previous Address ${index}: ${addressText}`, 10, posY);
          posY += 5;
          pdf.text(`Date Reported Address: ${address.DateReported}`, 10, posY);
          checkPageEnd();
        }
        posY += 10;
      });
    } else {
      pdf.text(`No Record of Addresses`, 10, posY);
      posY += 10;
      checkPageEnd();
    }

    // Employment Info
    posY += 5;
    pdf.setFont("helvetica", "bold");
    pdf.text("Employments", 10, posY);
    pdf.setFont("helvetica", "normal");
    posY += 5;
    if (retrievedEmployments) {
      retrievedEmployments.forEach((employer, index) => {
        checkPageEnd();
        pdf.text(`Employer: ${employer}`, 10, posY);
        if (index === retrievedEmployments.length - 1) posY += 10;
        else posY += 5;
        checkPageEnd();
      });
    } else {
      pdf.text(`No Record of Bankruptcy`, 10, posY);
      posY += 10;
      checkPageEnd();
    }

    // Section: Recent Bankruptcy
    posY += 5;
    pdf.setFont("helvetica", "bold");
    pdf.text("Bankruptcies", 10, posY);
    pdf.setFont("helvetica", "normal");
    posY += 5;
    if (retrievedBankruptcies) {
      retrievedBankruptcies.forEach((bankruptcy) => {
        checkPageEnd();

        pdf.text(`Date Filed: ${bankruptcy.DateFiled}`, 10, posY);
        posY += 5;
        pdf.text(`Type: ${bankruptcy.Type_description}`, 10, posY);
        posY += 5;
        pdf.text(
          `Case Number and Trustee: ${bankruptcy.CaseNumberAndTrustee}`,
          10,
          posY
        );
        posY += 5;
        pdf.text(
          `Intent: ${bankruptcy.IntentOrDisposition_description}`,
          10,
          posY
        );
        posY += 5;
        pdf.text(
          `Liability Amount: ${
            +bankruptcy.LiabilityAmount
              ? "$" + Number(bankruptcy.LiabilityAmount)
              : "N/A"
          }`,
          10,
          posY
        );
        posY += 5;
        pdf.text(
          `Asset Amount: ${
            +bankruptcy.AssetAmount
              ? "$" + Number(bankruptcy.AssetAmount)
              : "N/A"
          }`,
          10,
          posY
        );
        posY += 10;
        checkPageEnd();
      });
    } else {
      pdf.text(`No Record of Bankruptcy`, 10, posY);
      posY += 10;
      checkPageEnd();
    }
    posY += 5;
    pdf.setFont("helvetica", "bold");
    pdf.text("Collections", 10, posY);
    pdf.setFont("helvetica", "normal");
    posY += 5;
    if (retrievedCollections) {
      retrievedCollections.forEach((collection) => {
        checkPageEnd();
        pdf.text(`Assigned Date: ${collection.AssignedDate}`, 10, posY);
        posY += 5;
        pdf.text(`Customer Number: ${collection.CustomerNumber}`, 10, posY);
        posY += 5;
        pdf.text(`Name: ${collection.Name}`, 10, posY);
        posY += 5;
        pdf.text(
          `Creditor Account Number and Name: ${collection.AccountNumberAndOrName}`,
          10,
          posY
        );
        posY += 5;
        pdf.text(
          `OriginalAmount: ${Number(collection.OriginalAmount) ?? "N/A"}`,
          10,
          posY
        );
        posY += 5;
        pdf.text(
          `Balance Amount: ${
            collection.BalanceAmount || collection.OriginalAmount === 0
              ? "$" + Number(collection.BalanceAmount)
              : "N/A"
          }`,
          10,
          posY
        );
        posY += 5;
        pdf.text(
          `Date of Last Payment: ${collection.DateOfLastPayment}`,
          10,
          posY
        );

        posY += 10;
        checkPageEnd();
      });
    } else {
      pdf.text(`No Record of Collections`, 10, posY);
      posY += 10;
      checkPageEnd();
    }
    posY += 5;
    pdf.setFont("helvetica", "bold");
    pdf.text("Local Inquiries", 10, posY);
    pdf.setFont("helvetica", "normal");
    posY += 5;
    if (retrievedLocalInquiries) {
      retrievedLocalInquiries.forEach((inquiry) => {
        checkPageEnd();
        pdf.text(`Date Filed: ${inquiry.CNLocalInquiry_date}`, 10, posY);
        posY += 5;
        pdf.text(`Customer Number: ${inquiry.CustomerNumber}`, 10, posY);
        posY += 5;
        pdf.text(`Name: ${inquiry.Name}`, 10, posY);
        posY += 5;
        pdf.text(
          `Phone Number: ${
            inquiry.AreaCode && inquiry.Number
              ? "(" + inquiry.AreaCode + ") " + inquiry.Number
              : "N/A"
          }`,
          10,
          posY
        );
        posY += 10;
        checkPageEnd();
      });
    } else {
      pdf.text(`No Record of Local Inquiries`, 10, posY);
      posY += 10;
      checkPageEnd();
    }
    posY += 5;
    pdf.setFont("helvetica", "bold");
    pdf.text("Secured Loans", 10, posY);
    pdf.setFont("helvetica", "normal");
    posY += 5;
    if (retrievedLoans) {
      retrievedLoans.forEach((loan) => {
        checkPageEnd();
        pdf.text(`Date Filed: ${loan.DateFiled}`, 10, posY);
        posY += 5;
        pdf.text(`Customer Number: ${loan.CustomerNumber}`, 10, posY);
        posY += 5;
        pdf.text(`Court Name: ${loan.Name}`, 10, posY);
        posY += 5;
        pdf.text(
          `Name Address And Amount: ${loan.NameAddressAndAmount}`,
          10,
          posY
        );
        posY += 5;

        pdf.text(`Maturity Date: ${loan.MaturityDate}`, 10, posY);
        posY += 10;
        checkPageEnd();
      });
    } else {
      checkPageEnd();
      pdf.text(`No Record of Loans`, 10, posY);
      posY += 10;
      checkPageEnd();
    }

    posY += 5;
    pdf.setFont("helvetica", "bold");
    pdf.text("Legal Items", 10, posY);
    pdf.setFont("helvetica", "normal");
    posY += 5;
    if (retrievedLegalItems) {
      retrievedLegalItems.forEach((legalItem) => {
        checkPageEnd();
        pdf.text(`Date Filed: ${legalItem.DateFiled}`, 10, posY);
        posY += 5;
        pdf.text(
          `LegalItem Description: ${legalItem.CNLegalItem_description}`,
          10,
          posY
        );
        posY += 5;
        pdf.text(
          `Amount: ${
            legalItem.Amount ? "$" + Number(legalItem.Amount) : "N/A"
          }`,
          10,
          posY
        );
        posY += 5;
        pdf.text(`Defendant: ${legalItem.Defendant}`, 10, posY);
        posY += 5;
        pdf.text(`Plaintiff: ${legalItem.Plaintiff}`, 10, posY);
        posY += 5;
        pdf.text(`Lawyer Info: ${legalItem.LawyerNameAddress}`, 10, posY);
        posY += 10;
        checkPageEnd();
      });
    } else {
      pdf.text(`No Record of Legal Items`, 10, posY);
      posY += 10;
      checkPageEnd();
    }

    posY += 5;
    pdf.setFont("helvetica", "bold");
    pdf.text("Trades", 10, posY);
    pdf.setFont("helvetica", "normal");
    posY += 5;
    if (retrievedTrades) {
      retrievedTrades.forEach((trade) => {
        checkPageEnd();
        pdf.text(`Date Reported: ${trade.DateReported}`, 10, posY);
        posY += 5;
        pdf.text(
          `High Credit Amount: ${
            +trade.HighCreditAmount
              ? "$" + Number(trade.HighCreditAmount)
              : "N/A"
          }`,
          10,
          posY
        );
        posY += 5;
        pdf.text(
          `Payment Term Amount: ${Number(trade.PaymentTermAmount) || "N/A"}`,
          10,
          posY
        );
        posY += 5;
        pdf.text(
          `Balance Amount: ${Number(trade.BalanceAmount) || "N/A"}`,
          10,
          posY
        );
        posY += 5;
        pdf.text(
          `Past Due Amount: ${Number(trade.PastDueAmount) || "N/A"}`,
          10,
          posY
        );
        posY += 5;
        pdf.text(
          `Months Reviewed: ${
            trade.MonthsReviewed ? trade.MonthsReviewed : "N/A"
          }`,
          10,
          posY
        );
        posY += 5;
        pdf.text(`DateOpened: ${trade.DateOpened}`, 10, posY);
        posY += 5;
        pdf.text(
          `Date of Last Activity/Payment: ${trade.DateLastActivityOrPayment}`,
          10,
          posY
        );
        posY += 5;
        pdf.text(
          `Portfolio Description: ${
            trade.PortfolioType_description
              ? trade.PortfolioType_description
              : "N/A"
          }`,
          10,
          posY
        );
        posY += 5;
        pdf.text(
          `Payment Description: ${
            trade.PaymentRate_description
              ? trade.PaymentRate_description
              : "N/A"
          }`,
          10,
          posY
        );
        posY += 10;
        checkPageEnd();
      });
    } else {
      pdf.text(`No Record of Trades`, 10, posY);
      posY += 10;
      checkPageEnd();
    }

    // Save PDF
    pdf.save("Rented123 Full Credit Report.pdf");
    pdfBlob = pdf.output("blob");
  } else {
    // Add smaller logo, centered at the top
    pdf.setTextColor(0, 0, 0); // Reset color to black

    // User information with extra line spacing
    pdf.setFontSize(12);
    pdf.setFont("Helvetica", "normal");
    pdf.text(`Name: ${last_name}, ${first_name}`, 20, 80);
    pdf.text(`Current Address: ${address}`, 20, 95);
    pdf.text(`Date of Birth: ${dob}`, 20, 110);
    pdf.setFont("Helvetica", "bold");
    pdf.text(`Credit Score: ${userData.score}`, 20, 125);
    pdf.setFont("Helvetica", "normal");

    pdf.setProperties({
      title: xmlResult ? "Full Credit Report" : "Basic Credit Report",
      author: "Rented123",
      keywords: `${activeToken} ${last_name} ${score}`,
    });

    // Download PDF
    pdf.save(xmlResult ? "Full Credit Report" : "Basic Credit Report");
    pdfBlob = pdf.output("blob");
  }

  //save pdf
  const goodCreditStanding = userData.score > 580; //580 is minimum score
  await saves3LinkInWordPress(
    pdfBlob as Blob,
    goodCreditStanding,
    `${last_name}_${dob}_credit_report`,
    last_name,
    dob
  );

  emailPDF(userData, goodCreditStanding);
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
  return (
    <div>
      <div id="gauge-chart"></div>
      <Button
        sx={{ marginTop: "10px" }}
        type="submit"
        variant="contained"
        color="primary"
        onClick={() => {
          generateCreditReportPDF(userData, activeToken, XMLResult as Document);
        }}
      >
        Download Credit Report
      </Button>
    </div>
  );
}
