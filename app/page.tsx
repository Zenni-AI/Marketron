import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import CaseStudy from "@/components/CaseStudy";
import Reputation from "@/components/Reputation";
import BidSection from "@/components/BidSection";
import Footer from "@/components/Footer";
import StickyCTABar from "@/components/StickyCTABar";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <CaseStudy />
        <Reputation />
        <BidSection />
      </main>
      <Footer />
      <StickyCTABar />
    </>
  );
}
