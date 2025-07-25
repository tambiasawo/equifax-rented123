// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        {/* Illustration (optional) */}
        <svg
          className="not-found-illustration"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="32" cy="32" r="30" strokeWidth="4" />
          <line x1="20" y1="20" x2="44" y2="44" strokeWidth="4" />
          <line x1="44" y1="20" x2="20" y2="44" strokeWidth="4" />
        </svg>

        <h1 className="not-found-title">404: Page Not Found</h1>
        <p className="not-found-text">
          Oops! It seems like your token has expired.
        </p>
        <Link
          href="https://rented123.com/product/credit-check/"
          target="_blank"
          className="btn-primary"
        >
          Get a New One
        </Link>
      </div>
    </div>
  );
}
