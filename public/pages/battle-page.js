class BattlePage extends CustomComponent {
	static selectors = {
		$billy_hab: '#billy-hab-box',
		$billy_adr: '#billy-adr-box',
		$billy_deg: '#billy-deg-box',
		$billy_arm: '#billy-arm-box',
		$billy_crit: '#billy-crit-box',

		$adv_hab: '#adv-hab-box',
		$adv_pv: '#adv-pv-box',
		$adv_deg: '#adv-deg-box',
		$adv_arm: '#adv-arm-box',

		$combat_billy: '#combat-billy-box',
		$combat_adv: '#combat-adv-box',

		$to_adversaire_btn: '#to-adversaire-btn',
		$back_to_billy_btn: '#back-to-billy-btn',
		$to_combat_btn: '#to-combat-btn',
		$back_to_adv_btn: '#back-to-adv-btn'
	};

	connectedCallback() {
		this.current_view = 'BILLY';
		this.battle_modifiers = {
			hab: 0,
			adr: 0,
			deg: 0,
			arm: 0,
			crit: 0
		};
		this.adversaire = {
			hab: 0,
			pv: 0,
			deg: 0,
			arm: 0
		};

		this.innerHTML = html`
			<style>
				.view-container {
					display: none;

					&.active {
						display: block;
					}
				}
			</style>

			<!-- BILLY VIEW -->
			<div id="billy-view" class="view-container">
				<h1>Combat - Billy</h1>

				<div class="v-split">
					<data-box id="billy-hab-box"></data-box>
					<data-box id="billy-adr-box"></data-box>
				</div>

				<div class="v-split">
					<data-box id="billy-deg-box"></data-box>
					<data-box id="billy-arm-box"></data-box>
				</div>

				<div class="v-split">
					<data-box id="billy-crit-box"></data-box>
				</div>

				<div class="v-split">
					<page-btn page="dashboard">Retour</page-btn>
					<button id="to-adversaire-btn" class="btn">Adversaire</button>
				</div>
			</div>

			<!-- ADVERSAIRE VIEW -->
			<div id="adversaire-view" class="view-container">
				<h1>Combat - Adversaire</h1>

				<div class="v-split">
					<data-box id="adv-hab-box"></data-box>
					<data-box id="adv-pv-box"></data-box>
				</div>

				<div class="v-split">
					<data-box id="adv-deg-box"></data-box>
					<data-box id="adv-arm-box"></data-box>
				</div>

				<div class="v-split">
					<button id="back-to-billy-btn" class="btn">Retour</button>
					<button id="to-combat-btn" class="btn">Combat</button>
				</div>
			</div>

			<!-- COMBAT VIEW -->
			<div id="combat-view" class="view-container">
				<h1>Combat</h1>

				<div class="v-split">
					<data-box id="combat-billy-box"></data-box>
					<data-box id="combat-adv-box"></data-box>
				</div>

				<div class="v-split">
					<button id="back-to-adv-btn" class="btn">Retour</button>
					<page-btn page="dashboard">Quitter</page-btn>
				</div>
			</div>
		`;

		this.$to_adversaire_btn.onclick = () => {
			this.current_view = 'ADVERSAIRE';
			this.update();
		};

		this.$back_to_billy_btn.onclick = () => {
			this.current_view = 'BILLY';
			this.update();
		};

		this.$to_combat_btn.onclick = () => {
			this.current_view = 'COMBAT';
			this.update();
		};

		this.$back_to_adv_btn.onclick = () => {
			this.current_view = 'ADVERSAIRE';
			this.update();
		};

		this.update();
	}

	update() {
		this.querySelectorAll('.view-container').forEach($view => {
			if ($view.id === `${this.current_view.toLowerCase()}-view`) $view.classList.add('active');
			else $view.classList.remove('active');
		});

		const user_data = getUserData();
		const infos = getBillyInfo(user_data);

		if (this.current_view === 'BILLY') {
			const addBillyStat = (stat, box) => {
				const info = infos[stat];
				const list = [
					{ label: 'Base', value: info.base },
					{ label: 'Équipement', value: info.equip },
					{ label: 'Caractère', value: info.perso },
					{ label: 'Bonus', value: info.bonus },
					{
						label: 'Ajustement',
						value: this.battle_modifiers[stat],
						incr: d => {
							this.battle_modifiers[stat] += d;
							this.update();
						}
					},
					'separator',
					{ label: 'Total', value: info.total + this.battle_modifiers[stat], bold: true }
				];
				box.title = info.title;
				box.show(list);
			};

			addBillyStat('hab', this.$billy_hab);
			addBillyStat('adr', this.$billy_adr);
			addBillyStat('deg', this.$billy_deg);
			addBillyStat('arm', this.$billy_arm);
			addBillyStat('crit', this.$billy_crit);
		}

		if (this.current_view === 'ADVERSAIRE') {
			const addAdvStat = (stat, title, box) => {
				const list = [
					{
						label: 'Valeur',
						value: this.adversaire[stat],
						incr: d => {
							const val = this.adversaire[stat] + d;
							if (val < 0) return;
							this.adversaire[stat] = val;
							this.update();
						}
					}
				];
				box.title = title;
				box.show(list);
			};

			addAdvStat('hab', 'HABILETÉ', this.$adv_hab);
			addAdvStat('pv', 'POINTS DE VIE', this.$adv_pv);
			addAdvStat('deg', 'DÉGÂTS', this.$adv_deg);
			addAdvStat('arm', 'ARMURE', this.$adv_arm);
		}

		if (this.current_view === 'COMBAT') {
			const pv_max = infos.pv_max.total;

			const billy_list = [
				{
					label: 'PV',
					value: `${user_data.pv} / ${pv_max}`,
					incr: d => {
						let val = user_data.pv + d;
						if (val < 0) val = 0;
						if (val > pv_max) val = pv_max;
						saveUserData(data => {
							data.pv = val;
							return data;
						});
						this.update();
					}
				},
				'separator',
				{ label: 'Habileté', value: infos.hab.total + this.battle_modifiers.hab },
				{ label: 'Adresse', value: infos.adr.total + this.battle_modifiers.adr },
				{ label: 'Armure', value: infos.arm.total + this.battle_modifiers.arm },
				{ label: 'Dégâts', value: infos.deg.total + this.battle_modifiers.deg },
				{ label: 'Critique', value: infos.crit.total + this.battle_modifiers.crit }
			];
			this.$combat_billy.title = 'BILLY';
			this.$combat_billy.show(billy_list);

			const adv_list = [
				{
					label: 'PV',
					value: this.adversaire.pv,
					incr: d => {
						let val = this.adversaire.pv + d;
						if (val < 0) val = 0;
						this.adversaire.pv = val;
						this.update();
					}
				},
				'separator',
				{ label: 'Habileté', value: this.adversaire.hab },
				{ label: 'Armure', value: this.adversaire.arm },
				{ label: 'Dégâts', value: this.adversaire.deg }
			];
			this.$combat_adv.title = 'ADVERSAIRE';
			this.$combat_adv.show(adv_list);
		}
	}
}

register(BattlePage);
