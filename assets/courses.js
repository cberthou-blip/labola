(() => {
  const page = document.querySelector('.courses-page');
  if (!page) return;

  const mobileViewport = window.matchMedia('(max-width: 560px)');
  const groups = [...page.querySelectorAll('.course-group')];
  const familyLinks = [...page.querySelectorAll('.course-filter a[href^="#famille-"]')];
  const filter = page.querySelector('.course-filter');
  const header = document.querySelector('.site-header');
  if (!groups.length) return;

  const groupFromHash = () => groups.find((group) => `#${group.id}` === window.location.hash);
  const initialGroup = groupFromHash();
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
