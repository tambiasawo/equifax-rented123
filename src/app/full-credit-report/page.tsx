"use client";
import Form from "../../components/Form/FormContainer";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyTokenFn } from "@/utils";
import { CircularProgress } from "@mui/material";
import { ResultCtxProvider } from "../context/resultContext";

const page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [userIsVerified, setIsUserVerified] = React.useState(true);

  const fn = async () => {
    const isVerified = await verifyTokenFn(token, "full-credit-report"); //full-credit-report

    if (!isVerified) {
      router.push("/404");
    }
    setIsUserVerified(isVerified);
  };

  React.useEffect(() => {
   // fn();
  }, [fn]);

  return (
    <div>
      {userIsVerified ? (
        <ResultCtxProvider>
          <Form showFullReport={true} />{" "}
        </ResultCtxProvider>
      ) : (
        <div
          style={{
            display: "flex",
            marginTop: "40px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {" "}
          <CircularProgress />
        </div>
      )}
    </div>
  );
};

export default page;