"use client";
import Divider from "@mui/material/Divider";
import "./App.css";
import Header from "@/components/Header/Header";
import Form from "@/components/Form/FormContainer";

const App = () => {
  return (
    <div className="app">
      <Header />
      <Divider />
      <Form />
    </div>
  );
};

export default App;
