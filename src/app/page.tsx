"use client";
import Divider from "@mui/material/Divider";
import "./App.css";
import Form from "@/components/Form/FormContainer";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyTokenFn } from "@/utils";
import React from "react";

const AppContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  React.useEffect(() => {
    const fn = async () => {
      const verify = await verifyTokenFn(token, "equifax");
      if (!verify) {
        router.push("/404");
      }
    };
    fn();
  }, [token, router]);

  return (
    <div className="app">
      <Divider />
      <Form />
    </div>
  );
};

const App = () => {
  return (
    <Suspense>
      <AppContent />
    </Suspense>
  );
};

export default App;
