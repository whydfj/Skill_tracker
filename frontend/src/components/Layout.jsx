// frontend/src/components/Layout.jsx
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-cyan-50 to-white">
      <Navbar />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}