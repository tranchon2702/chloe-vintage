import "./styles.css";
import { defaultContent } from "./content.js";
import { contactService } from "./services/contact.service.js";
import { contentService } from "./services/content.service.js";

function mergeContent(savedContent) {
  if (!savedContent) return defaultContent;

  return {
    ...defaultContent,
    ...savedContent,
    images: { ...defaultContent.images, ...savedContent.images },
    sections: { ...defaultContent.sections, ...savedContent.sections },
    caseStudies: Array.isArray(savedContent.caseStudies)
      ? savedContent.caseStudies
      : defaultContent.caseStudies,
    translations: {
      vi: { ...defaultContent.translations.vi, ...savedContent.translations?.vi },
      en: { ...defaultContent.translations.en, ...savedContent.translations?.en },
    },
  };
}

async function loadContent() {
  try {
    const document = await contentService.get();
    return mergeContent(document?.content);
  } catch {
    return defaultContent;
  }
}

async function start() {
  const data = await loadContent();
  window.CHLOE_PORTFOLIO = data;

  const root = document.documentElement;
  const body = document.body;
  const languageButton = document.querySelector("[data-language-toggle]");
  const languageCurrent = document.querySelector(".language-current");
  const languageNext = document.querySelector(".language-next");
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  const toast = document.querySelector("[data-toast]");
  const readingProgress = document.querySelector("[data-reading-progress]");
  const caseList = document.querySelector("[data-case-studies]");
  const caseIndex = document.querySelector("[data-case-index]");
  Object.entries(data.sections).forEach(([section, isVisible]) => {
    const node = document.querySelector(`[data-managed-section="${section}"]`);
    if (node) node.hidden = !isVisible;

    if (node?.id) {
      document.querySelectorAll(`a[href="#${node.id}"]`).forEach((link) => {
        link.hidden = !isVisible;
      });
    }
  });

  document.querySelectorAll("[data-image]").forEach((image) => {
    const source = data.images[image.dataset.image];
    if (source) image.src = source;
  });
  document.querySelectorAll("[data-poster-image]").forEach((video) => {
    const source = data.images[video.dataset.posterImage];
    if (source) video.poster = source;
  });
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("video[autoplay]").forEach((video) => {
      video.removeAttribute("autoplay");
      video.pause();
    });
  }
  document
    .querySelector('meta[property="og:image"]')
    ?.setAttribute("content", data.images.social);

  document.querySelectorAll("[data-email-link]").forEach((link) => {
    link.href = `mailto:${data.email}`;
    if (link.hasAttribute("data-email-address")) link.textContent = data.email;
  });

  const chapterLinks = [...document.querySelectorAll("[data-chapter-link]")].filter(
    (link) => !link.hidden,
  );
  const atelierStage = document.querySelector("[data-atelier-stage]");
  const canUseAtelierMotion = window.matchMedia(
    "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
  );
  const chapterTargets = chapterLinks
    .map((link) => document.getElementById(link.dataset.chapterLink))
    .filter(Boolean);
  const storedLanguage = localStorage.getItem("chloe-language");
  let language =
    storedLanguage === "vi" || storedLanguage === "en"
      ? storedLanguage
      : navigator.language.toLowerCase().startsWith("vi")
        ? "vi"
        : "en";
  let toastTimer;
  let readingFrame;
  let atelierFrame;
  let atelierPointer;
  let activeCaseId = data.caseStudies[0]?.id;

  function activateCase(caseId) {
    activeCaseId = caseId;
    caseIndex?.querySelectorAll("[data-case-button]").forEach((button) => {
      const isActive = button.dataset.caseButton === caseId;
      button.classList.toggle("is-active", isActive);
      if (isActive) {
        button.setAttribute("aria-current", "true");
      } else {
        button.removeAttribute("aria-current");
      }
    });
    caseList?.querySelectorAll("[data-case-card]").forEach((card) => {
      const isActive = card.dataset.caseCard === caseId;
      card.hidden = !isActive;
      card.classList.toggle("is-active", isActive);
    });
  }

  function renderCaseStudies(lang) {
    if (!caseList || !caseIndex) return;
    const dictionary = data.translations[lang];
    caseList.replaceChildren();
    caseIndex.replaceChildren();

    if (!data.caseStudies.length) {
      const empty = document.createElement("p");
      empty.className = "case-empty";
      empty.textContent =
        lang === "vi"
          ? "Chưa có tình huống nào được xuất bản."
          : "No scenarios have been published yet.";
      caseList.append(empty);
      return;
    }

    if (!data.caseStudies.some((study) => study.id === activeCaseId)) {
      activeCaseId = data.caseStudies[0].id;
    }

    data.caseStudies.forEach((study, index) => {
      const localized = study[lang];
      const caseNumber = String(index + 1).padStart(2, "0");
      const cardId = `case-${study.id}`;
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.caseButton = study.id;
      button.setAttribute("aria-controls", cardId);
      const number = document.createElement("span");
      number.textContent = caseNumber;
      const buttonCopy = document.createElement("strong");
      buttonCopy.textContent = localized.title;
      button.append(number, buttonCopy);
      button.addEventListener("click", () => activateCase(study.id));
      caseIndex.append(button);

      const card = document.createElement("article");
      card.id = cardId;
      card.className = "case-card";
      card.dataset.caseCard = study.id;
      const top = document.createElement("div");
      top.className = "case-card-top";
      const folio = document.createElement("span");
      folio.className = "case-card-number";
      folio.textContent = caseNumber;
      const eyebrow = document.createElement("p");
      eyebrow.textContent = localized.eyebrow;
      top.append(folio, eyebrow);

      const title = document.createElement("h3");
      title.textContent = localized.title;
      const details = document.createElement("div");
      details.className = "case-details";
      [
        ["challenge", dictionary["cases.challenge"], localized.challenge],
        ["approach", dictionary["cases.approach"], localized.approach],
      ].forEach(([type, label, value]) => {
        const section = document.createElement("section");
        section.className = `case-detail case-detail-${type}`;
        const detailLabel = document.createElement("span");
        detailLabel.textContent = label;
        const copy = document.createElement("p");
        copy.textContent = value;
        section.append(detailLabel, copy);
        details.append(section);
      });

      const outcome = document.createElement("div");
      outcome.className = "case-outcome";
      const outcomeLabel = document.createElement("span");
      outcomeLabel.textContent = dictionary["cases.outcome"];
      const outcomeCopy = document.createElement("p");
      outcomeCopy.textContent = localized.outcome;
      outcome.append(outcomeLabel, outcomeCopy);
      card.append(top, title, details, outcome);
      caseList.append(card);
    });

    activateCase(activeCaseId);
  }

  function setCopy(lang) {
    language = lang;
    const dictionary = data.translations[lang];
    root.lang = lang;
    body.dataset.lang = lang;
    document.title = dictionary["meta.title"];
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", dictionary["meta.description"]);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", dictionary["meta.title"]);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", dictionary["meta.description"]);
    document
      .querySelector('meta[name="twitter:title"]')
      ?.setAttribute("content", dictionary["meta.title"]);
    document
      .querySelector('meta[name="twitter:description"]')
      ?.setAttribute("content", dictionary["meta.description"]);

    document.querySelectorAll("[data-copy]").forEach((node) => {
      const value = dictionary[node.dataset.copy];
      if (value) node.textContent = value;
    });

    document.querySelectorAll("[data-copy-placeholder]").forEach((node) => {
      const value = dictionary[node.dataset.copyPlaceholder];
      if (value) node.placeholder = value;
    });

    document.querySelectorAll("[data-copy-alt]").forEach((node) => {
      const value = dictionary[node.dataset.copyAlt];
      if (value) node.alt = value;
    });

    document.querySelectorAll("[data-copy-aria]").forEach((node) => {
      const value = dictionary[node.dataset.copyAria];
      if (value) node.setAttribute("aria-label", value);
    });

    renderCaseStudies(lang);
    languageCurrent.textContent = lang.toUpperCase();
    languageNext.textContent = lang === "vi" ? "EN" : "VI";
    languageButton?.setAttribute(
      "aria-label",
      lang === "vi" ? "Switch to English" : "Chuyển sang tiếng Việt",
    );
    localStorage.setItem("chloe-language", lang);
  }

  function closeMenu() {
    menuButton?.setAttribute("aria-expanded", "false");
    mobileNav?.classList.remove("is-open");
    body.classList.remove("menu-open");
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  languageButton?.addEventListener("click", () => {
    setCopy(language === "vi" ? "en" : "vi");
  });

  menuButton?.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    mobileNav?.classList.toggle("is-open", !isOpen);
    body.classList.toggle("menu-open", !isOpen);
  });

  mobileNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  function updateReadingState() {
    readingFrame = undefined;
    const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollRange > 0 ? Math.min(window.scrollY / scrollRange, 1) : 0;
    readingProgress?.style.setProperty("transform", `scaleX(${progress})`);

    const readingLine = window.innerHeight * 0.38;
    let activeId = chapterTargets[0]?.id;

    chapterTargets.forEach((target) => {
      if (target.getBoundingClientRect().top <= readingLine) activeId = target.id;
    });

    chapterLinks.forEach((link) => {
      const isActive = link.dataset.chapterLink === activeId;
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function queueReadingState() {
    if (readingFrame) return;
    readingFrame = window.requestAnimationFrame(updateReadingState);
  }

  window.addEventListener("scroll", queueReadingState, { passive: true });
  window.addEventListener("resize", queueReadingState);

  function renderAtelierPointer() {
    atelierFrame = undefined;
    if (!atelierStage || !atelierPointer || !canUseAtelierMotion.matches) return;

    const bounds = atelierStage.getBoundingClientRect();
    const x = Math.min(Math.max((atelierPointer.clientX - bounds.left) / bounds.width, 0), 1);
    const y = Math.min(Math.max((atelierPointer.clientY - bounds.top) / bounds.height, 0), 1);

    atelierStage.style.setProperty("--light-x", `${(x * 100).toFixed(2)}%`);
    atelierStage.style.setProperty("--light-y", `${(y * 100).toFixed(2)}%`);
    atelierStage.style.setProperty("--photo-rotate-x", `${((0.5 - y) * 5).toFixed(2)}deg`);
    atelierStage.style.setProperty("--photo-rotate-y", `${((x - 0.5) * 7).toFixed(2)}deg`);
    atelierStage.style.setProperty("--copy-shift-x", `${((x - 0.5) * -5).toFixed(2)}px`);
    atelierStage.style.setProperty("--copy-shift-y", `${((y - 0.5) * -3).toFixed(2)}px`);
  }

  function queueAtelierPointer(event) {
    atelierPointer = event;
    if (atelierFrame) return;
    atelierFrame = window.requestAnimationFrame(renderAtelierPointer);
  }

  function resetAtelierPointer() {
    atelierPointer = undefined;
    atelierStage?.style.removeProperty("--light-x");
    atelierStage?.style.removeProperty("--light-y");
    atelierStage?.style.removeProperty("--photo-rotate-x");
    atelierStage?.style.removeProperty("--photo-rotate-y");
    atelierStage?.style.removeProperty("--copy-shift-x");
    atelierStage?.style.removeProperty("--copy-shift-y");
  }

  atelierStage?.addEventListener("pointermove", queueAtelierPointer, { passive: true });
  atelierStage?.addEventListener("pointerleave", resetAtelierPointer);

  document.querySelector("[data-copy-email]")?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(data.email);
      showToast(data.translations[language]["toast.copied"]);
    } catch {
      window.location.href = `mailto:${data.email}`;
    }
  });

  const contactForm = document.querySelector("[data-contact-form]");
  const contactSubmit = contactForm?.querySelector("[data-contact-submit]");
  const contactSubmitCopy = contactSubmit?.querySelector("[data-copy]");
  const contactStatus = contactForm?.querySelector("[data-contact-status]");

  contactForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    contactSubmit.disabled = true;
    contactForm.setAttribute("aria-busy", "true");
    contactSubmitCopy.textContent = data.translations[language]["contact.form.sending"];
    contactStatus.textContent = "";
    contactStatus.className = "form-status";

    try {
      await contactService.send(Object.fromEntries(new FormData(contactForm)));
      contactForm.reset();
      contactStatus.textContent = data.translations[language]["contact.form.success"];
      contactStatus.classList.add("is-success");
    } catch {
      contactStatus.textContent = data.translations[language]["contact.form.error"];
      contactStatus.classList.add("is-error");
    } finally {
      contactSubmit.disabled = false;
      contactForm.removeAttribute("aria-busy");
      contactSubmitCopy.textContent = data.translations[language]["contact.form.submit"];
    }
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    document.querySelectorAll(".reveal").forEach((node, index) => {
      node.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
      revealObserver.observe(node);
    });

    const salesSteps = [...document.querySelectorAll("[data-sales-step]")];
    salesSteps[0]?.classList.add("is-active");
    const salesStepObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          salesSteps.forEach((step) => step.classList.toggle("is-active", step === entry.target));
        });
      },
      { rootMargin: "-32% 0px -48% 0px", threshold: 0.1 },
    );
    salesSteps.forEach((step) => {
      salesStepObserver.observe(step);
      const activate = () => {
        salesSteps.forEach((candidate) =>
          candidate.classList.toggle("is-active", candidate === step),
        );
      };
      step.addEventListener("pointerenter", activate);
      step.addEventListener("focus", activate);
    });
  } else {
    document.querySelectorAll(".reveal").forEach((node) => node.classList.add("is-visible"));
  }

  document.querySelector("[data-current-year]").textContent = new Date().getFullYear();
  setCopy(language);
  updateReadingState();
}

void start();
