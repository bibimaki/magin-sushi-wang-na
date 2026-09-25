import "./globals.css";

export const metadata = {
  title: "ซูชิวังหน้า",
  description: "QR Ordering & Real-time Order Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
