class AdrPage extends CustomComponent {
	static selectors = {
		$adr_box: '#adr-box',
		$dice: 'random-dice',
		$status_msg: '#status-msg'
	};

	connectedCallback() {
		this.innerHTML = html`
			<h1>Jet d'adresse</h1>
			<p>Jettez votre dé. Si la valeure obtenue est inférieure ou égale à votre ADRESSE, alors vous avez réussi !</p>
			<div class="v-split">
				<data-box id="adr-box"></data-box>
			</div>

			<div class="centering">
				<random-dice />
			</div>

			<div id="status-msg" class="centering"></div>

			<page-btn page="dashboard">Retour</page-btn>
		`;

		this.update();

		this.$dice.onThrow = number => {
			const { adr } = getBillyInfo(getUserData());
			const success = number <= adr.total;
			this.$status_msg.innerHTML = success ? html`<span style="color: #2e7d32; font-weight: bold; font-size: 1.5rem;">Réussite !</span>` : html`<span style="color: #c62828; font-weight: bold; font-size: 1.5rem;">Échec...</span>`;
		};

		this.$dice.addEventListener('click', () => {
			this.$status_msg.innerHTML = '';
		});
	}

	update() {
		const user_data = getUserData();
		const { adr } = getBillyInfo(user_data);

		this.$adr_box.title = adr.title;
		this.$adr_box.show([
			//
			{ label: 'Base', value: adr.base },
			{ label: 'Carac.', value: adr.perso },
			{ label: 'Matériel', value: adr.equip },
			'separator',
			{ label: 'Total', value: adr.total, bold: true }
		]);
	}
}

register(AdrPage);
