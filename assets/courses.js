(() => {
  const page = document.querySelector('.courses-page');
  if (!page) return;

  // Ajustements de rentrée : conserver la structure existante de la page
  // tout en retirant les contenus obsolètes et en appliquant les nouveaux créneaux.
  page.querySelector('.course-filter a[href="#famille-theatre"]')?.remove();
  page.querySelector('#famille-theatre')?.remove();

  const meditationCardLink = page.querySelector('a[href="/cours/meditation-relaxation-mouvements-elise-suarez/"]');
  const meditationCard = meditationCardLink?.closest('.course-card');
  meditationCard?.querySelectorAll('.course-facts > div').forEach((fact) => {
    const label = fact.querySelector('dt')?.textContent?.trim();
    const value = fact.querySelector('dd');
    if (!value) return;
    if (label === 'Jour') value.textContent = 'Vendredi';
    if (label === 'Horaire') value.textContent = '9h30-10h45';
  });

  const tangoCardLink = page.querySelector('a[href="/cours/tango-argentin-tangosensible/"]');
  const tangoCard = tangoCardLink?.closest('.course-card');
  const tangoPicture = tangoCard?.querySelector('picture');
  const tangoSource = tangoPicture?.querySelector('source');
  const tangoImage = tangoPicture?.querySelector('img');
  if (tangoSource) {
    tangoSource.srcset = '/assets/images/tango-presentation.webp';
    tangoSource.removeAttribute('sizes');
  }
  if (tangoImage) {
    tangoImage.src = '/assets/images/tango-presentation.webp';
    tangoImage.alt = 'Présentation du cours de tango argentin TangoSensible à La Bola à Clisson';
    tangoImage.removeAttribute('width');
    tangoImage.removeAttribute('height');
  }

  const description = 'Cours de yoga, danse, méditation et chant à Clisson : horaires, niveaux, intervenants, tarifs et contacts pour essayer une pratique à La Bola.';
  const metaDescription = document.querySelector('meta[name="description"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (metaDescription) metaDescription.content = description;
  if (ogDescription) ogDescription.content = description;

  document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
    try {
      const data = JSON.parse(script.textContent);

      if (Array.isArray(data['@type']) && data['@type'].includes('LocalBusiness')) {
        if (typeof data.description === 'string') {
          data.description = data.description.replace('théâtre, ', '');
        }
        if (Array.isArray(data.knowsAbout)) {
          data.knowsAbout = data.knowsAbout.filter((item) => item !== 'théâtre enfants');
        }
        script.textContent = JSON.stringify(data);
      }

      if (data['@type'] === 'ItemList' && Array.isArray(data.itemListElement)) {
        data.itemListElement = data.itemListElement
          .filter((item) => !String(item.url || '').includes('/theatre-enfants-'))
          .map((item, index) => ({ ...item, position: index + 1 }));
        script.textContent = JSON.stringify(data);
      }
    } catch (_) {
      // Laisser intact un bloc JSON-LD qui ne serait pas parsable.
    }
  });

  const mobileViewport = window.matchMedia('(max-width: 560px)');
  const groups = [...page.querySelectorAll('.course-group')];
  const familyLinks = [...page.querySelectorAll('.course-filter a[href^="#famille-"]')];
  const filter = page.querySelector('.course-filter');
  const header = document.querySelector('.site-header');
  if (!groups.length) return;

  const groupFromHash = () => groups.find((group) => `#${group.id}` === window.location.hash);
  const initialGroup = groupFromHash() || groups[0];
  const mobileState = new Map(
    groups.map((group) => [group.id, group === initialGroup])
  );
  let scrollFrame = 0;

  const setExpanded = (group, expanded) => {
    const button = group.querySelector('.course-group-toggle');
    const grid = group.querySelector('.practice-grid');
    if (!button || !grid) return;

    button.setAttribute('aria-expanded', String(expanded));
    grid.hidden = !expanded;
  };

  const setContextualFilter = (visible) => {
    if (!filter) return;
    filter.hidden = mobileViewport.matches && !visible;
  };

  const updateScrollHint = () => {
    if (!filter) return;

    const scrollable = filter.scrollWidth > filter.clientWidth + 2;
    const atEnd = filter.scrollLeft + filter.clientWidth >= filter.scrollWidth - 2;
    filter.classList.toggle('is-scrollable', scrollable);
    filter.classList.toggle('is-at-end', !scrollable || atEnd);
  };

  const centerFamilyLink = (link) => {
    if (!filter || !link || !mobileViewport.matches) return;

    filter.scrollTo({
      left: link.offsetLeft - ((filter.clientWidth - link.offsetWidth) / 2),
      behavior: 'smooth'
    });
  };

  const setActiveFamily = (group, center = false) => {
    let activeLink = null;

    familyLinks.forEach((link) => {
      const active = Boolean(group) && link.hash === `#${group.id}`;
      if (active) {
        link.setAttribute('aria-current', 'location');
        activeLink = link;
      } else {
        link.removeAttribute('aria-current');
      }
    });

    if (center) centerFamilyLink(activeLink);
  };

  const openOnly = (selectedGroup) => {
    groups.forEach((group) => {
      const expanded = group === selectedGroup;
      mobileState.set(group.id, expanded);
      setExpanded(group, expanded);
    });
  };

  const syncDesktopFamily = () => {
    if (mobileViewport.matches) return;

    const stickyOffset = (header?.offsetHeight || 0) + (filter?.offsetHeight || 0) + 24;
    let currentGroup = groups[0];

    groups.forEach((group) => {
      if (group.getBoundingClientRect().top <= stickyOffset) currentGroup = group;
    });

    setActiveFamily(currentGroup);
  };

  const requestDesktopSync = () => {
    if (scrollFrame) return;

    scrollFrame = window.requestAnimationFrame(() => {
      scrollFrame = 0;
      syncDesktopFamily();
    });
  };

  const syncViewport = () => {
    if (mobileViewport.matches) {
      groups.forEach((group) => setExpanded(group, mobileState.get(group.id)));
      const expandedGroup = groups.find((group) => mobileState.get(group.id));
      setContextualFilter(Boolean(expandedGroup));
      setActiveFamily(expandedGroup || null, Boolean(expandedGroup));
      window.requestAnimationFrame(updateScrollHint);
      return;
    }

    setContextualFilter(true);
    groups.forEach((group) => setExpanded(group, true));
    requestDesktopSync();
    window.requestAnimationFrame(updateScrollHint);
  };

  page.classList.add('course-accordion-ready');

  groups.forEach((group) => {
    const button = group.querySelector('.course-group-toggle');
    if (!button) return;

    button.addEventListener('click', () => {
      if (!mobileViewport.matches) return;

      const expanded = button.getAttribute('aria-expanded') !== 'true';
      if (expanded) {
        openOnly(group);
        setContextualFilter(true);
        setActiveFamily(group, true);
      } else {
        mobileState.set(group.id, false);
        setExpanded(group, false);
        setContextualFilter(false);
        setActiveFamily(null);
      }
    });
  });

  familyLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const target = groups.find((group) => `#${group.id}` === link.hash);
      if (!target) return;

      if (mobileViewport.matches) openOnly(target);
      setActiveFamily(target, mobileViewport.matches);
    });
  });

  window.addEventListener('hashchange', () => {
    const target = groupFromHash();
    if (!target) return;

    if (mobileViewport.matches) openOnly(target);
    setActiveFamily(target, mobileViewport.matches);
  });

  filter?.addEventListener('scroll', updateScrollHint, { passive: true });
  window.addEventListener('scroll', requestDesktopSync, { passive: true });
  window.addEventListener('resize', updateScrollHint);

  if (typeof mobileViewport.addEventListener === 'function') {
    mobileViewport.addEventListener('change', syncViewport);
  } else {
    mobileViewport.addListener(syncViewport);
  }

  if (initialGroup) setActiveFamily(initialGroup, mobileViewport.matches);
  syncViewport();
})();
