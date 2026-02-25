document.addEventListener("DOMContentLoaded", () => {
  const burger   = document.getElementById("burger");
  const navLinks = document.getElementById("nav-links");
  const links    = navLinks ? navLinks.querySelectorAll("a[href^='#']") : [];
  const navbar   = document.querySelector(".nav-fixed"); 

  if (burger && navLinks) {
    function openMenu() {
      navLinks.classList.add("active");
      document.body.classList.add("menu-open");
      burger.setAttribute("aria-expanded", "true");
    }
    function closeMenu() {
      navLinks.classList.remove("active");
      document.body.classList.remove("menu-open");
      burger.setAttribute("aria-expanded", "false");
    }
    function toggleMenu() {
      navLinks.classList.contains("active") ? closeMenu() : openMenu();
    }

    burger.addEventListener("click", toggleMenu);

    document.addEventListener("click", (e) => {
      if (!navLinks.classList.contains("active")) return;
      const inside = navLinks.contains(e.target) || burger.contains(e.target);
      if (!inside) closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navLinks.classList.contains("active")) closeMenu();
    });

    links.forEach(a => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        const target = id ? document.querySelector(id) : null;
        if (target) {
          e.preventDefault();

          const navHeight = navbar ? navbar.offsetHeight : 0;
          const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;

          window.scrollTo({
            top: elementPosition - navHeight,
            behavior: "smooth"
          });

          closeMenu();
        }
      });
    });

    const MQ = 767;
    window.addEventListener("resize", () => {
      if (window.innerWidth > MQ) closeMenu();
    });
  }

  const track    = document.querySelector(".gal-track");
  const prevBtn  = document.querySelector(".gal-prev");
  const nextBtn  = document.querySelector(".gal-next");

  if (track) {
    const originalSlides = Array.from(track.children);
    if (originalSlides.length > 0) {
      const clonesBefore = originalSlides.slice(-2).map(sl => sl.cloneNode(true));
      const clonesAfter  = originalSlides.slice(0, 2).map(sl => sl.cloneNode(true));
      clonesBefore.forEach(c => track.prepend(c));
      clonesAfter.forEach(c  => track.append(c));

      const allSlides = Array.from(track.children);

      function stepWidth() {
        const w = allSlides[0].getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        return w + gap;
      }

      let index = 2;
      let isAnimating = false;

      function jumpTo(i) {
        track.style.transition = "none";
        track.style.transform = `translateX(${-i * stepWidth()}px)`;
      }
      function animateTo(i) {
        track.style.transition = "transform .35s ease";
        track.style.transform = `translateX(${-i * stepWidth()}px)`;
      }

      function goNext() {
        if (isAnimating) return;
        isAnimating = true;
        index++;
        animateTo(index);
        track.addEventListener("transitionend", () => {
          if (index >= allSlides.length - 2) {
            index = 2;
            jumpTo(index);
          }
          isAnimating = false;
        }, { once: true });
      }

      function goPrev() {
        if (isAnimating) return;
        isAnimating = true;
        index--;
        animateTo(index);
        track.addEventListener("transitionend", () => {
          if (index < 2) {
            index = originalSlides.length + 1;
            jumpTo(index);
          }
          isAnimating = false;
        }, { once: true });
      }

      jumpTo(index);

      if (nextBtn) nextBtn.addEventListener("click", goNext);
      if (prevBtn) prevBtn.addEventListener("click", goPrev);

      window.addEventListener("resize", () => jumpTo(index));
    }
  }
});
