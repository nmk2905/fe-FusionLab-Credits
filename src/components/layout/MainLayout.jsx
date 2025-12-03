// src/components/layout/MainLayout.jsx
import { motion } from "framer-motion";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";

// MainLayout.jsx
const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <motion.main
        className="flex-grow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children} {/* Render children thay vì Outlet */}
      </motion.main>
      <Footer />
    </div>
  );
};

export default MainLayout;
