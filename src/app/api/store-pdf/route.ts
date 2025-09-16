import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Load environment variables
const AWS_ACCESS_KEY_ID = process.env.ACCESS_KEY_ID!;
const AWS_SECRET_ACCESS_KEY = process.env.ACCESS_KEY_SECRET!;
const AWS_REGION = process.env.REGION!;

export async function POST(req: Request) {
  const { PDFfile, fileName, email, credit_score } = await req.json();
  const pdfBuffer = Buffer.from(PDFfile, "base64");

  // Initialize S3 client
  const s3 = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });

  const params = {
    Bucket: "equifax-credit-check-reports",
    Key: fileName,
    Body: pdfBuffer,
    ContentType: "application/pdf",
    // CORRECTED: Key is 'Metadata' (capital M)
    Metadata: {
      email: email, // Assuming 'email' is already a string
      // CORRECTED: Value MUST be a string
      "credit-score": String(credit_score),
    },
  };

  try {
    // Upload file to S3
    const data = await s3.send(new PutObjectCommand(params));
    console.log("File uploaded successfully:", data);
    return NextResponse.json({
      location: `https://${params.Bucket}.s3.${AWS_REGION}.amazonaws.com/${fileName}`,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
