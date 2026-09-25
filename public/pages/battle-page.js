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
		$combat_situation: '#combat-situation',
		$combat_instructions: '#combat-instructions',

		$to_adversaire_btn: '#to-adversaire-btn',
		$back_to_billy_btn: '#back-to-billy-btn',
		$to_combat_btn: '#to-combat-btn',
		$back_to_adv_btn: '#back-to-adv-btn',
		$continue_btn: '#continue-btn'
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
		const user_data = getUserData();
		this.billy_pvs = [user_data ? user_data.pv : 0];
		this.adversaire_pvs = [this.adversaire.pv];

		this.innerHTML = html`
			<style>
				.view-container {
					display: none;

					&.active {
						display: block;
					}
				}

				#combat-view {
					& #combat-situation {
						text-align: center;
						font-size: 1.15rem;
						margin: 15px 0;
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
				<p id="combat-situation"></p>

				<div class="v-split">
					<data-box id="combat-billy-box"></data-box>
					<data-box id="combat-adv-box"></data-box>
				</div>

				<p id="combat-instructions" style="text-align: center; font-size: 1.1rem; margin: 15px 0;"></p>

				<div class="centering">
					<random-dice></random-dice>
					<random-dice></random-dice>
				</div>

				<div class="centering" style="margin: 20px 0;">
					<button id="continue-btn" class="btn">Continuer</button>
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
			const user_data = getUserData();
			this.billy_pvs = [user_data ? user_data.pv : 0];
			this.adversaire_pvs = [this.adversaire.pv];
			this.update();
		};

		this.$back_to_adv_btn.onclick = () => {
			this.current_view = 'ADVERSAIRE';
			this.update();
		};

		this.$continue_btn.onclick = () => {
			// Does nothing for now
		};

		this.update();
	}

	addPvPair(billy_pv, adv_pv) {
		this.billy_pvs.push(billy_pv);
		this.adversaire_pvs.push(adv_pv);
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
							if (stat === 'pv') {
								this.adversaire_pvs[0] = val;
							}
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
			const billy_list = [];
			this.billy_pvs.forEach(pv => {
				billy_list.push({ label: 'PV', value: pv });
			});
			billy_list.push('separator');
			billy_list.push(
				{ label: 'Habileté', value: infos.hab.total + this.battle_modifiers.hab },
				{ label: 'Adresse', value: infos.adr.total + this.battle_modifiers.adr },
				{ label: 'Armure', value: infos.arm.total + this.battle_modifiers.arm },
				{ label: 'Dégâts', value: infos.deg.total + this.battle_modifiers.deg },
				{ label: 'Critique', value: infos.crit.total + this.battle_modifiers.crit }
			);
			this.$combat_billy.title = 'BILLY';
			this.$combat_billy.show(billy_list);

			const adv_list = [];
			this.adversaire_pvs.forEach(pv => {
				adv_list.push({ label: 'PV', value: pv });
			});
			adv_list.push('separator');
			adv_list.push({ label: 'Habileté', value: this.adversaire.hab }, { label: 'Armure', value: this.adversaire.arm }, { label: 'Dégâts', value: this.adversaire.deg });
			this.$combat_adv.title = 'ADVERSAIRE';
			this.$combat_adv.show(adv_list);

			const billy_hab_total = infos.hab.total + this.battle_modifiers.hab;
			const hab_diff = billy_hab_total - this.adversaire.hab;

			let situation = '';
			if (hab_diff <= -5) situation = 'DÉSAVANTAGE LOURD';
			else if (hab_diff === -4 || hab_diff === -3) situation = 'DÉSAVANTAGE';
			else if (hab_diff === -2 || hab_diff === -1) situation = 'DÉSAVANTAGE LÉGER';
			else if (hab_diff === 0) situation = 'ÉGALITÉ';
			else if (hab_diff === 1 || hab_diff === 2) situation = 'AVANTAGE LÉGER';
			else if (hab_diff === 3 || hab_diff === 4) situation = 'AVANTAGE';
			else if (hab_diff >= 5) situation = 'AVANTAGE LOURD';

			const hab_diff_str = hab_diff > 0 ? `+${hab_diff}` : `${hab_diff}`;
			this.$combat_situation.innerHTML = `Vous ête en <b>${situation}</b> (${hab_diff_str}).`;

			const is_debrouillard = infos.personality === 'DÉBROUILLARD';
			let instructions_html = `Cliquez sur le premier dé pour la <b>PHASE D'ATTAQUE</b> et sur le second pour la <b>PHASE D'ESQUIVE</b>.`;
			if (is_debrouillard) {
				instructions_html += `<br><br>Vous avez un <b>Billy DEBROUILLARD</b>, donc vous pouvez relancer le dé d'attaque une fois.`;
			}
			this.$combat_instructions.innerHTML = instructions_html;
		}
	}
}

register(BattlePage);
