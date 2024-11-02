"use client";
import { Field, FormikErrors } from "formik";
import { TextField } from "@mui/material";
import { useCallback, useRef } from "react";
import { useJsApiLoader, StandaloneSearchBox } from "@react-google-maps/api";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { provinces } from "../../utils";

type AddressFieldProperties = {
  names: Array<string>;
  touchedFields: { [key: string]: boolean | undefined };
  errors: { [key: string]: string | undefined };
  values: { [key: string]: string };
  changeHandler: (e: React.ChangeEvent<any>) => void;
  blurHandler: (e: React.FocusEvent<any>) => void;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<any>>;
};

const AddressField = ({
  names,
  touchedFields,
  changeHandler,
  blurHandler,
  errors,
  setFieldValue,
  values,
}: AddressFieldProperties) => {
  interface InputRef extends HTMLInputElement {
    getPlaces: () => any;
  }
  const inputRef = useRef<InputRef | null>();
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY as string,
    libraries: ["places"],
    region: "ca",
  });
  const handleOnPlacesChanged = (names: string[]) => {
    let address;
    if (inputRef.current) {
      address = inputRef.current?.getPlaces();
    }
    const addressComponents = address[0].address_components;
    let city, province, postalCode;
    let street_address = "";

    addressComponents.forEach(
      (address: { types: string | string[]; long_name: string }) => {
        if (address.types.includes("street_number")) {
          street_address += address.long_name;
        }
        if (address.types.includes("route")) {
          street_address += " " + address.long_name;
        }
        if (address.types.includes("locality")) {
          city = address.long_name;
        } else if (address.types.includes("administrative_area_level_1")) {
          province = address.long_name;
        } else if (address.types.includes("postal_code")) {
          postalCode = address.long_name;
        }
      }
    );

    setFieldValue(names[0], street_address);
    setFieldValue(names[1], city);
    setFieldValue(names[2], province);
    setFieldValue(names[3], postalCode ?? "");
  };

  const loadHandler = useCallback((ref: any) => {
    inputRef.current = ref;
  }, []);

  return (
    <div>
      <Field
        name={names[4]}
        as={TextField}
        label="Unit Number"
        fullWidth
        value={values.unit_number}
        margin="normal"
        error={touchedFields.unit_number && Boolean(errors.unit_number)}
        helperText={touchedFields.unit_number && errors.unit_number}
        onChange={changeHandler}
        onBlur={blurHandler}
        sx={{
          "& .MuiFormHelperText-root.Mui-error": {
            margin: "3px 0 !important",
          },
        }}
      />
      {isLoaded && (
        <StandaloneSearchBox
          onLoad={loadHandler}
          onPlacesChanged={() => handleOnPlacesChanged(names)}
        >
          <Field
            name={names[0]}
            as={TextField}
            label="Street Address"
            required
            type="address"
            fullWidth
            margin="normal"
            error={
              touchedFields.street_address && Boolean(errors.street_address)
            }
            helperText={touchedFields.street_address && errors.street_address}
            onChange={changeHandler}
            onBlur={blurHandler}
            id="street_address"
            sx={{
              "& .MuiFormHelperText-root.Mui-error": {
                margin: "3px 0 !important",
              },
            }}
          />
        </StandaloneSearchBox>
      )}
      <Field
        name={names[1]}
        as={TextField}
        label="City"
        required
        fullWidth
        margin="normal"
        error={touchedFields.city && Boolean(errors.city)}
        helperText={touchedFields.city && errors.city}
        onChange={changeHandler}
        onBlur={blurHandler}
        sx={{
          marginBottom: "24px !important",
          "& .MuiFormHelperText-root.Mui-error": {
            margin: "3px 0 !important",
          },
        }}
      />

      <Field
        name={names[2]}
        as={Select} // Change from TextField to Select
        // label="Province/Territory"
        required
        fullWidth
        error={
          touchedFields.province_territory && Boolean(errors.province_territory)
        }
        helpertext={
          touchedFields.province_territory && errors.province_territory
        }
        onChange={changeHandler}
        onBlur={blurHandler}
        displayEmpty // Optionally display a placeholder for the empty selection
        renderValue={(selected: string) => {
          if (!selected) {
            return <span>Please select</span>; // Placeholder text
          }
          return selected;
        }}
      >
        {provinces.map((province) => (
          <MenuItem key={province.value} value={province.value}>
            {province.label}
          </MenuItem>
        ))}
      </Field>

      <Field
        name={names[3]}
        as={TextField}
        label="Postal Code"
        required
        fullWidth
        margin="normal"
        error={touchedFields.postal_code && Boolean(errors.postal_code)}
        helperText={touchedFields.postal_code && errors.postal_code}
        onChange={changeHandler}
        onBlur={blurHandler}
        sx={{
          "& .MuiFormHelperText-root.Mui-error": {
            margin: "3px 0 !important",
          },
          marginTop: "24px !important",
        }}
      />
    </div>
  );
};

export default AddressField;
