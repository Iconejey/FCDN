class DataBox extends HTMLElement {
	connectedCallback() {
		this.innerHTML = `
			<span class="data-box-title"></span>
			<div class="data-box-list"></div>
		`;
	}

	set title(value) {
		this.querySelector('.data-box-title').innerText = value;
	}

	show(list) {
		const $list = this.querySelector('.data-box-list');
		$list.innerHTML = '';

		for (const item of list) {
			const $item = document.createElement('div');
			$item.classList.add('data-box-item');
			if (item.bullet) $item.classList.add('bullet');

			$item.innerHTML = `
				<li class="data-box-item-label">${item.label}</li>
				<span class="data-box-item-value">${item.value}</span>
			`;

			$list.appendChild($item);
		}
	}
}

customElements.define('data-box', DataBox);
