class ActionPage extends CustomComponent {
	static selectors = {
		$chance_btn: '#chance-btn'
	};

	connectedCallback() {
		this.innerHTML = html`
			<h1>Action</h1>
			<p>Que souhaites-tu faire ?</p>

			<div class="v-split">
				<page-btn page="battle">Combatre !</page-btn>
			</div>

			<div class="v-split">
				<page-btn id="chance-btn" page="chance">Jet de chance (-1)</page-btn>
			</div>

			<div class="v-split">
				<page-btn page="adr">Jet d'adresse</page-btn>
			</div>

			<div class="v-split">
				<page-btn page="dashboard">Retour</page-btn>
			</div>
		`;
	}
}

register(ActionPage);
