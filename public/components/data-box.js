class DataBox extends CustomComponent {
	static selectors = {
		$title: '.data-box-title',
		$list: '.data-box-list'
	};

	connectedCallback() {
		this.innerHTML = html`
			<span class="data-box-title"></span>
			<div class="data-box-list"></div>
		`;
	}

	set title(value) {
		this.$title.innerText = value;
	}

	show(list) {
		this.$list.innerHTML = '';

		for (const item of list) {
			if (item === 'separator') {
				this.$list.appendChild(emmet`div.data-box-separator`);
			} else {
				const $item = this.$list.appendChild(emmet`div.data-box-item${item.bullet ? '.bullet' : ''}${item.bold ? '.bold' : ''}`);

				$item.innerHTML = html`
					<li class="data-box-item-label">${item.label}</li>
					<span class="data-box-item-value">${item.value}</span>
				`;
			}
		}
	}
}

register(DataBox);
