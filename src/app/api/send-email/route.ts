import { NextResponse } from "next/server";
import AWS from "aws-sdk";
const AWS_ACCESS_KEY_ID = process.env.ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.ACCESS_KEY_SECRET;
const AWS_REGION = process.env.REGION;

export async function POST(req: Request) {
  AWS.config.update({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION,
  });
  const ses = new AWS.SES({ apiVersion: "2010-12-01" });
  const { userDetails, goodCreditStanding } = await req.json();
  //const pdfBuffer = Buffer.from(PDFfile, "base64"); // Adjust encoding if necessary
  const params = {
    Source: "reports@rented123.com",
    Destination: {
      ToAddresses: ["reports@rented123.com"],
    },
    Message: {
      Subject: {
        Data: goodCreditStanding
          ? `Sufficient Credit Score of ${userDetails.last_name}, ${userDetails.first_name}`
          : `Insufficient Credit Score of ${userDetails.last_name}, ${userDetails.first_name}`,
      },
      Body: {
        Text: {
          Data: `Credit report for ${userDetails.last_name}, ${userDetails.first_name}`,
        },
        Html: {
          Data: ` 
                <p>Name: <b>${userDetails.last_name}</b>, ${userDetails.first_name} </p>
                <p>Date of Birth: ${userDetails.dob} </p>
                <p>Address: ${userDetails.address} </p>
                <p><b>Credit Score: ${userDetails.score}</b></p>`,
        },
      },
    },
  };

  try {
    const data = await ses.sendEmail(params).promise();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
