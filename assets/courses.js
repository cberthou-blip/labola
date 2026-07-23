(() => {
  const page = document.querySelector('.courses-page');
  if (!page) return;

  const mobileViewport = window.matchMedia('(max-width: 560px)');
  const groups = [...page.querySelectorAll('.course-group')];
  const familyLinks = [...page.querySelectorAll('.course-filter a[href^="#famille-"]')];
  if (!groups.length) return;

  const groupFromHash = () => groups.find((group) => `#${group.id}` === window.location.hash);
  const initialGroup = groupFromHash();
  const mobileState = new Map(
    groups.map((group, index) => [group.id, initialGroup ? group === initialGroup : index === 0])
  );

  const setExpanded = (group, expanded) => {
    const button = group.querySelector('.course-group-toggle');
    const grid = group.querySelector('.practice-grid');
    if (!button || !grid) return;

    button.setAttribute('aria-expanded', String(expanded));
    grid.hidden = !expanded;
  };

  const openOnly = (selectedGroup) => {
    groups.forEach((group) => {
      const expanded = group === selectedGroup;
      mobileState.set(group.id, expanded);
      setExpanded(group, expanded);
    });
  };

  const syncViewport = () => {
    if (mobileViewport.matches) {
      groups.forEach((group) => setExpanded(group, mobileState.get(group.id)));
      return;
    }

    groups.forEach((group) => setExpanded(group, true));
  };

  page.classList.add('course-accordion-ready');

  groups.forEach((group) => {
    const button = group.querySelector('.course-group-toggle');
    if (!button) return;

    button.addEventListener('click', () => {
      if (!mobileViewport.matches) return;

      const expanded = button.getAttribute('aria-expanded') !== 'true';
      mobileState.set(group.id, expanded);
      setExpanded(group, expanded);
    });
  });

  familyLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (!mobileViewport.matches) return;

      const target = groups.find((group) => `#${group.id}` === link.hash);
      if (target) openOnly(target);
    });
  });

  window.addEventListener('hashchange', () => {
    if (!mobileViewport.matches) return;

    const target = groupFromHash();
    if (target) openOnly(target);
  });

  if (typeof mobileViewport.addEventListener === 'function') {
    mobileViewport.addEventListener('change', syncViewport);
  } else {
    mobileViewport.addListener(syncViewport);
  }

  syncViewport();
})();
