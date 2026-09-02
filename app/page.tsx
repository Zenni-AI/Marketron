import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SectorMarquee from "@/components/SectorMarquee";
import Services from "@/components/Services";
import Credentials from "@/components/Credentials";
import Capabilities from "@/components/Capabilities";
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
        <SectorMarquee />
        <Services />
        <Credentials />
        <Capabilities />
        <CaseStudy />
        <Reputation />
        <BidSection />
      </main>
      <Footer />
      <StickyCTABar />
    </>
  );
}
