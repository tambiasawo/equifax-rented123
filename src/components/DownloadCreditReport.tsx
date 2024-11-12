import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { logoImage } from "@/utils";
import { Button } from "@mui/material";

export const generateCreditReportPDF = async (
  userData: {
    first_name: string;
    last_name: string;
    dob: string;
    address: string;
  },
  score: number
) => {
  const { first_name, last_name, address, dob } = userData;
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();

  // Center alignment function
  const centerText = (text: string, y: number) => {
    const textWidth = pdf.getTextWidth(text);
    pdf.text(text, (pageWidth - textWidth) / 2, y);
  };

  // Add "Powered by Equifax" in red at the top-right corner
  pdf.setFontSize(10);
  pdf.setFont("Helvetica", "bold");
  pdf.setTextColor("#a32639"); // Red color

  const poweredByText = "Powered by Equifax";
  pdf.text(poweredByText, pageWidth - pdf.getTextWidth(poweredByText) - 10, 10);

  // Add smaller logo, centered at the top
  pdf.setTextColor(0, 0, 0); // Reset color to black
  pdf.addImage(logoImage, "PNG", (pageWidth - 20) / 2, 20, 20, 28);

  // Title "Credit Report" centered
  pdf.setFontSize(18);
  pdf.setFont("Helvetica", "bold");
  centerText("Credit Report", 60);

  // User information with extra line spacing
  pdf.setFontSize(12);
  pdf.setFont("Helvetica", "normal");
  pdf.text(`Name: ${first_name} ${last_name}`, 20, 80);
  pdf.text(``, 20, 85); // Extra line
  pdf.text(`Address: ${address}`, 20, 95);
  pdf.text(``, 20, 100); // Extra line
  pdf.text(`Date of Birth: ${dob}`, 20, 110);

  // Capture GaugeChart and add it to the PDF
  const chartElement = document.getElementById("gauge-chart2") as HTMLElement;
  const chartImage = await html2canvas(chartElement).then((canvas) =>
    canvas.toDataURL("image/png")
  );

  // Dynamically adjust the chart size based on page width
  const chartWidth = Math.min(pageWidth - 40, 150);
  const chartHeight = chartWidth / 2.5; // Adjust proportionally for the gauge

  // Add GaugeChart image, centered
  pdf.addImage(
    chartImage,
    "PNG",
    (pageWidth - chartWidth) / 2,
    130,
    chartWidth,
    chartHeight
  );

  // Add "Date Taken" under the chart image
  pdf.setFontSize(10);
  pdf.setTextColor("#9e9e9e");

  centerText(
    `Date Taken: ${new Date().toLocaleDateString()}`,
    130 + chartHeight + 10
  );
  // Download PDF
  pdf.save("Credit Report.pdf");

  //save pdf
  const pdfBlob = pdf.output("blob");
  let goodCreditStanding = score > 580; //580 is minimum score
  await saves3LinkInWordPress(
    pdfBlob,
    goodCreditStanding,
    `${last_name}_${dob}_credit_report`,
    last_name,
    dob
  );
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
  score,
}: {
  userData: any;
  score: number;
}) {
  return (
    <div>
      <div id="gauge-chart"></div>
      <Button
        sx={{ marginTop: "10px" }}
        type="submit"
        variant="contained"
        color="primary"
        onClick={() => generateCreditReportPDF(userData, score)}
      >
        Download Credit Report
      </Button>
    </div>
  );
}
