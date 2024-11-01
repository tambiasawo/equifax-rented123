"use client";
import "./Form.css";
import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import {
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Checkbox,
} from "@mui/material";
import AddressField from "./AddressField";
import { getProvinceCode } from "../../utils";
import Speedometer from "../Chart/Chart";
import { checkCreditScore } from "@/actions";

type FormValues = {
  first_name: string;
  last_name: string;
  dob: string;
  unit_number?: string;
  unit_number2?: string;
  street_address: string;
  city: string;
  province_territory: string;
  postal_code: string;
  duration_at_address_check: string;
  street_address2?: string;
  city2?: string;
  province_territory2?: string;
  postal_code2?: string;
  privacy_agreement: boolean;
};

const MyForm = () => {
  const [durationCheck, setDurationCheck] = useState("yes");
  const [showModal, setShowModal] = useState(false);
  const [scoreNumber, setScoreNumber] = useState<number | null>();
  const [clientError, setClientError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const initialValues: FormValues = {
    first_name: "",
    last_name: "",
    dob: "",
    unit_number: "",
    unit_number2: "",
    street_address: "",
    city: "",
    province_territory: "",
    postal_code: "",
    duration_at_address_check: "", // Set initial value for the radio group
    street_address2: "",
    city2: "",
    province_territory2: "",
    postal_code2: "",
    privacy_agreement: false,
  };

  useEffect(() => {}, []);

  const handleClose = () => setShowModal(false);

  return (
    <section>
      <Formik
        initialValues={initialValues}
        validate={(values) => {
          const errors: Record<string, string> = {};
          if (!values.first_name || typeof values.first_name !== "string") {
            errors.first_name = "Please enter your first name";
          }
          if (!values.last_name) {
            errors.last_name = "Please enter your last name";
          }
          if (!values.dob) {
            errors.dob = "Please enter your date of birth";
          }
          if (!values.street_address) {
            errors.street_address = "Please enter your street address";
          }
          if (values.street_address.length > 25) {
            errors.street_address =
              "Please enter a real street address or shorten some names";
          }
          if (!values.city) {
            errors.city = "Please enter your city";
          }
          if (!values.province_territory) {
            errors.province_territory = "Please enter your province/territory";
          }
          if (!values.postal_code) {
            errors.postal_code = "Please enter your postal code";
          }
          if (
            values.duration_at_address_check === "no" &&
            !values.street_address2
          ) {
            errors.street_address2 = "Please enter your street address";
          }
          if (
            values.duration_at_address_check === "no" &&
            values.street_address2!.length > 25
          ) {
            errors.street_address2 =
              "Please enter a real street address or shorten some names";
          }
          if (values.duration_at_address_check === "no" && !values.city2) {
            errors.city2 = "Please enter your city";
          }
          if (
            values.duration_at_address_check === "no" &&
            !values.province_territory2
          ) {
            errors.province_territory2 = "Please enter your province/territory";
          }
          if (
            values.duration_at_address_check === "no" &&
            !values.postal_code2
          ) {
            errors.postal_code2 = "Please enter your postal code";
          }
          if (!values.privacy_agreement) {
            errors.privacy_agreement = "You must accept our privacy policy";
          }
          if (!values.duration_at_address_check) {
            errors.duration_at_address_check = "Please select an option";
          }

          return errors; // Return the errors object
        }}
        onSubmit={async (values, { setSubmitting }) => {
          // Handle form submission
          setScoreNumber(null);
          setClientError(null);
          setServerError(null);
          const {
            first_name,
            last_name,
            duration_at_address_check,
            dob,
            street_address,
            street_address2,
            unit_number,
            unit_number2,
          } = values;
          const [street_number, ...rest] = street_address.split(" ");
          const [street_number2, ...rest2] = street_address2!.split(" ");
          const address = `<Address addressType='CURR'>
                <CivicNumber>${street_number}</CivicNumber>
                <StreetName>${rest.join(" ")} ${
            unit_number && "#" + unit_number
          }</StreetName>
                <City>${values.city}</City>
                <Province code="${getProvinceCode(
                  values.province_territory as string
                )}"/>
                <PostalCode>${values.postal_code2}</PostalCode>
              </Address>`;

          const address2 = `<Address addressType='PREV'>
                <CivicNumber>${street_number2}</CivicNumber>
                <StreetName>${rest2.join(" ")} ${
            unit_number2 && "#" + unit_number2
          }</StreetName>
                <City>${values.city2}</City>
                <Province code="${getProvinceCode(
                  values.province_territory2 as string
                )}"/>
                <PostalCode>${values.postal_code2}</PostalCode>
              </Address>`;

          try {
            const response = await fetch("/api/checkCreditScore", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                first_name,
                last_name,
                duration_at_address_check,
                dob,
                address,
                address2,
              }),
            });

            if (!response.ok) {
              console.log("response not ok");
              setServerError("Something unexpected happened. Please try again");
              throw new Error("Failed to fetch credit score");
            }
            const result = await response.text();

            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(
              result as string,
              "application/xml"
            );
            const scoreNode = xmlDoc.getElementsByTagNameNS(
              "http://www.equifax.ca/XMLSchemas/EfxToCust",
              "Value"
            )[0];
            const clientErrorNode = xmlDoc.getElementsByTagNameNS(
              "http://www.equifax.ca/XMLSchemas/EfxToCust",
              "RejectCode"
            )[0];
            const serverErrorNode = xmlDoc.getElementsByTagNameNS(
              "http://www.equifax.ca/XMLSchemas/EfxToCust",
              "Error"
            )[0];
            const clientErrorNode2 = xmlDoc.getElementsByTagNameNS(
              "http://www.equifax.ca/XMLSchemas/EfxToCust",
              "HitCode"
            )[0];

            if (clientErrorNode) {
              setClientError(
                "Sorry we could not find your profile. Please ensure all details are correct"
              );
            } else if (serverErrorNode) {
              setServerError(
                "Something unexpected happened. Please try again later"
              );
            } else if (
              clientErrorNode2.getAttribute("description") === "NO HIT"
            ) {
              setClientError(
                "Sorry we could not find your profile. Please ensure all details are correct"
              );
            } else {
              setScoreNumber(
                Number(scoreNode.textContent?.substring(2) as string)
              );
            }
          } catch (e) {}
          setSubmitting(false); // Reset the submitting state
          setShowModal(true);
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          isSubmitting,
          setFieldValue,
        }) => (
          <Form className="form-container">
            <h2>Complete your Profile</h2>
            <Field
              name="first_name"
              as={TextField}
              label="First Name"
              required
              fullWidth
              margin="normal"
              error={touched.first_name && Boolean(errors.first_name)}
              helperText={touched.first_name && errors.first_name}
              onChange={handleChange}
              onBlur={handleBlur}
              sx={{
                "& .MuiFormHelperText-root.Mui-error": {
                  margin: "3px 0 !important",
                },
              }}
            />
            <Field
              name="last_name"
              as={TextField}
              type="text"
              label="Last Name"
              required
              fullWidth
              margin="normal"
              error={touched.last_name && Boolean(errors.last_name)}
              helperText={touched.last_name && errors.last_name}
              onChange={handleChange}
              onBlur={handleBlur}
              sx={{
                "& .MuiFormHelperText-root.Mui-error": {
                  margin: "3px 0 !important",
                },
              }}
            />

            <Field
              name="dob"
              as={TextField}
              label="Date of Birth"
              required
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              error={touched.dob && Boolean(errors.dob)}
              helperText={touched.dob && errors.dob}
              onChange={handleChange}
              onBlur={handleBlur}
              sx={{
                "& .MuiFormHelperText-root.Mui-error": {
                  margin: "3px 0 !important",
                },
              }}
            />

            <AddressField
              names={[
                "street_address",
                "city",
                "province_territory",
                "postal_code",
                "unit_number",
              ]}
              setFieldValue={setFieldValue}
              touchedFields={{
                unit_number: touched.unit_number,
                city: touched.city,
                province: touched.province_territory,
                street_address: touched.street_address,
                postal_code: touched.postal_code,
              }}
              values={{
                unit_number: values.unit_number as string,
                city: values.city,
                province_territory: values.province_territory,
                postal_code: values.postal_code,
              }}
              errors={{
                unit_number: errors.unit_number,
                city: errors.city,
                province: errors.province_territory,
                street_address: errors.street_address,
                postal_code: errors.postal_code,
              }}
              changeHandler={handleChange}
              blurHandler={handleBlur}
            />

            <FormControl
              component="fieldset"
              margin="normal"
              error={Boolean(
                touched.duration_at_address_check &&
                  errors.duration_at_address_check
              )}
            >
              <FormLabel component="legend" required>
                Have you lived at the above address for more than 2 years?
              </FormLabel>
              <Field name="duration_at_address_check">
                {({
                  field,
                }: {
                  field: {
                    onBlur: () => void;
                    onChange: () => void;
                    value: string;
                    name: string;
                  };
                }) => (
                  <RadioGroup
                    {...field}
                    name="duration_at_address_check"
                    row
                    onChange={(event) => {
                      handleChange(event); // Update Formik's state
                      // Set the value in Formik when the radio button is clicked
                      setFieldValue(
                        "duration_at_address_check",
                        event.target.value
                      );
                      setDurationCheck(event.target.value);
                    }}
                    aria-required
                  >
                    <FormControlLabel
                      value="yes"
                      control={<Radio />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="no"
                      control={<Radio />}
                      label="No"
                      //required
                    />
                  </RadioGroup>
                )}
              </Field>
              {touched.duration_at_address_check &&
                errors.duration_at_address_check && (
                  <p style={{ color: "red" }}>
                    {errors.duration_at_address_check}
                  </p>
                )}
            </FormControl>

            {durationCheck === "no" && (
              <AddressField
                names={[
                  "street_address2",
                  "city2",
                  "province_territory2",
                  "postal_code2",
                  "unit_number2",
                ]}
                values={{
                  city: values.city2 as string,
                  unit_number2: values.unit_number2 as string,
                  province_territory: values.province_territory2 as string,
                  postal_code: values.postal_code2 as string,
                }}
                setFieldValue={setFieldValue}
                touchedFields={{
                  city: touched.city2,
                  unit_number: touched.unit_number2,
                  province: touched.province_territory2,
                  street_address: touched.street_address2,
                  postal_code: touched.postal_code2,
                }}
                errors={{
                  city: errors.city2,
                  unit_number: errors.unit_number2,
                  province: errors.province_territory2,
                  street_address: errors.street_address2,
                  postal_code: errors.postal_code2,
                }}
                changeHandler={handleChange}
                blurHandler={handleBlur}
              />
            )}
            <Field name="privacy_agreement">
              {({
                field,
              }: {
                field: {
                  onBlur: () => void;
                  onChange: () => void;
                  value: boolean;
                  name: string;
                };
              }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field} // Spread field to ensure the Checkbox is connected to Formik
                      checked={field.value} // Set checked based on Formik's value
                      color="primary"
                      required
                    />
                  }
                  label={
                    <span>
                      By checking this box, you agree to us performing a credit
                      check on you and to our
                      <a href="https://rented123.com/privacy-policy/">
                        privacy policy
                      </a>
                    </span>
                  }
                />
              )}
            </Field>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              Check My Score
            </Button>
          </Form>
        )}
      </Formik>

      <Speedometer
        score={scoreNumber as number}
        showModal={showModal}
        handleClose={handleClose}
        error={clientError || serverError}
      />
    </section>
  );
};

export default MyForm;
