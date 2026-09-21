window.onload = () => {
	let selected_equipment = [];

	const continue_btn = document.querySelector('a.btn#continue');
	const $billy_p = document.querySelector('p.billy');
	const $v_split = document.querySelector('.v-split');
	const $main_stats = document.querySelector('#main-stats');
	const $second_stats = document.querySelector('#second-stats');
	const $personality = document.querySelector('span.personality');
	const container = document.querySelector('.checkboxes');

	for (const option of equipment_options) {
		const checkbox_div = document.createElement('div');

		checkbox_div.innerHTML = `
			<input type="checkbox" />
			<span>${option.label}</span>
		`;

		checkbox_div.classList.add('checkbox');

		container.appendChild(checkbox_div);

		checkbox_div.querySelector('input').onchange = e => {
			const selected_checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
			selected_equipment = [...selected_checkboxes].map(c => equipment_options.find(o => o.label === c.nextElementSibling.innerText));

			if (selected_equipment.length === 3) {
				continue_btn.removeAttribute('disabled');
				$billy_p.classList.remove('hidden');
				$v_split.classList.remove('hidden');

				const info = getBillyInfo({ equipment: selected_equipment.map(eq => eq.label) });
				$personality.innerText = info.personality;

				const main_stats = [];
				for (const attr of ['hab', 'adr', 'end', 'cha']) main_stats.push({ bullet: true, label: info[attr].title, value: info[attr].total });
				$main_stats.show(main_stats);

				const second_stats = [];
				for (const attr of ['deg', 'arm', 'crit', 'pv_max']) second_stats.push({ bullet: true, label: info[attr].title, value: info[attr].total });
				$second_stats.show(second_stats);
			} else {
				continue_btn.setAttribute('disabled', '');
				$billy_p.classList.add('hidden');
				$v_split.classList.add('hidden');
			}
		};
	}

	continue_btn.onclick = e => {
		e.preventDefault();
		saveUserData(old => ({
			equipment: selected_equipment.map(eq => eq.label)
		}));
		location.href = continue_btn.href;
	};
};
