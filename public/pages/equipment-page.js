class EquipmentPage extends CustomComponent {
	static selectors = {
		$checkboxes: '.checkboxes',
		$$selected: '.checkboxes input:checked',
		$validate_btn: '#validate',
		$personality: '.personality',
		$main_stats: '#main-stats',
		$second_stats: '#second-stats',
		$billy_p: '#billy-p',
		$stats: '.v-split'
	};

	get selected_equipment() {
		return [...this.$$selected].map(c => equipment_options.find(o => o.label === c.nextElementSibling.innerText));
	}

	get selected_labels() {
		return this.selected_equipment.map(eq => eq.label);
	}

	connectedCallback() {
		this.innerHTML = html`
			<h1>Choix de l'équipement</h1>
			<p>Tu commences ton aventure avec un équipement de départ. Choisis jusqu'à <b>3 équipements</b> de départ.</p>

			<div class="checkboxes"></div>

			<p id="billy-p" class="hidden">Ton Billy est <span class="personality"></span> !</p>
			<div class="v-split stats hidden">
				<data-box id="main-stats"></data-box>
				<data-box id="second-stats"></data-box>
			</div>

			<div class="centering">
				<page-btn page="stats" id="validate" disabled>Continuer</page-btn>
			</div>
		`;

		for (const option of equipment_options) {
			const checkbox_label = emmet`label.checkbox`;
			checkbox_label.innerHTML = html`
				<input type="checkbox" />
				<span>${option.label}</span>
			`;

			checkbox_label.$('input').onchange = e => {
				if (this.$$selected.length > 3) {
					e.target.checked = false;
					return;
				}

				if (this.$$selected.length === 3) {
					this.$validate_btn.removeAttribute('disabled');
					this.$billy_p.classList.remove('hidden');
					this.$stats.classList.remove('hidden');

					const info = getBillyInfo({ equipment: this.selected_labels });
					this.$personality.innerText = info.personality;

					const $main_stats = [];
					for (const attr of ['hab', 'adr', 'end', 'cha']) $main_stats.push({ bullet: true, label: info[attr].title, value: info[attr].total });
					this.$main_stats.show($main_stats);

					const $second_stats = [];
					for (const attr of ['deg', 'arm', 'crit', 'pv_max']) $second_stats.push({ bullet: true, label: info[attr].title, value: info[attr].total });
					this.$second_stats.show($second_stats);
				} else {
					this.$validate_btn.setAttribute('disabled', '');
					this.$billy_p.classList.add('hidden');
					this.$stats.classList.add('hidden');
				}
			};

			this.$checkboxes.appendChild(checkbox_label);
		}

		this.$validate_btn.before = e => saveUserData(old => ({ equipment: this.selected_labels }));
	}
}

register(EquipmentPage);
