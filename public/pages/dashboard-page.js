class DashboardPage extends CustomComponent {
	static selectors = {
		$pv: '#pv',
		$chance: '#chance',
		$glory: '#glory',
		$wealth: '#wealth',
		$collected_items: '#collected-items',
		$adventure_notes: '#adventure-notes'
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

			<div class="v-split">
				<data-box id="collected-items" title="OBJETS RÉCUPÉRÉS" />
			</div>

			<div class="v-split">
				<data-box id="adventure-notes" title="NOTES D'AVENTURE" />
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

		// Add item
		const addItem = attr => {
			const item = prompt('Quel élément voulez-vous ajouter ?');
			if (!item) return;

			saveUserData(data => {
				data[attr].push(item);
				return data;
			});
			this.update();
		};

		// Remove item
		const removeItem = (attr, item) => {
			if (!confirm(`Voulez-vous supprimer "${item}" ?`)) return;
			saveUserData(data => {
				data[attr] = data[attr].filter(i => i !== item);
				return data;
			});
			this.update();
		};

		// Collected objects
		this.$collected_items.show([
			...user_data.collected_items.map(item => ({ label: item, bullet: true, onSelect: () => removeItem('collected_items', item) })),
			{ label: 'Ajouter un élément', gray: true, bullet: true, onSelect: () => addItem('collected_items') }
		]);

		// Adventure notes
		this.$adventure_notes.show([
			...user_data.adventure_notes.map(item => ({ label: item, bullet: true, onSelect: () => removeItem('adventure_notes', item) })),
			{ label: 'Ajouter un élément', gray: true, bullet: true, onSelect: () => addItem('adventure_notes') }
		]);
	}
}

register(DashboardPage);
