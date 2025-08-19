import { Outlet } from "react-router-dom";
import Header from "../components/Header";

export default function PrivateLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
