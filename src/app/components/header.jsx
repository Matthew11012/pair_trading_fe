"use client";
import Link from "next/link";

export default function Header({ isApiConnected }) {
  return (
    <header>
      <div className="logo">
        <h1>Pair Trading Lab</h1>
      </div>
      <nav>
        <ul>
          <li>
            <Link href="/">Dashboard</Link>
          </li>
          <li>
            <Link href="/create">Create Model</Link>
          </li>
        </ul>
      </nav>
      <div className="api-status">
        API Status:
        <span className={isApiConnected ? "connected" : "disconnected"}>
          {isApiConnected ? "Connected" : "Disconnected"}
        </span>
      </div>
    </header>
  );
}
