function StudioMark() {
  return (
    <a className="studio-mark" href="#top" aria-label="2:47 PM Studio, home">
      <span className="studio-time">2:47<small>PM</small></span>
      <span className="studio-name">STUDIO</span>
    </a>
  );
}

function ApplyButton() {
  return (
    <a className="apply-button" href="#apply" aria-label="Apply to Hacker House Goa">
      <span>Apply</span>
    </a>
  );
}

function SiteHeader() {
  return (
    <header className="site-header">
      <StudioMark />
      <nav className="primary-nav" aria-label="Primary navigation">
        <a className="hype-link" href="#hype">Check hype</a>
        <ApplyButton />
      </nav>
    </header>
  );
}

function HeroTitle() {
  return (
    <h1 className="hero-title" aria-label="Hacker House Goa">
      <span className="title-line">Hacker</span>
      <span className="goa-word" lang="hi" aria-hidden="true">गोवा</span>
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
        <div className="hero-art" aria-hidden="true" />
        <div className="hero-content">
          <div id="hero-heading"><HeroTitle /></div>
          <EventDetails />
        </div>
        <div className="sun-spark spark-one" aria-hidden="true">✦</div>
        <div className="sun-spark spark-two" aria-hidden="true">✦</div>
      </section>
    </main>
  );
}
