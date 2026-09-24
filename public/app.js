// Open a page by name and render its component directly inside document.body
function openPage(page_name) {
	document.body.innerHTML = '';
	document.body.appendChild(emmet`${page_name}-page`);
}

// Run the initial check on load
window.addEventListener('DOMContentLoaded', () => {
	openPage(getUserData() ? 'dashboard' : 'welcome');
});

const equipment_options = [
	{ type: 'ARME', label: "L'ÉPEE", hab: 4 },
	{ type: 'ARME', label: 'LA LANCE', hab: 3, adr: 1 },
	{ type: 'ARME', label: 'LA MORGENSTERN', hab: 1, end: 1, deg: 1 },
	{ type: 'ARME', label: "L'ARC", hab: 3, adr: 1, crit: 4 },

	{ type: 'ÉQUIPEMENT', label: 'LA COTTE DE MAILLE', hab: -1, adr: -1, end: 1, arm: 2 },
	{ type: 'ÉQUIPEMENT', label: 'LA MARMITE', end: 2, arm: 1 },
	{ type: 'ÉQUIPEMENT', label: 'LE PAMPHLET TOURISTIQUE', cha: 4 },
	{ type: 'ÉQUIPEMENT', label: 'LE KIT DE SOIN', cha: 1 },

	{ type: 'OUTIL', label: 'LA FOURCHE', hab: 1, end: 3 },
	{ type: 'OUTIL', label: 'LA DAGUE', hab: 1, crit: 6 },
	{ type: 'OUTIL', label: "LE KIT D'ESCALADE", adr: 1 },
	{ type: 'OUTIL', label: 'LE SAC DE GRAINS', end: 2, cha: 2 }
];

const personalities = {
	GUERRIER: { hab: 2, cha: -1, description: 'Vous infligez +1 DÉGÂTS à toutes vos attaques. Baston !' },
	PRUDENT: { cha: 2, hab: -1, description: 'Vous pouvez utiliser votre CHANCE lors des combats (Pas encore implémenté).' },
	PAYSAN: { end: 2, adr: -1, description: "Peu importe les DÉGATS que vous prenez lors d'une attaque, vous ne perdez pas plus de 3 PV." },
	DÉBROUILLARD: { adr: 2, end: -1, description: "Vous pouvez relancer le dé une fois lors de la phase d'attaque pour espérer faire mieux." }
};

const default_user_data = {
	equipment: [],
	pv: 0,
	chance: 0,
	glory: 0,
	wealth: 0,
	bonuses: { hab: 0, adr: 0, end: 0, cha: 0, deg: 0, arm: 0, crit: 0, pv_max: 0 },
	collected_items: [],
	adventure_notes: []
};

// Get user data
function getUserData() {
	const string_data = localStorage.getItem('data');
	if (!string_data) return null;
	return JSON.parse(string_data);
}

// Save user data
function saveUserData(callback) {
	const new_data = callback(getUserData());
	if (new_data) localStorage.setItem('data', JSON.stringify(new_data));
}

// Get Billy info
function getBillyInfo({ equipment, bonuses }) {
	// Default information
	const info = {
		personality: 'DÉBROUILLARD',

		hab: { title: 'HABILITÉ', base: 2, equip: 0, perso: 0, bonus: bonuses.hab, total: 0 },
		adr: { title: 'ADRESSE', base: 1, equip: 0, perso: 0, bonus: bonuses.adr, total: 0, max: 5 },
		end: { title: 'ENDURENCE', base: 2, equip: 0, perso: 0, bonus: bonuses.end, total: 0 },
		cha: { title: 'CHANCE MAX', base: 3, equip: 0, perso: 0, bonus: bonuses.cha, total: 0 },

		deg: { title: 'DÉGÂTS', base: 0, equip: 0, perso: 0, bonus: bonuses.deg, total: 0 },
		arm: { title: 'ARMURE', base: 0, equip: 0, perso: 0, bonus: bonuses.arm, total: 0 },
		crit: { title: 'CRITIQUE', base: 0, equip: 0, perso: 0, bonus: bonuses.crit, total: 0 },

		pv_max: { title: 'PV MAX', base: 0, bonus: bonuses.pv_max, total: 0 },

		notes: []
	};

	// Equipment type counters
	const equip_type_counts = { ARME: 0, ÉQUIPEMENT: 0, OUTIL: 0 };

	// Add equipment stats and count types
	for (const label of equipment) {
		const eq = equipment_options.find(op => op.label === label);
		for (const attr of ['hab', 'adr', 'end', 'cha', 'deg', 'arm', 'crit']) {
			info[attr].equip += eq[attr] || 0;
		}
		equip_type_counts[eq.type]++;
	}

	// No HAB for the dagger if user chose the bow or two weapons
	if (equipment.includes('LA DAGUE') && (equipment.includes('LA DAGUE') || equip_type_counts.ARME >= 2)) {
		info.notes.push("LA DAGUE ne vous apporte pas d'HABILITÉ si vous avez L'ARC ou deux ARMES.");
		info.hab.equip -= 1;
	}

	// Determine personality based on equipment
	if (equip_type_counts.ARME >= 2) info.personality = 'GUERRIER';
	if (equip_type_counts.ÉQUIPEMENT >= 2) info.personality = 'PRUDENT';
	if (equip_type_counts.OUTIL >= 2) info.personality = 'PAYSAN';

	// Add peronality stats and total
	for (const attr of ['hab', 'adr', 'end', 'cha', 'deg', 'arm', 'crit']) {
		const stat = info[attr];

		// Perso stats
		stat.perso += personalities[info.personality][attr] || 0;

		// Total
		stat.total = stat.base + stat.equip + stat.perso + stat.bonus;

		// Max
		if (stat.max && stat.total > stat.max) {
			info.notes.push(`Tu ne peux pas avoir plus de ${stat.max} ${stat.title}`);
			stat.total = stat.max;
		}
	}

	// Determine PV max based on END
	info.pv_max.total = info.end.total * 3;

	return info;
}
