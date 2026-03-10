import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
return (
  <div>
    <Header />
    <div style={{ display: "flex" }}>
      <Sidebar />
      <main style={{ flexGrow: 1 }} className="p-4">
        {children}
      </main>
    </div>
  </div>
);
}
