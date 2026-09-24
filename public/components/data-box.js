class DataBox extends CustomComponent {
	static selectors = {
		$title: '.data-box-title',
		$list: '.data-box-list'
	};

	connectedCallback() {
		const title = this.getAttribute('title') || '';

		this.innerHTML = html`
			<span class="data-box-title">${title}</span>
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
			} else if (item.incr) {
				const $item = this.$list.appendChild(emmet`div.data-box-item.counter`);

				$item.innerHTML = html`
					<span class="material-symbols-outlined counter-btn remove-btn">remove</span>
					<span class="data-box-item-value">${item.value}</span>
					<span class="material-symbols-outlined counter-btn add-btn">add</span>
				`;

				$item.$('.remove-btn').onclick = () => item.incr(-1);
				$item.$('.add-btn').onclick = () => item.incr(1);
			} else {
				const $item = this.$list.appendChild(emmet`div.data-box-item`);
				if (item.bullet) $item.classList.add('bullet');
				if (item.bold) $item.classList.add('bold');
				if (item.gray) $item.classList.add('gray');
				if (item.select) $item.classList.add('select');

				$item.innerHTML = html`
					<li class="data-box-item-label">${item.label || ''}</li>
					<span class="data-box-item-value">${item.value || ''}</span>
				`;

				$item.oncontextmenu = e => {
					e.preventDefault();
					e.stopPropagation();
					item.onSelect?.();
				};
			}
		}
	}
}

register(DataBox);
