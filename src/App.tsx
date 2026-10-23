import { useEffect, useState } from "react";
import { chapters, glossary, ui } from "./content/course";
import {
  complete,
  emptyProgress,
  key,
  loadProgress,
  type Progress,
} from "./persistence/progress";
import { Chapter } from "./components/Chapter";
import { localJump } from "./components/navigation";
import { ThemeToggle } from "./components/ThemeToggle";
import { EventFlow } from "./components/EventFlow";

function useRoute() {
  const read = () => window.location.hash.slice(1) || "/";
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const fn = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  return route;
}
export default function App() {
  const route = useRoute();
  const [storageWarning, setStorageWarning] = useState(false);
  const [progress, setProgress] = useState<Progress>(() => {
    try {
      return loadProgress(localStorage);
    } catch {
      return emptyProgress();
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(progress));
    } catch {
      setStorageWarning(true);
    }
  }, [progress]);
  useEffect(() => {
    if (route === "/chapter/1")
      setProgress((p) => (p.viewed ? p : { ...p, viewed: true }));
  }, [route]);
  return (
    <>
      <a className="skip" href="#main" onClick={localJump}>
        Skip to content
      </a>
      <header>
        <a className="brand" href="#/">
          <span className="brand-icon" aria-hidden="true">
            <svg
              width="25"
              height="25"
              viewBox="0 0 28 28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M8 7h7m-7 7h12M8 21h7M8 7v14" />
              <circle cx="8" cy="7" r="3" fill="currentColor" />
              <circle cx="8" cy="14" r="3" fill="currentColor" />
              <circle cx="8" cy="21" r="3" fill="currentColor" />
              <circle cx="19" cy="7" r="3" />
              <circle cx="23" cy="14" r="3" />
              <circle cx="19" cy="21" r="3" />
            </svg>
          </span>
          {ui.brand}
        </a>
        <div className="header-actions">
          <nav aria-label="Main navigation">
            <a
              href="#/roadmap"
              aria-current={route === "/roadmap" ? "page" : undefined}
            >
              Roadmap
            </a>
            <a
              href="#/glossary"
              aria-current={route === "/glossary" ? "page" : undefined}
            >
              Glossary
            </a>
            <a
              href="#/about"
              aria-current={route === "/about" ? "page" : undefined}
            >
              About & references
            </a>
          </nav>
          <ThemeToggle />
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        {storageWarning && (
          <p role="status" className="notice">
            Storage is unavailable. You can keep learning, but progress may not
            persist after refresh.
          </p>
        )}
        {route === "/" ? (
          <>
            <section className="hero">
              <div>
                <p className="eyebrow">YOUR BROWSER. YOUR KAFKA LAB.</p>
                <h1>
                  Understand the flow.
                  <br />
                  <em>One event at a time.</em>
                </h1>
                <p className="lede">
                  Kafka starts with a simple idea: record what happened, then
                  let different systems work at their own pace. Learn why
                  through stories, experiments, and decisions you can test.
                </p>
                <a className="button" href="#/chapter/1">
                  Start chapter 1 <span aria-hidden="true">→</span>
                </a>
                <a className="text-link" href="#/roadmap">
                  Explore the roadmap →
                </a>
                <p className="muted">
                  Free to learn · In your browser · No installation
                </p>
              </div>
              <EventFlow />
            </section>
            <div className="learning-strip">
              <div>
                <span className="strip-icon" aria-hidden="true">
                  01
                </span>
                <div>
                  <strong>
                    {complete(progress)
                      ? "First chapter complete. Keep the ideas fresh."
                      : progress.viewed
                        ? "Pick up where your curiosity left off."
                        : "New to Kafka? You’re in the right place."}
                  </strong>
                  <p>
                    {progress.viewed
                      ? `${progress.experiments.length}/2 models explored · ${progress.missionPassed ? "Mission passed" : "Mission ready to try"}`
                      : "Start with a real problem. Leave with a working mental model."}
                  </p>
                </div>
              </div>
              <a href="#/chapter/1">
                {progress.viewed
                  ? "Continue learning"
                  : "Begin the first chapter"}{" "}
                <span aria-hidden="true">→</span>
              </a>
            </div>
            <section className="section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">YOUR FIRST EXPLORATION</p>
                  <h2>From a shop order to an event stream.</h2>
                </div>
                <span className="pill">Chapter 01 · Available</span>
              </div>
              <div className="three-cards">
                <article>
                  <span className="number">01 / UNDERSTAND</span>
                  <h3>Begin with the problem</h3>
                  <p>
                    What happens when one service is unavailable? Learn events,
                    producers, topics, and consumers from scratch.
                  </p>
                </article>
                <article>
                  <span className="number">02 / EXPERIMENT</span>
                  <h3>Pause a reader</h3>
                  <p>
                    Compare direct delivery with a retained log. Observe what
                    keeps moving and what can catch up.
                  </p>
                </article>
                <article>
                  <span className="number">03 / APPLY</span>
                  <h3>Make a design choice</h3>
                  <p>
                    Keep an online shop running through an analytics outage.
                    Test requirements, then explain your choice.
                  </p>
                </article>
              </div>
            </section>
            <section className="callout">
              <p className="eyebrow">BUILT FOR UNDERSTANDING</p>
              <h2>A clear path from concepts to confidence.</h2>
              <p>
                No account, streaks, or invented scores. Your reading,
                experiment attempts, and mission results are saved separately on
                this device.
              </p>
              <p>
                {complete(progress)
                  ? "Chapter 1 complete."
                  : "Chapter 1 is ready when you are."}
              </p>
            </section>
          </>
        ) : route === "/roadmap" ? (
          <section className="page">
            <p className="eyebrow">THE LEARNING PATH</p>
            <h1>Build understanding in layers.</h1>
            <p className="lede">
              Start with the first complete chapter. The remaining chapters are
              a planned curriculum, open to explore as a roadmap without
              progress gates.
            </p>
            <div className="roadmap">
              {chapters.map(([title, description], i) => (
                <article key={title}>
                  <span className="chapter-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2>
                      {i === 0 ? <a href="#/chapter/1">{title} →</a> : title}
                    </h2>
                    <p>{description}</p>
                    <span className="pill">
                      {i
                        ? "Planned · lesson not yet available"
                        : complete(progress)
                          ? "Complete"
                          : "Available now"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : route === "/chapter/1" ? (
          <Chapter progress={progress} update={setProgress} />
        ) : route === "/glossary" ? (
          <section className="page narrow">
            <p className="eyebrow">PLAIN WORDS, FIRST</p>
            <h1>A small Kafka glossary.</h1>
            <dl>
              {glossary.map(([term, definition]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{definition}</dd>
                </div>
              ))}
            </dl>
            <a href="#/chapter/1">Put these ideas into practice →</a>
          </section>
        ) : route === "/about" ? (
          <section className="page narrow">
            <p className="eyebrow">ABOUT THIS PROJECT</p>
            <h1>Learn by asking “what if?”</h1>
            <p>
              Kafka Learning Lab documents personal learning, demonstrates
              software design, and provides free educational material for people
              new to Kafka. It is an independent project, not an official Apache
              Kafka service or an endorsed project.
            </p>
            <h2>A model you can inspect</h2>
            <p>
              The simulator uses pure state transitions. Diagrams, event logs,
              counts, and grading all read the same state. Playback changes the
              time between steps, not the delivery rules. All timing is an
              educational value, not a Kafka benchmark.
            </p>
            <p>
              {ui.assumptions} Real Kafka has partition-local ordering,
              operational failure modes, retention limits, and delivery
              semantics beyond this chapter. Independent service subscriptions
              correspond to separate consumer groups, not multiple members of
              one group.
            </p>
            <h2>References & verification</h2>
            <p>
              Core retention and independent-consumption concepts were checked
              on October 21, 2026 against the Apache Kafka 4.2.0 tagged design
              source. This is our reference version, not a claim about the
              latest release.
            </p>
            <ul>
              <li>
                <a href="https://github.com/apache/kafka/blob/4.2.0/docs/design/design.md">
                  Apache Kafka 4.2.0: design documentation
                </a>
              </li>
              <li>
                <a href="https://github.com/apache/kafka/blob/4.2.0/docs/getting-started/introduction.md">
                  Apache Kafka 4.2.0: introduction
                </a>
              </li>
            </ul>
            <h2>Privacy & progress</h2>
            <p>
              Progress is stored locally in this browser, with no account or
              cross-device synchronization. Clearing browser storage removes it.
              No analytics or external API is required for learning.
            </p>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Reset all local learning progress? This cannot be undone.",
                  )
                )
                  updateReset();
              }}
            >
              Reset learning progress
            </button>
            <h2>Project status</h2>
            <p>
              Chapter 1 is implemented. Chapters 2–10 are planned. Code and
              educational-content licenses await the owner’s decision; no
              open-source license has yet been granted. All visual assets are
              original CSS and text; no external fonts or image assets are
              loaded.
            </p>
          </section>
        ) : (
          <section className="page">
            <h1>That lesson is not here yet.</h1>
            <a href="#/roadmap">Return to the roadmap →</a>
          </section>
        )}
      </main>
      <footer>
        <span>
          {ui.brand} <span className="muted">/ {ui.tagline}</span>
        </span>
        <a href="#/about">Model limitations & references</a>
      </footer>
    </>
  );
  function updateReset() {
    setProgress(emptyProgress());
  }
}
