"use server";

export async function get_equifax_token() {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "https://api.equifax.ca/inquiry/1.0/sts",
  });
  const username = "PxTGZ8jpBRqoGW5DhTD2v1tkuAYSFKpK";
  const password = "WXIoDSwmoY3g0afR";
  const authHeader = "Basic " + btoa(`${username}:${password}`);

  const authResponse = await fetch(
    "https://api.uat.equifax.ca/v2/oauth/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: authHeader,
      },
      body,
    }
  );

  // Check if authentication response is successful
  if (!authResponse.ok) {
    const authError = await authResponse.json();
    console.error("Authentication Error:", authError);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Authentication failed",
        details: authError,
      }),
    };
  }
  const token = await authResponse.json();
  return token;
}

export const checkCreditScore = async (
  {
    first_name,
    last_name,
    duration_at_address_check,
    dob,
  }: {
    first_name: string;
    last_name: string;
    duration_at_address_check: string;
    dob: string;
  },
  address: string,
  address2: string | undefined
) => {
  const { access_token } = await get_equifax_token();
  const realname = ` <Subject subjectType="SUBJ">
                          <SubjectName>
                            <LastName>TASSIS</LastName>
                            <FirstName>George</FirstName>
                          </SubjectName>
                          <SocialInsuranceNumber></SocialInsuranceNumber>
                          <DateOfBirth>1980-01-01</DateOfBirth>
                          <Occupation></Occupation>
                        </Subject>`;
  const testname = `<Subject subjectType="SUBJ">
      <SubjectName>
        <LastName>TASSIS</LastName>
        <Fame>George</Fame>
      </SubjectName>
      <SocialInsuranceNumber></SocialInsuranceNumber>
      <DateOfBirth>1980-01-01</DateOfBirth>
      <Occupation></Occupation>
    </Subject>`;
  const xmlData = `
            <?xml version="1.0" encoding="utf-8"?>
              <CNCustTransmitToEfx xmlns="http://www.equifax.ca/XMLSchemas/CustToEfx" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.equifax.ca/XMLSchemas/UAT/CNCustTransmitToEfx.xsd">
                <CNCustomerInfo>
                  <CustomerCode>${process.env.CUSTOMER_CODE}</CustomerCode>
                <CustomerInfo>
                  <CustomerNumber>${
                    process.env.UAT_CUSTOMER_NUMBER
                  }</CustomerNumber>
                  <SecurityCode>${process.env.SECURITY_CODE}</SecurityCode>
                </CustomerInfo>
                </CNCustomerInfo>
                <CNRequests>
                  <CNConsumerRequests>
                    <CNConsumerRequest>
                      <Subjects>
                        ${testname}
                        <Addresses>
                        ${address}
                        ${
                          duration_at_address_check === "no" ? address2 : ""
                        }    
                        </Addresses>
                      </Subjects>
                      <CustomerReferenceNumber>2495</CustomerReferenceNumber>
                      <ECOAInquiryType>I</ECOAInquiryType>
                      <JointAccessIndicator>N</JointAccessIndicator>
                    </CNConsumerRequest>
                  </CNConsumerRequests>
                </CNRequests>
              </CNCustTransmitToEfx>          
            `;
  try {
    const response = await fetch(`${process.env.API_TEST_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded", // Set the content type to XML
        Authorization: `Bearer ${access_token}`,
      },
      body: new URLSearchParams({
        InputSegments: xmlData, // assuming `xmlData` is your XML string
      }),
    });
    if (response.statusText !== "OK") {
      throw new Error("Network response was not ok");
    }
    console.log({ xmlData });
    const result = await response.text(); // Use .xml() if expecting XML response
    console.log({ result });
    return result;
  } catch (error) {
    console.log("Error", error);
  }
};
