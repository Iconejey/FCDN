class DashboardPage extends CustomComponent {
	static selectors = {
		$pv: '#pv',
		$chance: '#chance',
		$glory: '#glory',
		$wealth: '#wealth'
	};

	connectedCallback() {
		this.update();
	}

	update() {
		const user_data = getUserData();
		const infos = getBillyInfo(user_data);

		this.innerHTML = html`
			<h1>Tableau de Bord</h1>
			<p>Ici, tu peux suivre ton avancée dans l'aventure.</p>

			<div class="v-split">
				<data-box id="pv" title="PV" />
				<data-box id="chance" title="CHANCE" />
			</div>

			<div class="v-split">
				<data-box id="glory" title="GLOIRE" />
				<data-box id="wealth" title="RICHESSE" />
			</div>

			<page-btn page="stats">Stats de Billy</page-btn>
		`;

		// Increment stat
		const incrStat = (attr, title) => d => {
			if (!confirm(`Voulez-vous ${d > 0 ? 'ajouter' : 'retirer'} 1 point de ${title} ?`)) return;
			saveUserData(data => {
				data[attr] += d;
				return data;
			});
			this.update();
		};

		// PV and CHANCE
		this.$pv.show([{ incr: incrStat('pv', 'PV'), value: `${user_data.pv} / ${infos.pv_max.total}` }]);
		this.$chance.show([{ incr: incrStat('chance', 'CHANCE'), value: `${user_data.chance} / ${infos.cha.total}` }]);

		// GLOIRE and RICHESSE
		this.$glory.show([{ incr: incrStat('glory', 'GLOIRE'), value: user_data.glory }]);
		this.$wealth.show([{ incr: incrStat('wealth', 'RICHESSE'), value: user_data.wealth }]);
	}
}

register(DashboardPage);
