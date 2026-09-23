class BillyPage extends CustomComponent {
	static selectors = {
		$personality: '#personality',
		$description: '#description'
	};

	connectedCallback() {
		this.innerHTML = html`
			<h1>Billy <span id="personality"></span></h1>
			<p id="description"></p>
		`;

		const user_data = getUserData();
		if (user_data) {
			const info = getBillyInfo({ equipment: user_data.equipment });
			this.$personality.innerText = info.personality;
			this.$description.innerText = personalities[info.personality].description;
		}
	}
}

register(BillyPage);
