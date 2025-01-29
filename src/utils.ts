"use client";

import { useState, useEffect } from "react";
import { getToken } from "./actions";

export const verifyTokenFn = async (
  token: string | null,
  productToVerify: string
) => {
  const activeToken = await getToken(token as string);
  if (!activeToken) return false;
  if (activeToken.product === productToVerify) return true;

  return false;
};

export const getData = (xmlResult: Document) => {
  const lastName = xmlResult.getElementsByTagNameNS(
    "http://www.equifax.ca/XMLSchemas/EfxToCust",
    "LastName"
  )[0].textContent;
  const firstName = xmlResult.getElementsByTagNameNS(
    "http://www.equifax.ca/XMLSchemas/EfxToCust",
    "FirstName"
  )[0].textContent;
  const dateOfBirth = xmlResult.getElementsByTagNameNS(
    "http://www.equifax.ca/XMLSchemas/EfxToCust",
    "DateOfBirth"
  )[0].textContent;

  const CNEmployments = xmlResult.getElementsByTagNameNS(
    "http://www.equifax.ca/XMLSchemas/EfxToCust",
    "Employer"
  );
  const CNBankruptciesOrActs = xmlResult.getElementsByTagNameNS(
    "http://www.equifax.ca/XMLSchemas/EfxToCust",
    "CNBankruptciesOrActs"
  );
  const CNCollections = xmlResult.getElementsByTagNameNS(
    "http://www.equifax.ca/XMLSchemas/EfxToCust",
    "CNCollections"
  );
  const CNLegalItems = xmlResult.getElementsByTagNameNS(
    "http://www.equifax.ca/XMLSchemas/EfxToCust",
    "CNLegalItems"
  );
  const CNSecuredLoans = xmlResult.getElementsByTagNameNS(
    "http://www.equifax.ca/XMLSchemas/EfxToCust",
    "CNSecuredLoans"
  );
  const CNTrades = xmlResult.getElementsByTagNameNS(
    "http://www.equifax.ca/XMLSchemas/EfxToCust",
    "CNTrades"
  );
  const CNLocalInquiries = xmlResult.getElementsByTagNameNS(
    "http://www.equifax.ca/XMLSchemas/EfxToCust",
    "CNLocalInquiries"
  );
  const CNAddresses = xmlResult.getElementsByTagNameNS(
    "http://www.equifax.ca/XMLSchemas/EfxToCust",
    "CNAddresses"
  );
  let retrievedAddresses,
    retrievedEmployments,
    retrievedBankruptcies,
    retrievedLoans,
    retrievedTrades,
    retrievedLocalInquiries,
    retrievedCollections,
    retrievedLegalItems;
  if (CNAddresses && CNAddresses[0].children.length) {
    retrievedAddresses = retrieveInfo(
      CNAddresses,
      "DateReported",
      "CivicNumber",
      "StreetName",
      "City",
      "Province>code",
      "PostalCode"
    );
  }
  if (CNEmployments.length) {
    retrievedEmployments = Array.from(CNEmployments).map(
      (employment) => employment.textContent
    );
  }
  if (CNBankruptciesOrActs && CNBankruptciesOrActs[0]?.children.length) {
    retrievedBankruptcies = retrieveInfo(
      CNBankruptciesOrActs,
      "DateFiled",
      "CaseNumberAndTrustee",
      "Type>description",
      "IntentOrDisposition>description",
      "LiabilityAmount",
      "AssetAmount"
    );
  }
  if (CNLocalInquiries && CNLocalInquiries[0]?.children.length) {
    retrievedLocalInquiries = retrieveInfo(
      CNLocalInquiries,
      "CNLocalInquiry-date",
      "CustomerNumber",
      "Name",
      "AreaCode",
      "Number"
    );
  }
  if (CNCollections && CNCollections[0]?.children.length) {
    retrievedCollections = retrieveInfo(
      CNCollections,
      "CNCollection-description",
      "CustomerNumber",
      "Name",
      "AssignedDate",
      "AccountNumberAndOrName",
      "Reason>description",
      "BalanceAmount",
      "OriginalAmount",
      "DateOfLastPayment"
    );
  }
  if (CNSecuredLoans && CNSecuredLoans[0]?.children.length) {
    retrievedLoans = retrieveInfo(
      CNSecuredLoans,
      "DateFiled",
      "CustomerNumber",
      "Name",
      "NameAddressAndAmount",
      "Industry>description",
      "MaturityDate"
    );
  }
  if (CNLegalItems && CNLegalItems[0]?.children.length) {
    retrievedLegalItems = retrieveInfo(
      CNLegalItems,
      "CNLegalItem-description",
      "DateFiled",
      "Amount",
      "Defendant",
      "Plaintiff",
      "LawyerNameAddress"
    );
  }
  if (CNTrades && CNTrades[0]?.children.length) {
    retrievedTrades = retrieveInfo(
      CNTrades,
      "DateReported",
      "HighCreditAmount",
      "PaymentTermAmount",
      "BalanceAmount",
      "PastDueAmount",
      "MonthsReviewed",
      "DateOpened",
      "DateLastActivityOrPayment",
      "PortfolioType>description",
      "PaymentRate>description"
    );
  }

  return {
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
  };
};

