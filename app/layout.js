import {
  Cormorant_Garamond,
  Geist,
  Geist_Mono,
  Manrope,
} from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import { EventActivityProvider } from "@/components/social/EventActivityProvider";
import { auth } from "@/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

export const metadata = {
  title: "SceneMates",
  description: "Find your people. Pick your party. Go together.",
};

export default async function RootLayout({ children }) {
  const session = await auth().catch(() => null);
  const navbarUser = session?.user
    ? { name: session.user.name, image: session.user.image }
    : null;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} ${cormorant.variable} antialiased`}
      >
        <EventActivityProvider authenticated={Boolean(session?.user)}>
          <Navbar user={navbarUser} />
          {children}
        </EventActivityProvider>
      </body>
    </html>
  );
}
