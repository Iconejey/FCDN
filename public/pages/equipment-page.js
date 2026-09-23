class EquipmentPage extends CustomComponent {
	static selectors = {
		$checkboxes: '.checkboxes',
		$validate_btn: '#validate',
		$personality: '.personality',
		$main_stats: '#main-stats',
		$second_stats: '#second-stats',
		$billy_p: '#billy-p',
		$v_split: '#v-split'
	};

	connectedCallback() {
		this.innerHTML = html`
			<h1>Choix de l'équipement</h1>
			<p>Tu commences ton aventure avec un équipement de départ. Choisis jusqu'à <b>3 équipements</b> de départ.</p>

			<div class="checkboxes"></div>

			<div class="centering hidden" id="v-split">
				<div class="vertical-split">
					<p id="billy-p">Ton Billy est <span class="personality"></span> !</p>
					<div class="stats">
						<data-box id="main-stats"></data-box>
						<data-box id="second-stats"></data-box>
					</div>
				</div>
			</div>

			<div class="centering">
				<a class="btn" href="/dashboard" id="validate" disabled>Continuer</a>
			</div>
		`;

		// Set static titles for components
		this.$main_stats.title = 'Caractéristiques principales';
		this.$second_stats.title = 'Caractéristiques secondaires';

		let selected_equipment = [];

		for (const option of equipment_options) {
			const checkbox_label = document.createElement('label');
			checkbox_label.className = 'checkbox';
			checkbox_label.innerHTML = `
				<input type="checkbox" />
				<span>${option.label}</span>
			`;

			checkbox_label.querySelector('input').onchange = e => {
				const selected_checkboxes = this.$checkboxes.querySelectorAll('input:checked');

				if (selected_checkboxes.length > 3) {
					e.target.checked = false;
					return;
				}

				selected_equipment = [...selected_checkboxes].map(c => equipment_options.find(o => o.label === c.nextElementSibling.innerText));

				if (selected_checkboxes.length === 3) {
					this.$validate_btn.removeAttribute('disabled');
					this.$billy_p.classList.remove('hidden');
					this.$v_split.classList.remove('hidden');

					const info = getBillyInfo({ equipment: selected_equipment.map(eq => eq.label) });
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
					this.$v_split.classList.add('hidden');
				}
			};

			this.$checkboxes.appendChild(checkbox_label);
		}

		this.$validate_btn.onclick = e => {
			e.preventDefault();
			saveUserData(old => ({
				equipment: selected_equipment.map(eq => eq.label)
			}));
			navigate('/dashboard');
		};
	}
}

register(EquipmentPage);
