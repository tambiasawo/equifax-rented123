import { NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { logoImage } from "@/utils";

//const AWSInitializer=(service:)
// Load environment variables
const AWS_ACCESS_KEY_ID = process.env.ACCESS_KEY_ID!;
const AWS_SECRET_ACCESS_KEY = process.env.ACCESS_KEY_SECRET!;
const AWS_REGION = process.env.REGION!;

export async function POST(req: Request) {
  const { userDetails, pdfUrl, recipientEmail } = await req.json();
  // Initialize SES client
  const ses = new SESClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });

  const params = {
    Source: "admin@rented123.com",
    Destination: {
      // It's good practice to send a copy to an internal address for monitoring
      ToAddresses: [recipientEmail, "reports@rented123.com"],
    },
    Message: {
      Subject: {
        Data: `Your Rented123 Credit Report is Ready, ${userDetails.first_name}`,
      },
      Body: {
        // Plain text version for email clients that don't render HTML
        Text: {
          Data: `
  Hello ${userDetails.first_name},
  
  Your requested credit report is now available.
  
  You can view your secure report by clicking the link below. Please note that for your security, this link is temporary and will expire shortly.
  
  View Your Report: ${pdfUrl}
  
  If you did not request this report, please contact our support team immediately.
  
  Thank you,
  The Rented123 Team
  https://www.rented123.com
          `,
        },
        // Rich HTML version for modern email clients
        Html: {
          Data: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; }
                .container { width: 100%; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff; }
                .header { text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #e0e0e0; }
                .header img { max-width: 150px; }
                .content { padding: 0 10px; }
                .button-container { text-align: center; margin: 30px 0; }
                .button { display: inline-block; padding: 12px 28px; background-color: #077BFB; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; }
                .footer { font-size: 12px; color: #888888; margin-top: 25px; text-align: center; padding-top: 20px; border-top: 1px solid #e0e0e0;}
                p { margin: 10px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <!-- IMPORTANT: Replace with the actual URL to your logo -->
                  <img src="${logoImage}" alt="Rented123 Logo">
                </div>
                <div class="content">
                  <h2 style="color: #1a202c;">Your Credit Report is Ready</h2>
                  <p>Hello ${userDetails.first_name},</p>
                  <p>As requested, your credit report from Rented123 is now available. For your security, the link below is temporary and will expire in 24 hours.</p>
                  <div class="button-container">
                    <a href="${pdfUrl}" class="button">View Your Secure Report</a>
                  </div>
                  <p>If you did not request this report or have any concerns about your account's security, please contact our support team immediately at admin@rented123.com.</p>
                  <p>Thank you,<br>The Rented123 Team</p>
                </div>
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} Rented123. All rights reserved.</p>
                  <p>2185 Austin Ave., Port Moody, BC, Canada</p>
                </div>
              </div>
            </body>
            </html>
          `,
        },
      },
    },
  };

  try {
    // Send email via SES
    const data = await ses.send(new SendEmailCommand(params));
    console.log("Email sent successfully:", data);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Email sending error:", err);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
