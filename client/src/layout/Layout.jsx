import { Outlet } from 'react-router-dom';
import Header from '../components/header/Header';
import Header2 from '../components/header/Header2';
import Footer from '../components/footer/Footer';
import LocalizedMeta from '../components/i18n/LocalizedMeta';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <LocalizedMeta />

      {/* HEADER */}
      <Header />
      <Header2 />

      <div className="flex flex-1 min-w-0">
        <main className="flex-1 min-w-0 w-full max-w-[1400px] mx-auto px-3 py-3 sm:px-4 sm:py-4">
          <Outlet />
        </main>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
