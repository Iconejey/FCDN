function promptNumpad() {
	return new Promise(resolve => {
		let typed_value = '';

		const overlay_el = document.createElement('div');
		overlay_el.className = 'numpad-overlay';

		const display_container = document.createElement('div');
		display_container.className = 'numpad-display-container';

		const display_el = document.createElement('div');
		display_el.className = 'numpad-display';
		display_container.appendChild(display_el);

		const grid_el = document.createElement('div');
		grid_el.className = 'numpad-grid';

		const updateDisplay = () => {
			display_el.textContent = typed_value;
		};

		const cleanup = () => {
			window.removeEventListener('keydown', handleKeyDown);
			overlay_el.remove();
		};

		const handleValidate = () => {
			cleanup();
			if (typed_value === '') return resolve(null);
			resolve(typed_value);
		};

		const handleBackspace = () => {
			typed_value = typed_value.slice(0, -1);
			updateDisplay();
		};

		const handleDigit = digit => {
			typed_value += digit;
			updateDisplay();
		};

		const handleKeyDown = event => {
			if (event.key >= '0' && event.key <= '9') handleDigit(event.key);
			else if (event.key === 'Backspace') handleBackspace();
			else if (event.key === 'Enter') handleValidate();
			else if (event.key === 'Escape') {
				cleanup();
				resolve(null);
			}
		};

		window.addEventListener('keydown', handleKeyDown);

		const buttons = [
			{ label: '1', key: '1' },
			{ label: '2', key: '2' },
			{ label: '3', key: '3' },
			{ label: '4', key: '4' },
			{ label: '5', key: '5' },
			{ label: '6', key: '6' },
			{ label: '7', key: '7' },
			{ label: '8', key: '8' },
			{ label: '9', key: '9' },
			{ icon: 'backspace', action: 'backspace' },
			{ label: '0', key: '0' },
			{ icon: 'check', action: 'validate' }
		];

		buttons.forEach(btn => {
			const btn_el = document.createElement('button');
			btn_el.className = 'numpad-btn';

			if (btn.icon) {
				const icon_el = document.createElement('span');
				icon_el.className = 'material-symbols-outlined';
				icon_el.textContent = btn.icon;
				btn_el.appendChild(icon_el);
			} else {
				btn_el.textContent = btn.label;
			}

			btn_el.onclick = event => {
				event.preventDefault();
				event.stopPropagation();
				navigator?.vibrate?.(10);

				if (btn.action === 'backspace') handleBackspace();
				else if (btn.action === 'validate') handleValidate();
				else if (btn.key) handleDigit(btn.key);
			};

			grid_el.appendChild(btn_el);
		});

		overlay_el.appendChild(display_container);
		overlay_el.appendChild(grid_el);
		document.body.appendChild(overlay_el);
	});
}
