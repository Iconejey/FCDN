class DashboardPage extends CustomComponent {
	static selectors = {
		$title: '#title'
	};

	connectedCallback() {
		this.innerHTML = html`
			<h1 id="title"></h1>
			<p>Ici, tu peux suivre ton avancée dans l'aventure.</p>
			<p><a href="/billy" class="btn">Voir ma fiche de Billy</a></p>
		`;

		const user_data = getUserData();
		if (user_data) {
			const info = getBillyInfo({ equipment: user_data.equipment });
			this.$title.innerText = info.personality;
		}
	}
}

register(DashboardPage);
