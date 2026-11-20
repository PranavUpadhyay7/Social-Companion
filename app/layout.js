import Navbar from "@/components/layout/Navbar";
import { EventActivityProvider } from "@/components/social/EventActivityProvider";
import { auth } from "@/auth";
import "./globals.css";

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
      <body className="antialiased">
        <EventActivityProvider authenticated={Boolean(session?.user)}>
          <Navbar user={navbarUser} />
          {children}
        </EventActivityProvider>
      </body>
    </html>
  );
}
