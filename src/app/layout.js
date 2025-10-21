import "./globals.css";

export const metadata = {
  title: "RadheShyam Exch",
  description: "Win big, win daily.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{margin:0}}>{children}</body>
    </html>
  );
}