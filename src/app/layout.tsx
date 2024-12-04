import "~/styles/globals.css";

export const metadata = {
  title: "Rogue App",
  description: "Rogue Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
