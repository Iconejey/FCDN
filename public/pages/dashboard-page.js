class DashboardPage extends CustomComponent {
	static selectors = {};

	connectedCallback() {
		this.innerHTML = html`
			<h1>Tableau de Bord</h1>
			<p>Ici, tu peux suivre ton avancée dans l'aventure.</p>
			<page-btn page="stats">Stats de Billy</page-btn>
		`;
	}
}

register(DashboardPage);
