class RandomDice extends CustomComponent {
	connectedCallback() {
		for (let i = 0; i < 9; i++) {
			this.appendChild(emmet`div.dice-point`);
		}
	}
}

register(RandomDice);
