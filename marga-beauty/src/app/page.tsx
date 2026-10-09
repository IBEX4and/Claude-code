import { About } from "@/components/About";
import { Booking } from "@/components/booking/Booking";
import { Drainage } from "@/components/Drainage";
import { Experience } from "@/components/Experience";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Manifesto } from "@/components/Manifesto";
import { Nav } from "@/components/Nav";
import { Preloader } from "@/components/Preloader";
import { Process } from "@/components/Process";
import { Services } from "@/components/Services";
import { Technologies } from "@/components/Technologies";

export default function Home() {
  return (
    <Experience>
      <noscript>
        <style>{`.preloader{display:none!important}`}</style>
      </noscript>
      <Preloader />
      <Nav />
      <main>
        <Hero />
        <Manifesto />
        <Services />
        <Technologies />
        <Drainage />
        <About />
        <Process />
        <Booking />
      </main>
      <Footer />
    </Experience>
  );
}
