"use client";
import Divider from "@mui/material/Divider";
import "./App.css";
import Form from "@/components/Form/FormContainer";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyTokenFn } from "@/utils";
import React from "react";

const App = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const fn = async () => {
    const verify = await verifyTokenFn(token, "equifax");
    if (!verify) {
      router.push("/404");
    }
  };

  React.useEffect(() => {
    fn();
  }, []);

  return (
    <div className="app">
      <Divider />
      <Suspense>
        <Form />
      </Suspense>
    </div>
  );
};

export default App;
