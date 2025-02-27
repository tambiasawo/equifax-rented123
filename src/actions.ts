type Params = {
  first_name: string;
  last_name: string;
  duration_at_address_check: string;
  dob: string;
};

export async function get_equifax_token() {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "https://api.equifax.ca/inquiry/1.0/sts",
  });

  const username = "nI5kW2LSTe8rgvY0cLjKqkcpFnf47CEL";
  const password = "A1wZjV7bjvGaxiEO";

  const authHeader = "Basic " + btoa(`${username}:${password}`);
  const authResponse = await fetch("https://api.equifax.ca/v2/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: authHeader,
    },
    body,
  });

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
  params: Params,
  address: string,
  address2: string,
  access_token: string
) => {
  const { first_name, last_name, duration_at_address_check, dob } = params;

  const subject = ` <Subject subjectType="SUBJ">
                          <SubjectName>
                            <LastName>${last_name}</LastName>
                            <FirstName>${first_name}</FirstName>
                          </SubjectName>
                          <SocialInsuranceNumber></SocialInsuranceNumber>
                          <DateOfBirth>${dob}</DateOfBirth>
                          <Occupation></Occupation>
                        </Subject>`;
  const xmlData = `
            <?xml version="1.0" encoding="utf-8"?>
              <CNCustTransmitToEfx xmlns="http://www.equifax.ca/XMLSchemas/CustToEfx" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.equifax.ca/XMLSchemas/UAT/CNCustTransmitToEfx.xsd">
                <CNCustomerInfo>
                  <CustomerCode>${process.env.CUSTOMER_CODE}</CustomerCode>
                <CustomerInfo>
                  <CustomerNumber>${
                    process.env.CUSTOMER_NUMBER
                  }</CustomerNumber>
                  <SecurityCode>${process.env.SECURITY_CODE}</SecurityCode>
                </CustomerInfo>
                </CNCustomerInfo>
                <CNRequests>
                  <CNConsumerRequests>
                    <CNConsumerRequest>
                      <Subjects>
                        ${subject}
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
    const response = await fetch(`${process.env.API_PROD_URL}`, {
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
    const result = await response.text(); // Use .xml() if expecting XML response

    return result;
  } catch (error) {
    console.log("An error just occured", error);
  }
};

export const getToken = async (token: string) => {
  try {
    if (!token) {
      return null; // Indicate that there’s no valid token
    }

    const response = await fetch(
      `/api/get-token/?token=${encodeURIComponent(token)}`
    );

    if (!response.ok) {
      return null; // Indicate invalid token
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error occurred while fetching token:", error);
    return null; // Return null if an error occurred
  }
};
