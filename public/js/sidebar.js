function renderSidebar(activePage) {
  const items = [
    { id: 'overview', href: '/dashboard.html', icon: 'layout-dashboard', label: 'Resumen' },
    { id: 'keys', href: '/dashboard.html#api-keys', icon: 'key-round', label: 'API Keys' },
    { id: 'docs', href: '/docs.html', icon: 'book-open', label: 'Documentación' },
    { id: 'pricing', href: '/pricing.html', icon: 'crown', label: 'Planes' },
    { id: 'profile', href: '/profile.html', icon: 'user-round', label: 'Mi perfil' }
  ];

  const user = AlexAPI.getUser() || {};
  const initial = (user.name || 'U').trim().charAt(0).toUpperCase();

  const nav = items
    .map(
      (item) => `
    <a href="${item.href}" class="sidebar-link ${item.id === activePage ? 'active' : ''}">
      <i data-lucide="${item.icon}"></i> ${item.label}
    </a>`
    )
    .join('');

  const html = `
    <div class="sidebar-brand"><span class="brand-mark">A</span> Alex API</div>
    <nav class="sidebar-nav">${nav}</nav>
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="avatar" style="background:${user.avatarColor || '#7C5CFF'}">${initial}</div>
        <div>
          <div class="sidebar-user-name">${user.name || 'Usuario'}</div>
          <div class="sidebar-user-plan">${user.plan === 'premium' ? '👑 Premium' : '🆓 Free'}</div>
        </div>
      </div>
      <a href="#" class="sidebar-link" data-action="logout"><i data-lucide="log-out"></i> Cerrar sesión</a>
    </div>
  `;

  document.querySelectorAll('.sidebar').forEach((el) => { el.innerHTML = html; });
  initIcons();
  initAuthNav();

  document.querySelectorAll('[data-action="logout"]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      AlexAPI.clearSession();
      location.href = '/index.html';
    });
  });

  const toggle = document.querySelector('.topbar-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
}
