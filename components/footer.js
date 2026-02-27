// Footer Component
window.FooterComponent = {
    init() {
        this.render();
    },

    render() {
        const footerElement = document.getElementById('footer-component');
        if (!footerElement) return;

        footerElement.innerHTML = `
            <footer class="footer">
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-section">
                            <h4>Primal Fear Dex</h4>
                            <p>The ultimate companion app for Primal Fear mod in ARK: Survival Evolved.</p>
                        </div>
                        <div class="footer-section">
                            <h4>Quick Links</h4>
                            <ul>
                                <li><a href="/creatures">Creatures</a></li>
                                <li><a href="/items">Items</a></li>
                                <li><a href="/calculators">Calculators</a></li>
                            </ul>
                        </div>
                        <div class="footer-section">
                            <h4>Community</h4>
                            <ul>
                                <li><a href="/tips">Tips & Strategies</a></li>
                                <li><a href="https://primalfear.wiki.gg" target="_blank">Primal Fear Wiki</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p>&copy; 2024 Primal Fear Dex. Not affiliated with ARK or Primal Fear mod.</p>
                    </div>
                </div>
            </footer>
        `;
    }
};
