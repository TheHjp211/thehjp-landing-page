/* ==========================================================================
   INTRO SCREEN — Scroll-Driven Split Curtain Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function initIntroScreen() {
  const introScreen = document.getElementById('introScreen');
  if (!introScreen) return; // Not on homepage — skip

  const panelLeft   = document.getElementById('introPanelLeft');
  const panelRight  = document.getElementById('introPanelRight');
  const enterBtn    = document.getElementById('introEnterBtn');
  const introCenter = document.getElementById('introCenter');

  // Mark body so CSS can push main content below intro zone
  document.body.classList.add('has-intro');

  /*
   * SPLIT_RANGE = 100vh: one full scroll equals one full viewport height.
   * This syncs with `body.has-intro #main-content { padding-top: 100vh }`
   * so the hero section sits exactly at the viewport top when intro finishes.
   */
  let SPLIT_RANGE = window.innerHeight;
  window.addEventListener('resize', () => {
    SPLIT_RANGE = window.innerHeight;
  });

  let rafId        = null;
  let animStopped  = false;
  let isDismissed  = false;

  /* ── Core render function ───────────────────────────── */
  function renderIntro() {
    rafId = null;
    const scrollY  = window.scrollY;

    // If dismissed via Explore button, don't interfere until scrolled to top
    if (isDismissed && scrollY > 50) return;
    if (isDismissed && scrollY <= 10) {
      isDismissed = false;
      introScreen.style.display = 'block';
      introScreen.style.visibility = 'visible';
    }

    // Accelerate split so panels fully clear by 65% of the intro zone
    const rawProgress = Math.min(Math.max(scrollY / (SPLIT_RANGE * 0.65), 0), 1);

    // Stop the CSS entrance animation the moment user scrolls
    if (!animStopped && scrollY > 0) {
      introCenter.style.animation = 'none';
      animStopped = true;
    }

    // ── Move panels ──
    const pct = rawProgress >= 0.98 ? 105 : rawProgress * 105;
    panelLeft.style.transform  = `translateX(${-pct}%)`;
    panelRight.style.transform = `translateX(${pct}%)`;

    // ── Fade & hide center UI (name + button) ──
    const centerOpacity = Math.max(0, 1 - rawProgress * 2.8);
    introCenter.style.opacity    = String(centerOpacity);
    introCenter.style.visibility = centerOpacity <= 0 ? 'hidden' : 'visible';

    // ── Complete dismissal when scrolled into hero ──
    if (rawProgress >= 0.95 || scrollY >= SPLIT_RANGE * 0.7) {
      introScreen.style.pointerEvents = 'none';
      introScreen.style.visibility = 'hidden';
      introScreen.style.display = 'none';
    } else {
      introScreen.style.display = 'block';
      introScreen.style.visibility = 'visible';
      introScreen.style.pointerEvents = rawProgress >= 0.5 ? 'none' : 'auto';
    }
  }

  /* ── Scroll listener (rAF-throttled) ───────────────── */
  function onScroll() {
    if (rafId) return;
    rafId = requestAnimationFrame(renderIntro);
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // Initial render (handles hard-reload at non-zero scroll position)
  renderIntro();

  /* ── "Khám phá" button: decisive animated split and scroll to hero ── */
  if (enterBtn) {
    enterBtn.addEventListener('click', () => {
      isDismissed = true;
      // Animate panels cleanly off-screen
      panelLeft.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)';
      panelRight.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)';
      panelLeft.style.transform = 'translateX(-105%)';
      panelRight.style.transform = 'translateX(105%)';
      introCenter.style.transition = 'opacity 0.25s ease';
      introCenter.style.opacity = '0';
      introCenter.style.visibility = 'hidden';

      // Smooth scroll exactly to SPLIT_RANGE (top of hero)
      window.scrollTo({ top: SPLIT_RANGE, behavior: 'smooth' });

      setTimeout(() => {
        introScreen.style.display = 'none';
        introScreen.style.visibility = 'hidden';
        introScreen.style.pointerEvents = 'none';
        panelLeft.style.transition = '';
        panelRight.style.transition = '';
      }, 600);
    });
  }

  /* ── Keyboard shortcuts ─────────────────────────────── */
  window.addEventListener('keydown', (e) => {
    if (window.scrollY >= SPLIT_RANGE) return; // panels already open
    if (['Enter', ' ', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      if (enterBtn) enterBtn.click();
      else window.scrollTo({ top: SPLIT_RANGE, behavior: 'smooth' });
    }
    if (e.key === 'ArrowUp' && window.scrollY > 0) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
});


/* ==========================================================================
   THEHJP GLOBAL SCRIPTS (MULTI-PAGE ARCHITECTURE)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header scroll state
  const header = document.querySelector('.site-header');
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // 2. Active Page Link Detection
  const currentPath = window.location.pathname.toLowerCase();
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const cleanHref = href.split('#')[0].toLowerCase();
    
    // Check match
    if (
      (cleanHref === 'index.html' && (currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath === '')) ||
      (cleanHref !== 'index.html' && currentPath.endsWith(cleanHref))
    ) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 3. Mobile Navigation Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileNav = document.querySelector('.mobile-nav-drawer');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      mobileNav.classList.toggle('active');
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
      });
    });
  }

  // 4. Auto-select service in Contact form from URL query (?service=marketing / filmmaking / both)
  const serviceSelect = document.getElementById('userService');
  if (serviceSelect) {
    const urlParams = new URLSearchParams(window.location.search);
    const requestedService = urlParams.get('service');
    if (requestedService && ['marketing', 'filmmaking', 'both'].includes(requestedService)) {
      serviceSelect.value = requestedService;
    }
  }

  // 5. Showreel Video Modal Handler
  const showreelTriggers = document.querySelectorAll('.open-showreel-btn, .viewfinder-card');
  const videoModal = document.getElementById('videoModal');
  const closeModalBtn = document.querySelector('.video-modal-close');
  const canvas = document.getElementById('reelCanvas');

  let animationId = null;

  function startCanvasAnimation() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 960;
    canvas.height = 540;

    let frame = 0;
    const render = () => {
      frame++;
      
      // Draw background cinematic gradient
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      const shift = Math.sin(frame * 0.02) * 20;
      grad.addColorStop(0, '#0a0a0a');
      grad.addColorStop(0.5, '#19120c');
      grad.addColorStop(1, '#080808');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle cinematic light beam
      const beamGrad = ctx.createRadialGradient(
        canvas.width * 0.5 + shift * 2, canvas.height * 0.4, 10,
        canvas.width * 0.5, canvas.height * 0.5, 380
      );
      beamGrad.addColorStop(0, 'rgba(236, 61, 16, 0.45)');
      beamGrad.addColorStop(0.4, 'rgba(255, 120, 40, 0.15)');
      beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Letterbox bars 2.39:1
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, 36);
      ctx.fillRect(0, canvas.height - 36, canvas.width, 36);

      // Central Reel Title
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 42px Anton, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('THEHJP · CINEMATIC SHOWREEL', canvas.width / 2, canvas.height / 2 - 10);
      
      ctx.fillStyle = '#EC3D10';
      ctx.font = '600 16px Inter, sans-serif';
      ctx.fillText('DIRECTOR & MARKETER · HIGHLIGHT REEL 2026', canvas.width / 2, canvas.height / 2 + 28);

      // Timecode
      const sec = Math.floor(frame / 30);
      const m = String(Math.floor(sec / 60)).padStart(2, '0');
      const s = String(sec % 60).padStart(2, '0');
      const f = String(frame % 30).padStart(2, '0');
      ctx.font = '13px monospace';
      ctx.fillStyle = '#FF4444';
      ctx.textAlign = 'left';
      ctx.fillText(`● REC [${m}:${s}:${f}] 4K RAW 24FPS`, 24, 24);

      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.textAlign = 'right';
      ctx.fillText('ARRI ALEXA MINI · 35mm ANAMORPHIC', canvas.width - 24, 24);
      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    render();
  }

  function stopCanvasAnimation() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  if (videoModal) {
    showreelTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        videoModal.classList.add('active');
        startCanvasAnimation();
      });
    });

    function safeCloseShowreel() {
      videoModal.classList.remove('active');
      document.body.style.overflow = '';
      const showreelVid = document.getElementById('showreelVideo');
      if (showreelVid) {
        showreelVid.pause();
        showreelVid.currentTime = 0;
      }
      stopCanvasAnimation();
    }

    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', safeCloseShowreel);
    }

    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) {
        safeCloseShowreel();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && videoModal.classList.contains('active')) {
        safeCloseShowreel();
      }
    });
  }

  // 6. Contact Form Submission Handling (Formspree AJAX Integration)
  const contactForm = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');
  const errorMsg = document.getElementById('formError');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      // Determine current language
      const currentLang = localStorage.getItem('thehjp_lang') || 'vi';
      const isVi = currentLang === 'vi';

      submitBtn.disabled = true;
      submitBtn.innerHTML = isVi ? '⏳ Đang gửi thông tin...' : '⏳ Sending inquiry...';

      if (successMsg) successMsg.style.display = 'none';
      if (errorMsg) errorMsg.style.display = 'none';

      try {
        const formData = new FormData(contactForm);

        // Include human-readable service title for clear email formatting
        const serviceSelect = document.getElementById('userService');
        if (serviceSelect && serviceSelect.selectedIndex >= 0) {
          formData.set('dich_vu_chi_tiet', serviceSelect.options[serviceSelect.selectedIndex].text);
        }

        const response = await fetch('https://formspree.io/f/mzezyzab', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          contactForm.reset();
          if (successMsg) {
            successMsg.style.display = 'block';
            successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        } else {
          const data = await response.json().catch(() => null);
          if (errorMsg) {
            if (data && data.errors && data.errors.length > 0) {
              const errDetail = data.errors.map(err => err.message).join(', ');
              errorMsg.textContent = isVi 
                ? `⚠️ Lỗi: ${errDetail}`
                : `⚠️ Error: ${errDetail}`;
            } else {
              errorMsg.textContent = isVi
                ? '⚠️ Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại hoặc gửi trực tiếp qua email: nguyenvanthehiep211@gmail.com'
                : '⚠️ There was an error sending your inquiry. Please try again or email directly to: nguyenvanthehiep211@gmail.com';
            }
            errorMsg.style.display = 'block';
            errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      } catch (err) {
        if (errorMsg) {
          errorMsg.textContent = isVi
            ? '⚠️ Lỗi kết nối mạng. Vui lòng kiểm tra lại kết nối hoặc gửi trực tiếp qua email: nguyenvanthehiep211@gmail.com'
            : '⚠️ Network connection error. Please check your internet or email directly to: nguyenvanthehiep211@gmail.com';
          errorMsg.style.display = 'block';
          errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  // 7. FAQ Accordion Toggle
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        faqItems.forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    }
  });

  // 8. Scroll Reveal Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('section, .service-card, .case-card, .film-card, .process-step-card, .duality-card').forEach(el => {
    observer.observe(el);
  });
});
