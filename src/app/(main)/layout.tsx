import "~/styles/globals.css";
import { type Metadata } from "next";
import { cookies } from "next/headers";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { GeistSans } from "geist/font/sans";

export const metadata: Metadata = {
  title: "Rogue App",
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable}`}
    >
      <body>
        <ClerkProvider appearance={{ baseTheme: dark }}>
          <SidebarProvider>
            <div className="absolute right-0 px-2 pt-2">
              <UserButton />
            </div>
            <AppSidebar />
            <main className="flex-1 overflow-auto">
              <div className="main-content h-full overflow-auto bg-white px-0 pt-3">
                <SidebarTrigger />
                {children}
              </div>
            </main>
          </SidebarProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
