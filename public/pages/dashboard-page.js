class DashboardPage extends CustomComponent {
	static selectors = {
		$pv: '#pv',
		$chance: '#chance',
		$glory: '#glory',
		$respect: '#respect',
		$resentment: '#resentment',
		$wealth: '#wealth',
		$impulse: '#impulse',
		$lucidity: '#lucidity',
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

		let extra_boxes_html = '';
		if (current_book === 'FCDN') {
			extra_boxes_html = html`
				<div class="v-split">
					<data-box id="glory" title="GLOIRE" />
					<data-box id="wealth" title="RICHESSE" />
				</div>
			`;
		} else if (current_book === 'CDSI') {
			extra_boxes_html = html`
				<div class="v-split">
					<data-box id="respect" title="RESPECT" />
					<data-box id="resentment" title="RANCUNE" />
				</div>

				<div class="v-split">
					<data-box id="wealth" title="RICHESSE" />
				</div>
			`;
		} else if (current_book === 'LLDV') {
			extra_boxes_html = html`
				<div class="v-split">
					<data-box id="impulse" title="IMPULSION" />
					<data-box id="lucidity" title="LUCIDITÉ" />
				</div>

				<div class="v-split">
					<data-box id="wealth" title="RICHESSE" />
				</div>
			`;
		}

		this.innerHTML = html`
			<h1>Tableau de Bord</h1>
			<p>Ici, tu peux suivre ton avancée dans l'aventure.</p>

			<div class="v-split">
				<data-box id="pv" title="PV" />
				<data-box id="chance" title="CHANCE" />
			</div>

			${extra_boxes_html}

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
			navigator?.vibrate(10);
			if (!confirm(`Voulez-vous ${d > 0 ? 'ajouter' : 'retirer'} 1 point de ${title} ?`)) return;
			saveUserData(data => {
				data[attr] = (data[attr] || 0) + d;
				if (max && data[attr] > max) return alert('Vous avez déjà atteint le maximum pour cette valeur.');
				return data;
			});
			this.update();
		};

		// PV and CHANCE
		this.$pv.show([{ incr: incrStat('pv', 'PV', infos.pv_max.total), value: `${user_data.pv} / ${infos.pv_max.total}` }]);
		this.$chance.show([{ incr: incrStat('chance', 'CHANCE', infos.cha.total), value: `${user_data.chance} / ${infos.cha.total}` }]);

		// Book specific databoxes
		if (current_book === 'FCDN') this.$glory.show([{ incr: incrStat('glory', 'GLOIRE'), value: user_data.glory }]);
		if (current_book === 'CDSI') {
			const respect_list = [{ incr: incrStat('respect', 'RESPECT'), value: user_data.respect }];
			const resentment_list = [{ incr: incrStat('resentment', 'RESSENTIMENT'), value: user_data.resentment }];

			const key = getOpinionKey(user_data.respect, user_data.resentment);
			const opinions = window.CONSTANTS?.[current_book]?.opinions;

			if (key && opinions?.[key]) {
				const target_list = key.includes('respect') ? respect_list : resentment_list;
				target_list.push('separator');
				const label_map = { cha: 'CHA', end: 'END', crit: 'CRIT', hab: 'HAB', adr: 'ADR', arm: 'ARM', deg: 'DEG' };
				for (const [attr, val] of Object.entries(opinions[key])) {
					const label = label_map[attr] || attr.toUpperCase();
					const val_str = val > 0 ? `+${val}` : `${val}`;
					target_list.push({ label, value: val_str });
				}
			}

			this.$respect.show(respect_list);
			this.$resentment.show(resentment_list);
		}
		if (current_book === 'LLDV') {
			this.$impulse.show([{ incr: incrStat('impulse', 'IMPULSION'), value: user_data.impulse || 0 }]);
			this.$lucidity.show([{ incr: incrStat('lucidity', 'LUCIDITÉ'), value: user_data.lucidity || 0 }]);
		}

		this.$wealth.show([{ incr: incrStat('wealth', 'RICHESSE'), value: user_data.wealth || 0 }]);

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

		current_span.onclick = async event => {
			event.preventDefault();
			event.stopPropagation();
			navigator?.vibrate(10);
			const user_input = await promptNumpad();
			if (!user_input) return;
			const new_chap = Number(user_input);
			if (isNaN(new_chap)) return alert('Veuillez entrer un numéro de chapitre valide.');
			saveUserData(data => {
				data.chap_history = [new_chap, ...(data.chap_history || [])];
				return data;
			});
			this.update();
		};

		current_span.oncontextmenu = event => {
			event.preventDefault();
			event.stopPropagation();
			if (current_chap === undefined) return;
			if (confirm(`Voulez-vous supprimer le chapitre ${current_chap} ?`)) {
				saveUserData(data => {
					data.chap_history = (data.chap_history || []).slice(1);
					return data;
				});
				this.update();
			}
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
