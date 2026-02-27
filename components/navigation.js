// Navigation Component
window.NavigationComponent = {
    initialized: false,
    
    init() {
        if (this.initialized) return;
        
        this.setupMobileNavigation();
        this.setupKeyboardNavigation();
        this.initialized = true;
    },

    setupMobileNavigation() {
        if (!Utils.isMobile()) return;

        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return;

        // Add mobile navigation styles
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                .nav-menu {
                    position: fixed;
                    top: 0;
                    left: -100%;
                    width: 80%;
                    height: 100vh;
                    background-color: var(--darker-bg);
                    border-right: 1px solid var(--border-color);
                    transition: left var(--transition-normal);
                    z-index: 9999;
                    flex-direction: column;
                    padding: var(--spacing-lg);
                    overflow-y: auto;
                }
                
                .nav-menu.mobile-open {
                    left: 0;
                }
                
                .nav-item {
                    width: 100%;
                    margin-bottom: var(--spacing-md);
                }
                
                .nav-link {
                    width: 100%;
                    padding: var(--spacing-md);
                    justify-content: space-between;
                }
                
                .dropdown {
                    position: static;
                    opacity: 1;
                    visibility: visible;
                    transform: none;
                    box-shadow: none;
                    border: none;
                    background: none;
                    margin-left: var(--spacing-lg);
                    margin-top: var(--spacing-sm);
                }
                
                .dropdown-item {
                    padding: var(--spacing-sm) var(--spacing-md);
                }
                
                .mobile-menu-toggle {
                    display: block !important;
                }
                
                .nav-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 9998;
                    opacity: 0;
                    visibility: hidden;
                    transition: all var(--transition-normal);
                }
                
                .nav-overlay.active {
                    opacity: 1;
                    visibility: visible;
                }
            }
        `;
        document.head.appendChild(style);

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);

        // Handle menu toggle
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('mobile-open');
                overlay.classList.toggle('active');
                document.body.style.overflow = navMenu.classList.contains('mobile-open') ? 'hidden' : '';
            });
        }

        // Handle overlay click
        overlay.addEventListener('click', () => {
            navMenu.classList.remove('mobile-open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        // Handle dropdown clicks in mobile
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                if (Utils.isMobile() && link.nextElementSibling?.classList.contains('dropdown')) {
                    e.preventDefault();
                    const dropdown = link.nextElementSibling;
                    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                }
            });
        });
    },

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Alt + Arrow keys for navigation
            if (e.altKey) {
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.navigatePrevious();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.navigateNext();
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        this.navigateUp();
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        this.navigateDown();
                        break;
                }
            }
        });
    },

    navigatePrevious() {
        const routes = ['/', '/creatures', '/items', '/structures', '/resources', '/bosses', '/progression'];
        const currentPath = window.location.pathname;
        const currentIndex = routes.indexOf(currentPath);
        
        if (currentIndex > 0) {
            window.Router.navigate(routes[currentIndex - 1]);
        }
    },

    navigateNext() {
        const routes = ['/', '/creatures', '/items', '/structures', '/resources', '/bosses', '/progression'];
        const currentPath = window.location.pathname;
        const currentIndex = routes.indexOf(currentPath);
        
        if (currentIndex < routes.length - 1) {
            window.Router.navigate(routes[currentIndex + 1]);
        }
    },

    navigateUp() {
        // Go to parent section
        const currentPath = window.location.pathname;
        const pathParts = currentPath.split('/').filter(Boolean);
        
        if (pathParts.length > 1) {
            const parentPath = '/' + pathParts[0];
            window.Router.navigate(parentPath);
        }
    },

    navigateDown() {
        // Go to first child section (creatures)
        window.Router.navigate('/creatures');
    }
};
