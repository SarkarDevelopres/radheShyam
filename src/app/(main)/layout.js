import localFont from "next/font/local";
import "@/globals.css";
import ClientShell from "@components/ClientShell";
import MaintainanceScreen from "@components/MaintainanceScreen";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
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

async function checkMaintainance() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_PORT}/api/admin/checkmaintainance`,
    { cache: "no-store" } // prevent caching
  );
  return res;
}


export default async function RootLayout({ children }) {
  let maintainceMode = true;
  let duration = 1;
  let startedAt = null;
  let string = "";
  let heading = "";
  let no = null;
  try {
    no = await getNumber();
    let fetchMaintenanceData = await checkMaintainance();
    let jsonResponse = await fetchMaintenanceData.json();
    console.log(jsonResponse);

    if (jsonResponse.ok) {
      maintainceMode = jsonResponse.isMaintenance;
      if (maintainceMode) {
        duration = jsonResponse.duration;
        startedAt = jsonResponse.startedAt;
        string = jsonResponse.string;
        heading = jsonResponse.heading;
      }
    }
    else{
      maintainceMode = true;
      duration = 12;
      heading= "Maintenance Going On";
      string= "Server is being internally rewrired.";
    }

  } catch (e) {
    console.error("getNumber failed:", e);
    // no stays null; ClientShell can show a fallback
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* {maintainceMode && <MaintainanceScreen duration={duration} startedAt={startedAt} string={string} heading={heading}/>}
        {!maintainceMode && <ClientShell number={no}>{children}</ClientShell>} */}
        <ClientShell number={no}>{children}</ClientShell>
      </body>
    </html>
  );
}
