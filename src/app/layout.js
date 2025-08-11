import localFont from "next/font/local";
import "./globals.css";
import ClientShell from "../../components/ClientShell";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "RadheShyamExchange",
  description: "Future Proof Exchange App",
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({ children }) {


  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
