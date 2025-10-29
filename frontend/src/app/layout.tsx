// app/layout.tsx
import SocketProvider from "./components/SocketProvider";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
export const metadata = { title: "Job Portal", description: "Real-time job portal" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SocketProvider>
          
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}
