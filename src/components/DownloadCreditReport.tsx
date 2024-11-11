import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { logoImage } from "@/utils";
import { Button } from "@mui/material";

export const generateCreditReportPDF = async (userData) => {
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
  const chartElement = document.getElementById("gauge-chart2");
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
  pdf.save("credit_report.pdf");
};

export default function DownloadReportButton({ userData }) {
  return (
    <div>
      <div id="gauge-chart"></div>
      <Button
        sx={{ marginTop: "10px" }}
        type="submit"
        variant="contained"
        color="primary"
        onClick={() => generateCreditReportPDF(userData)}
      >
        Download Credit Report
      </Button>
    </div>
  );
}
