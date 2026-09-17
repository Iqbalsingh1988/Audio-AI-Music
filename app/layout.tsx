import React from "react";

export const metadata = {
  title: "SonicStudio AI - Music Generator",
  description: "Generate AI Music easily",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
