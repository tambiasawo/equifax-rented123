// pages/404.js

import Link from "next/link";

const Custom404 = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
        margin: "40px auto",
        maxWidth: "80%",
      }}
    >
      <h1 style={{ color: "red" }}>Page Not Found</h1>
      <p style={{ lineHeight: "1.6" }}>
        We are sorry, but the page you&apos;re looking for doesn&apos;t exist,
        or the link is invalid. If your access token has expired, you can
        purchase the product again by clicking{" "}
        <Link
          href="https://rented123.com/product/equifax-credit-check/"
          target="_blank"
        >
          here
        </Link>
        .
      </p>
    </div>
  );
};

export default Custom404;
