import { generateCreditReportPDF } from "@/actions";
import { useResultCtx } from "@/app/context/resultContext";

type UserData = {
  first_name: string;
  last_name: string;
  dob: string;
  address: string;
  score: number;
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

const saveToS3 = async (
  PDFfile: Blob,
  fileName: string,
  email?: string,
  credit_score?: number
) => {
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
        email,
        credit_score,
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
    } catch (error) {
      console.error("Error generating credit report:", error);
      alert("Error generating credit report. Please try again.");
    }
  };

  return (
    <div>
      <div id="gauge-chart"></div>
      <button
        className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg mt-2"
        type="submit"
        onClick={handleGenerateReport}
      >
        Download Credit Report
      </button>
    </div>
  );
}
