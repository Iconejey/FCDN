window.onload = () => {
	let selected_equipment = [];
	let personality = null;

	const continue_btn = document.querySelector('a.btn#continue');
	const $billy_p = document.querySelector('p.billy');
	const $personality = document.querySelector('span.personality');
	const container = document.querySelector('.checkboxes');

	const options = [
		{ type: 0, label: "L'ÉPEE" },
		{ type: 0, label: 'LA LANCE' },
		{ type: 0, label: 'LA MORGENSTERN' },
		{ type: 0, label: "L'ARC" },

		{ type: 1, label: 'LA COTTE DE MAILLE' },
		{ type: 1, label: 'LA MARMITE' },
		{ type: 1, label: 'LE PAMPHLET TOURISTIQUE' },
		{ type: 1, label: 'LE KIT DE SOIN' },

		{ type: 2, label: 'LA FOURCHE' },
		{ type: 2, label: 'LA DAGUE' },
		{ type: 2, label: "LE KIT D'ESCALADE" },
		{ type: 2, label: 'LE SAC DE GRAINS' }
	];

	const personalities = {
		0: 'GUERRIER',
		1: 'PRUDENT',
		2: 'PAYSAN',
		3: 'DÉBROUILLARD'
	};

	for (const option of options) {
		const checkbox_div = document.createElement('div');

		checkbox_div.innerHTML = `
			<input type="checkbox" />
			<span>${option.label}</span>
		`;

		checkbox_div.classList.add('checkbox');

		container.appendChild(checkbox_div);

		checkbox_div.querySelector('input').onchange = e => {
			const selected_checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
			selected_equipment = [...selected_checkboxes].map(c => options.find(o => o.label === c.nextElementSibling.innerText));

			if (selected_equipment.length === 3) {
				continue_btn.removeAttribute('disabled');
				$billy_p.classList.remove('hidden');

				personality = personalities[3];
				const counts = {
					0: 0,
					1: 0,
					2: 0
				};

				for (const { type } of selected_equipment) {
					counts[type]++;
					if (counts[type] > 1) personality = personalities[type];
				}

				$personality.innerText = personality;
			} else {
				continue_btn.setAttribute('disabled', '');
				$billy_p.classList.add('hidden');
			}
		};
	}

	continue_btn.onclick = e => {
		e.preventDefault();
		saveUserData(old => ({
			equipment: selected_equipment,
			personality
		}));
	};
};
