/* eslint-disable @next/next/no-img-element -- the supplied artwork is a direct decorative layer. */
import { StudioMark } from "../components/branding/studio-mark";
import { GoaEnvironment } from "../components/hero/goa-environment";
import { CheckHypeModal } from "../components/interaction/check-hype-modal";
import { CreateIdButton } from "../components/branding/create-id-button";

function SiteHeader() {
  return (
    <header className="site-header">
      <StudioMark />
      <nav className="primary-nav" aria-label="Primary navigation">
        <CheckHypeModal />
        <CreateIdButton />
      </nav>
    </header>
  );
}

function HeroTitle() {
  return (
    <h1 className="hero-title" aria-label="Hacker House Goa">
      <span className="title-line">Hacker</span>
      <img className="goa-wordmark" src="/branding/goa-hindi.svg" alt="" aria-hidden="true" />
      <span className="title-line title-house">House</span>
    </h1>
  );
}

function EventDetails() {
  return (
    <div className="event-copy">
      <p className="manifesto">
        <span>Code</span><i aria-hidden="true" />
        <span>Create</span><i aria-hidden="true" />
        <span>Connect</span><i aria-hidden="true" />
        <span>Repeat</span>
      </p>
      <p className="event-details">
        <span>28–31 Oct 2026</span><i aria-hidden="true" />
        <span>Goa, India</span>
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <main id="top" className="page-shell">
      <SiteHeader />
      <section className="hero" aria-labelledby="hero-heading">
        <GoaEnvironment />
        <div className="hero-content">
          <div id="hero-heading"><HeroTitle /></div>
          <EventDetails />
        </div>
      </section>
    </main>
  );
}
