class StatsPage extends CustomComponent {
	static selectors = {
		$personality: '#personality',
		$description: '#description',
		$v_split: '.v-split'
	};

	connectedCallback() {
		this.innerHTML = html`
			<h1>Billy <span id="personality"></span></h1>
			<p id="description"></p>
			<div class="v-split wrap"></div>
			<div id="notes"></div>
			<page-btn page="dashboard">Retour</page-btn>
		`;

		// Update personality and description
		const { personality } = getBillyInfo(getUserData());
		this.$personality.innerText = personality;
		this.$description.innerText = personalities[personality].description;

		this.update();
	}

	update() {
		// Clear list and get data
		this.$v_split.innerHTML = '';
		const user_data = getUserData();
		const infos = getBillyInfo(user_data);

		// Increment stat
		const incrStat = attr => d => {
			if (d > 0 && infos[attr].max && infos[attr].total >= infos[attr].max) return;
			if (!confirm(`Voulez-vous ${d > 0 ? 'ajouter' : 'retirer'} 1 point ${infos[attr].title} bonus ?`)) return;
			saveUserData(data => {
				data.bonuses[attr] += d;
				return data;
			});
			this.update();
		};

		for (const attr of ['hab', 'adr', 'end', 'cha', 'deg', 'arm', 'crit']) {
			const stat = infos[attr];

			this.addStat(stat.title, [
				{ label: 'Base', value: stat.base },
				{ label: 'Carac.', value: stat.perso },
				{ label: 'Matériel', value: stat.equip },
				{ incr: incrStat(attr), value: stat.bonus },
				'separator',
				{ label: 'Total', value: stat.total, bold: true }
			]);
		}

		this.addStat('PV MAX', [
			//
			{ label: 'Base', value: infos.pv_max.base },
			{ incr: incrStat('pv_max'), value: infos.pv_max.bonus },
			'separator',
			{ label: 'Total', value: infos.pv_max.total, bold: true }
		]);
	}

	addStat(title, list) {
		const $data_box = this.$v_split.appendChild(emmet`data-box`);
		$data_box.title = title;
		$data_box.show(list);
	}
}

register(StatsPage);
