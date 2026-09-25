class ChancePage extends CustomComponent {
	static selectors = {
		$chance_box: '#chance-box',
		$dice: 'random-dice',
		$status_msg: '#status-msg'
	};

	connectedCallback() {
		this.innerHTML = html`
			<h1>Jet de chance</h1>
			<p>Jettez votre dé. Si la valeure obtenue est inférieure ou égale à votre CHANCE, alors vous avez réussi !</p>
			<div class="v-split">
				<data-box id="chance-box"></data-box>
			</div>

			<div class="centering">
				<random-dice />
			</div>

			<div id="status-msg" class="centering"></div>

			<page-btn page="dashboard">Retour</page-btn>
		`;

		this.update();

		this.$dice.onclick = async () => {
			if (this.$dice._throwing) return;
			if (!confirm('Lancer le dé de chance déduira un point de CHANCE après le jet. Confirmer ?')) return;

			this.$status_msg.innerHTML = '';

			const res = await this.$dice.roll();
			if (this.$dice.onThrow) this.$dice.onThrow(res);
		};

		this.$dice.onThrow = number => {
			const success = number <= getUserData().chance;
			this.$status_msg.innerHTML = success ? html`<span style="color: #2e7d32; font-weight: bold; font-size: 1.5rem;">Réussite !</span>` : html`<span style="color: #c62828; font-weight: bold; font-size: 1.5rem;">Échec...</span>`;

			saveUserData(data => {
				data.chance--;
				return data;
			});

			this.update();
		};
	}

	update() {
		const user_data = getUserData();
		const { cha } = getBillyInfo(user_data);

		this.$chance_box.show([{ label: 'CHANCE', bold: true, value: `${user_data.chance} / ${cha.total}` }]);

		console.log(this.$chance);
	}
}

register(ChancePage);
