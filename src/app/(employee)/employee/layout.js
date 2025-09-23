import "@/globals.css";
import ClientShell from "@components/ClientShell";

export const metadata = {
  title: "Employee Panel",
  icons: {
    icon: '/favicon.png',
  },
};

export default function EmployeeLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
