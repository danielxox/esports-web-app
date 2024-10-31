import "~/styles/globals.css";
import { type Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { cookies } from "next/headers";
import { GeistSans } from "geist/font/sans";
import { dark } from "@clerk/themes";
import SignInPage from "./sign-in/[[...sign-in]]/page";
import { Sign } from "crypto";

export const metadata: Metadata = {
  title: "Esports App",
  description: "by Daniel",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <ClerkProvider appearance={{ baseTheme: dark }}>
          <SignInPage />
        </ClerkProvider>
      </body>
    </html>
  );
}
