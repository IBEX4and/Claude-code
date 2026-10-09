import { BenefitsBlur } from "@/components/BenefitsBlur";
import { BookingModal } from "@/components/booking/BookingModal";
import { Experience } from "@/components/Experience";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Showcase } from "@/components/Showcase";
import { Specialties } from "@/components/Specialties";
import { Steps } from "@/components/Steps";
import { TechScroller } from "@/components/TechScroller";
import { WhyUs } from "@/components/WhyUs";

export default function Home() {
  return (
    <Experience>
      <Header />
      <main>
        <Hero />
        <Showcase />
        <WhyUs />
        <TechScroller />
        <Specialties />
        <BenefitsBlur />
        <Steps />
        <Faq />
      </main>
      <Footer />
      <BookingModal />
    </Experience>
  );
}
