"use client";

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
  { label: "Quebec", value: "Quebec" },
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
    case "Quebec":
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
