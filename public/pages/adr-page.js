class AdrPage extends CustomComponent {
	static selectors = {
		$adr_box: '#adr-box'
	};

	connectedCallback() {
		this.innerHTML = html`
			<h1>Jet d'adresse</h1>
			<p>Jettez votre dé. Si la valeure obtenue est inférieure ou égale à votre ADRESSE, alors vous avez réussi !</p>
			<div class="v-split">
				<data-box id="adr-box"></data-box>
			</div>
			<page-btn page="action">Retour</page-btn>
		`;

		this.update();
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
