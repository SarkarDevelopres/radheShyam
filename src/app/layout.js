import localFont from "next/font/local";
import "./globals.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import WhatsAppComp from "../../components/WhatsAppComp";
import MobileNav from "../../components/MobileNav";

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
        <Navbar/>
        <WhatsAppComp/>
        {children}
        <MobileNav/>
        <Footer/>
      </body>
    </html>
  );
}