export const retrieveInfo = (xmlElement: HTMLCollection, ...args: string[]) => {
  const retrievedInfo = Array.from(xmlElement[0].children).reduce(
    (acc:Array<any>, curr) => {
      const tempObj: Record<string, any> = {};

      args.map((arg) => {
        if (arg.includes(">")) {
          const splitArgs = arg.split(">");
          const element = curr
            .querySelector(splitArgs[0])
            ?.getAttribute(splitArgs[1]) as string;

          tempObj[splitArgs.join("_")] = element;
        } else if (arg.includes("-")) {
          const splitArgs = arg.split("-");
          const element = curr.getAttribute(splitArgs[1]) as string;
          tempObj[splitArgs.join("_")] = element;
        } else {
          const element = curr.querySelector(arg)?.textContent as string;
          tempObj[arg] = element;
        }
      });
      acc.push(tempObj);

      return acc;
    },
    []
  );
  return retrievedInfo;
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setIsMobile(checkIsMobile);
  }, []);

  return isMobile;
};

export default useIsMobile;

export const provinces = [
  { label: "Alberta", value: "Alberta" },
  { label: "British Columbia", value: "British Columbia" },
  { label: "Manitoba", value: "Manitoba" },
  { label: "New Brunswick", value: "New Brunswick" },
  { label: "Newfoundland and Labrador", value: "Newfoundland and Labrador" },
  { label: "Northwest Territories", value: "Northwest Territories" },
  { label: "Nova Scotia", value: "Nova Scotia" },
  { label: "Nunavut", value: "Nunavut" },
  { label: "Ontario", value: "Ontario" },
  { label: "Prince Edward Island", value: "Prince Edward Island" },
  { label: "Québec", value: "Québec" },
  { label: "Saskatchewan", value: "Saskatchewan" },
  { label: "Yukon", value: "Yukon" },
];

export const getProvinceCode = (province_territory: string) => {
  let province_code;
  switch (province_territory) {
    case "Alberta":
      province_code = "AB";
      break;
    case "British Columbia":
      province_code = "BC";
      break;
    case "Manitoba":
      province_code = "MB";
      break;
    case "New Brunswick":
      province_code = "NB";
      break;
    case "Newfoundland and Labrador":
      province_code = "NL";
      break;
    case "Northwest Territories":
      province_code = "NT";
      break;
    case "Nova Scotia":
      province_code = "NS";
      break;
    case "Nunavut":
      province_code = "NU";
      break;
    case "Ontario":
      province_code = "ON";
      break;
    case "Prince Edward Island":
      province_code = "PE";
      break;
    case "Québec":
      province_code = "QC";
      break;
    case "Saskatchewan":
      province_code = "SK";
      break;
    case "Yukon":
      province_code = "YT";
      break;
    default:
      province_code = ""; // or you can throw an error or return null if the province is not found
  }
  return province_code;
};

export const logoImage =
  "data:image/png;base64,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";
