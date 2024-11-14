"use client";
import React, { useEffect } from "react";
import { AlertTitle, Modal, Paper, Tooltip, Typography } from "@mui/material";

import GaugeChart from "react-gauge-chart";
import "./Chart.css";
import DownloadReportButton from "../DownloadCreditReport";
import Accordion from "../Accordion/Accordion";

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
  const normalizedScore = (score - 300) / (900 - 300);
  useEffect(() => {
    const chartContainer = document.getElementById("gauge-chart-container");

    if (chartContainer) {
      // Clear existing marks if any (to avoid duplicates)
      const existingMarks =
        chartContainer.getElementsByClassName("custom-mark");
      const textGroup = chartContainer.querySelector(".text-group");
      const textValue = textGroup?.querySelector("text");
      if (textValue) {
        //  textValue.textContent = `${score}`;
      }

      while (existingMarks.length > 0) {
        existingMarks[0].parentNode?.removeChild(existingMarks[0]);
      }

      // Add minimum, middle, and maximum marks
      const addMark = (value: string, positionClass: string) => {
        const mark = document.createElement("span");
        mark.classList.add("custom-mark", positionClass);
        mark.innerHTML = `<h4>${value}</h4>`;
        chartContainer.appendChild(mark);
      };

      addMark("300", "mark-min"); // Min mark
      addMark("580", "mark-mid"); // Mid mark
      addMark("900", "mark-max"); // Max mark
    }
  }, []);

  return (
    <Modal
      open={showModal}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <div>
        {!error ? (
          <Paper
            id="gauge-chart-container"
            style={{
              top: "7%",
              position: "relative",
              width: "80%",
              margin: "20px auto",
              padding: "20px 0",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              rowGap: "30px",
              alignItems: "center",
              outline: "none",
            }}
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
              style={{ width: "60%" }}
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
              <span
                style={{ position: "absolute", top: "10px", right: "10px" }}
              >
                Min. Score: 580
              </span>
            </Tooltip>

            <div style={{ padding: "20px", textAlign: "center" }}>
              <span className="title-score">Your Credit Score</span>
              <h1> {score}</h1>

              {score !== null && score > 580 && (
                <DownloadReportButton
                  userData={userData}
                  score={score}
                  activeToken={activeToken}
                />
              )}
              {score < 580 && (
                <p style={{ marginTop: "20px" }}>
                  Sorry, your credit score is too low. Please contact us @{" "}
                  <a href="mailto:reports@rented123.com">
                    reports@rented123.com
                  </a>{" "}
                  to help improve your credit
                </p>
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
            <AlertTitle>No Record Found</AlertTitle>
            <Typography variant="body1" textAlign={"center"} color="red">
              {error}
            </Typography>
            {error !== "Something unexpected happened. Please try again" && (
              <Accordion
                title="Why Didn't I Get a Credit Check Result ?"
                content={
                  <ul>
                    <li>You might have entered some details incorrectly</li>
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
