"use client";
import React, { useState, useEffect } from "react";
import { AlertTitle, Modal, Paper, Tooltip, Typography } from "@mui/material";

import GaugeChart from "react-gauge-chart";
import "./Chart.css";
import DownloadReportButton from "../DownloadCreditReport";
import Accordion from "../Accordion/Accordion";
import { handleGenerateReportforEmail } from "@/actions";
import { useResultCtx } from "@/app/context/resultContext";

const GuageChart = ({
  score,
  showModal,
  handleClose,
  error,
  userData,
  activeToken,
}: {
  score: number;
  showModal: boolean;
  handleClose: () => void;
  userData: any;
  error: string | null;
  activeToken: string;
}) => {
  const { XMLResult } = useResultCtx();
  const normalizedScore = (score - 300) / (900 - 300);
  const [isEmailButtonTouched, setIsEmailButtonTouched] = useState(false);
  const [email, setEmail] = useState("");

  const [emailFeedbackMessage, setEmailFeedbackMessage] = useState<
    null | string
  >(null);

  useEffect(() => {
    const addNumbersToArcs = () => {
      const arc = document.querySelector("g.arc>path");
      if (arc && !arc.querySelector("text")) {
        // Only add if not already present
        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        text.setAttribute("x", "0"); // Adjust x position
        text.setAttribute("y", "-10"); // Adjust y position
        text.setAttribute("fill", "black");
        text.setAttribute("font-size", "16");
        text.setAttribute("text-anchor", "middle");
        text.textContent = "0";

        // Insert the text element before the path
        arc.insertBefore(text, arc.firstChild);
      }
    };

    // Use a timeout to ensure the gauge chart is fully rendered
    const timeoutId = setTimeout(addNumbersToArcs, 100);

    return () => clearTimeout(timeoutId);
  }, [score]); // Only run when score changes, not on every render

  const handleEmailSend = async () => {
    if (!email) return;
    try {
      await handleGenerateReportforEmail(
        { ...userData, score },
        XMLResult as Document,
        email
      );
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsEmailButtonTouched(true);
    } catch (e) {
      console.error("Email sending error:", e);
      setIsEmailButtonTouched(true);
      setEmailFeedbackMessage("Could not send email. Please download.");
    }
  };

  return (
    <Modal
      open={showModal}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div>
        {!error && score !== null ? (
          <Paper
            id="gauge-chart-container"
            className="relative w-[95%] md:w-[80%] mx-auto my-5 p-5 md:p-0 md:py-5 flex flex-col justify-center gap-6 md:gap-8 items-center outline-none"
            elevation={2}
          >
            <GaugeChart
              id="gauge-chart2"
              nrOfLevels={6}
              percent={normalizedScore}
              textColor={
                normalizedScore <= 0.3
                  ? "#FF0000"
                  : normalizedScore <= 0.6
                  ? "#ff6600"
                  : "#00FF00"
              }
              style={{ width: "90%", maxWidth: "400px" }}
              colors={["#FF0000", "#00FF00"]}
              formatTextValue={(value: any) =>
                `${Math.round((value / 100) * 600) + 300}`
              }
            />

            <Tooltip
              title={
                <span style={{ fontSize: "12px", lineHeight: "1.5em" }}>
                  This is the minimum acceptable score to get a credit report.
                </span>
              }
              arrow
            >
              <span className="absolute top-2 right-2 md:top-2 md:right-2 flex items-center gap-1 text-xs md:text-sm">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                Min. Score: 580
              </span>
            </Tooltip>

            <div style={{ padding: "20px", textAlign: "center" }}>
              <div className="block md:hidden">
                <span className="text-sm text-gray-600">Your Credit Score</span>
                <h1 className="text-6xl font-bold"> {score}</h1>
              </div>
              <div className="hidden md:block space-y-2">
                <span className="text-base text-gray-600">
                  Your Credit Score
                </span>
                <h1 className="text-7xl font-bold"> {score}</h1>
              </div>

              <DownloadReportButton
                userData={{ ...userData, score }}
                activeToken={activeToken}
              />
            </div>

            <div className="w-full max-w-md mx-auto px-4 md:px-0">
              {!isEmailButtonTouched ? (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Get Your Report via Email
                    </h3>
                  </div>
                  <div className="flex flex-col sm:flex-row">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-500"
                    />
                    <button
                      onClick={handleEmailSend}
                      disabled={!email}
                      className="bg-blue-600 text-white focus:outline-none py-3 px-6 rounded-r-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg disabled:shadow-none whitespace-nowrap sm:w-auto w-full"
                    >
                      Send
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`rounded-lg p-4 ${
                    !emailFeedbackMessage
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        !emailFeedbackMessage ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    {!emailFeedbackMessage ? (
                      <span className="text-green-700 font-medium">
                        Report sent successfully to {email}
                      </span>
                    ) : (
                      <span className="text-red-700 font-medium">
                        {emailFeedbackMessage}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Paper>
        ) : (
          <div
            style={{
              top: "7%",
              position: "relative",
              width: "80%",
              margin: "20px auto",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              rowGap: "30px",
              alignItems: "center",
              outline: "none",
              background: "white",
              borderRadius: "5px",
            }}
          >
            <AlertTitle sx={{ color: "red" }}>No Record Found</AlertTitle>
            <Typography variant="body1" textAlign={"center"} color="black">
              {error || "Sorry, we could not find your credit profile"}
            </Typography>
            {error !== "Something unexpected happened. Please try again" && (
              <Accordion
                title="Why Am I Seeing this ?"
                content={
                  <ul>
                    <li>You might have entered some details incorrectly</li>
                    <li>
                      You might not have enough credit information to have a
                      credit profile
                    </li>
                    <li>
                      You might be new to the country and do not yet have a
                      credit profile
                    </li>
                  </ul>
                }
              />
            )}
            <Typography
              variant="body2"
              color="textSecondary"
              textAlign={"center"}
            >
              If you believe this is an error, contact{" "}
              <a
                href="mailto:rob@rented123.com"
                style={{ color: "rgba(0, 0, 0, 0.6)" }}
              >
                support
              </a>{" "}
              for assistance.
            </Typography>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default GuageChart;
