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

async function getNumber() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/getNum`,
    { cache: "no-store" } // prevent caching
  );

  if (!res.ok) throw new Error("Failed to fetch phone number");

  const data = await res.json();
  return data.data.phone;
}

export default async function RootLayout({ children }) {

  const no = await getNumber();

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ClientShell number={no}>{children}</ClientShell>
      </body>
    </html>
  );
}
