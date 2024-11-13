"use client";
import Divider from "@mui/material/Divider";
import "./App.css";
import Header from "@/components/Header/Header";
import Form from "@/components/Form/FormContainer";
import { Suspense } from "react";

const App = () => {
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
