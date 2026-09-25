class DashboardPage extends CustomComponent {
	static selectors = {
		$pv: '#pv',
		$chance: '#chance',
		$glory: '#glory',
		$wealth: '#wealth',
		$collected_items: '#collected-items',
		$adventure_notes: '#adventure-notes',
		$chap_list: '#chap-list'
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

			<div class="v-split">
				<page-btn page="stats">Stats de Billy</page-btn>
				<page-btn page="action">Action</page-btn>
			</div>

			<h1>Suivi des chapitres</h1>
			<div id="chap-list" class="chap-list"></div>
		`;

		// Increment stat
		const incrStat = (attr, title, max) => d => {
			if (!confirm(`Voulez-vous ${d > 0 ? 'ajouter' : 'retirer'} 1 point de ${title} ?`)) return;
			saveUserData(data => {
				data[attr] += d;
				if (max && data[attr] > max) return alert('Vous avez déjà atteint le maximum pour cette valeur.');
				return data;
			});
			this.update();
		};

		// PV and CHANCE
		this.$pv.show([{ incr: incrStat('pv', 'PV', infos.pv_max.total), value: `${user_data.pv} / ${infos.pv_max.total}` }]);
		this.$chance.show([{ incr: incrStat('chance', 'CHANCE', infos.cha.total), value: `${user_data.chance} / ${infos.cha.total}` }]);

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

		// Render chapter list
		const chap_history = user_data.chap_history || [];
		const chap_list_el = this.$chap_list;
		chap_list_el.innerHTML = '';

		const current_chap = chap_history[0];
		const former_chaps = chap_history.slice(1);

		const current_span = document.createElement('span');
		current_span.className = 'current-chap';
		current_span.textContent = current_chap !== undefined ? current_chap : '-';

		current_span.oncontextmenu = event => {
			event.preventDefault();
			event.stopPropagation();
			const user_input = prompt('Saisir le nouveau chapitre :');
			if (!user_input) return;
			const new_chap = Number(user_input);
			if (isNaN(new_chap)) return alert('Veuillez entrer un numéro de chapitre valide.');
			saveUserData(data => {
				data.chap_history = [new_chap, ...(data.chap_history || [])];
				return data;
			});
			this.update();
		};

		chap_list_el.appendChild(current_span);

		if (former_chaps.length > 0) {
			const former_container = document.createElement('div');
			former_container.className = 'former-chaps';

			former_chaps.forEach(chap => {
				const chap_span = document.createElement('span');
				chap_span.className = 'former-chap';
				chap_span.textContent = chap;

				chap_span.oncontextmenu = event => {
					event.preventDefault();
					event.stopPropagation();
					if (confirm(`Voulez-vous revenir au chapitre ${chap} ?`)) {
						saveUserData(data => {
							data.chap_history = [chap, ...(data.chap_history || [])];
							return data;
						});
						this.update();
					}
				};

				former_container.appendChild(chap_span);
			});

			chap_list_el.appendChild(former_container);
		}
	}
}

register(DashboardPage);
