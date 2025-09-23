import "@/globals.css";
import ClientShell from "@components/ClientShell";

export const metadata = {
  title: "Admin Panel",
  icons: {
    icon: '/favicon.png',
  },
};

export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
