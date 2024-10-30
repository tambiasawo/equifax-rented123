import { NextResponse } from "next/server";
import { checkCreditScore, get_equifax_token } from "@/actions";

export async function POST(req: Request) {
  const {
    first_name,
    last_name,
    duration_at_address_check,
    dob,
    address,
    address2,
  } = await req.json();

  try {
    // Fetch access token
    const { access_token } = await get_equifax_token();

    // Run credit score check with token and get the XML response
    const xmlResult = await checkCreditScore(
      { first_name, last_name, duration_at_address_check, dob },
      address,
      address2,
      access_token
    );

    // Return the XML response directly
    const res = new Response(xmlResult, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
      },
    });
    /*     const result = await parseStringPromise(xmlResponse);

    const score =
      result.EfxTransmit.EfxReport[0].CNConsumerCreditReports[0]
        .CNConsumerCreditReport[0].CNHeader[0].Request[0].Value[0];
    const clientError =
      result.EfxTransmit.EfxReport[0].CNConsumerCreditReports[0]
        .CNConsumerCreditReport[0].CNHeader[0].Request[0].RejectCode;
    const serverError =
      result.EfxTransmit.EfxReport[0].CNConsumerCreditReports[0]
        .CNConsumerCreditReport[0].CNHeader[0].Request[0].Error;

    return NextResponse.json({ score, clientError, serverError });
   */
    console.log(res);
    return res;
  } catch (error: any) {
    console.error("Error in credit score check:", error);

    // Return an error message in XML format
    const errorXml = `<error><message>Error fetching credit score</message><details>${error.message}</details></error>`;
    return new Response(errorXml, {
      status: 500,
      headers: {
        "Content-Type": "application/xml",
      },
    });
  }
}
