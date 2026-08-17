(function () {
  const data = window.CHLOE_PORTFOLIO;
  if (!data) return;

  const root = document.documentElement;
  const body = document.body;
  const languageButton = document.querySelector("[data-language-toggle]");
  const languageCurrent = document.querySelector(".language-current");
  const languageNext = document.querySelector(".language-next");
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  const toast = document.querySelector("[data-toast]");
  const storedLanguage = localStorage.getItem("chloe-language");
  let language =
    storedLanguage === "vi" || storedLanguage === "en"
      ? storedLanguage
      : navigator.language.toLowerCase().startsWith("vi")
        ? "vi"
        : "en";
  let toastTimer;

  function setCopy(lang) {
    language = lang;
    const dictionary = data.translations[lang];
    root.lang = lang;
    body.dataset.lang = lang;
    document.title = dictionary["meta.title"];

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
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(contactForm))),
      });
      const result = await response.json();

      if (!response.ok) {
        const firstError = result.errors && Object.values(result.errors)[0];
        throw new Error(firstError || result.error || "Unable to send message.");
      }

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
  } else {
    document.querySelectorAll(".reveal").forEach((node) => node.classList.add("is-visible"));
  }

  document.querySelector("[data-current-year]").textContent = new Date().getFullYear();
  setCopy(language);
})();
