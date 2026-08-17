import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Noto",
  description: "Tasks, projects, notes, and calendar in one workspace.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="dark" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-bg font-sans text-text antialiased">
        {/*
          THESIS: A connected daily workspace, not a dashboard of disconnected widgets.
          OWN-WORLD: Dark charcoal layers (#141414 / #181818), Inter 400/500 at 12/13/14/24, inverted white pills, 26px line icons.
          STORY: Open Noto, see today, capture fast, file into a project later.
          FIRST VIEWPORT: Collapsed-friendly sidebar, greeting + today's focus list, compact task counts, upcoming dates.
          FORM: Operational dark SaaS shell. Seed: user-pinned Inter blueprint.
          FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('noto-theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}`,
          }}
        />
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            className: "!bg-surface !text-text !border-border !text-[13px]",
          }}
        />
      </body>
    </html>
  );
}
