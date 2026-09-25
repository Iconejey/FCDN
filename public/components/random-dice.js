const DICE_FACES = {
	1: [4],
	2: [0, 8],
	3: [0, 4, 8],
	4: [0, 2, 6, 8],
	5: [0, 2, 4, 6, 8],
	6: [0, 2, 3, 5, 6, 8]
};

class RandomDice extends CustomComponent {
	connectedCallback() {
		this._rotation = 0;
		this._throwing = false;

		this.innerHTML = '';
		for (let i = 0; i < 9; i++) {
			this.appendChild(emmet`div.dice-point`);
		}

		// Initial face
		this.number = 0;

		this.onclick = async () => {
			if (this.disabled) return;
			if (this._throwing) return;
			const res = await this.roll();
			if (this.onThrow) this.onThrow(res);
		};
	}

	get disabled() {
		return this.hasAttribute('disabled');
	}

	set disabled(val) {
		if (val) this.setAttribute('disabled', '');
		else this.removeAttribute('disabled');
	}

	get number() {
		return this._number;
	}

	set number(val) {
		this._number = val;
		const active_indices = DICE_FACES[val] || [];
		const points = this.querySelectorAll('.dice-point');
		points.forEach((point, idx) => {
			point.style.opacity = active_indices.includes(idx) ? '1' : '0';
		});
	}

	roll() {
		this._throwing = true;
		this._rotation += 360;
		this.style.transform = `rotate(${this._rotation}deg)`;

		const points = this.querySelectorAll('.dice-point');
		points.forEach(point => {
			point.style.opacity = '0';
		});

		return new Promise(resolve => {
			setTimeout(() => {
				const result = Math.floor(Math.random() * 6) + 1;
				this.number = result;
				this._throwing = false;
				resolve(result);
			}, 1000);
		});
	}
}

register(RandomDice);
