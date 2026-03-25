import Header from "@/components/website/Header";
import Footer from "@/components/website/Footer";

export default function Layout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
