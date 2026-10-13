let current_book = null;

// Open a page by name and render its component directly inside document.body
function openPage(page_name) {
	document.body.innerHTML = '';
	document.body.appendChild(emmet`${page_name}-page`);
}

// Select a book and navigate to dashboard or welcome page
function selectBook(key) {
	current_book = key;
	openPage(getUserData() ? 'dashboard' : 'welcome');
}

// Run the initial check on load
window.addEventListener('DOMContentLoaded', async () => {
	window.CONSTANTS = await (await fetch('/CONSTANTS.json')).json();
	openPage('books');
});

// Get user data
function getUserData() {
	const string_data = localStorage.getItem('data');
	if (!string_data) return null;

	let data = JSON.parse(string_data);

	// Migrate old data format if not up to date
	if (!data?.FCDN) {
		localStorage.setItem('data_backup', string_data);
		data = { FCDN: data };
		localStorage.setItem('data', JSON.stringify(data));
	}

	return current_book ? data[current_book] || null : null;
}

// Save user data
function saveUserData(callback) {
	if (!current_book) return;
	const string_data = localStorage.getItem('data');
	const data = string_data ? JSON.parse(string_data) : {};

	const new_book_data = callback(getUserData());
	if (new_book_data) {
		data[current_book] = new_book_data;
		localStorage.setItem('data', JSON.stringify(data));
	}
}

// Get Billy info
function getBillyInfo(user_data = {}) {
	const equipment = user_data?.equipment || [];
	const bonuses = user_data?.bonuses || {};
	const respect = user_data?.respect || 0;
	const resentment = user_data?.resentment || 0;
	const book_constants = window.CONSTANTS?.[current_book];
	if (!book_constants) return null;

	const info = JSON.parse(JSON.stringify(book_constants.default_info));

	for (const key of Object.keys(info)) {
		if (info[key] && typeof info[key] === 'object' && 'bonus' in info[key]) {
			info[key].bonus = bonuses[key] ?? 0;
		}
	}

	// Apply opinion bonuses if opinions definition exists
	if (book_constants.opinions) {
		const diff = respect - resentment;
		let key = null;
		if (diff >= 4) key = 'max_respect';
		else if (diff >= 2) key = 'high_respect';
		else if (diff <= -4) key = 'max_resentment';
		else if (diff <= -2) key = 'high_resentment';

		if (key && book_constants.opinions[key]) {
			for (const [attr, val] of Object.entries(book_constants.opinions[key])) {
				if (info[attr]) info[attr].opinion = (info[attr].opinion || 0) + val;
			}
		}
	}

	const equipment_options = book_constants.equipment_options || [];
	const personalities = book_constants.personalities || {};

	const equip_type_counts = { ARME: 0, ÉQUIPEMENT: 0, OUTIL: 0 };

	for (const label of equipment) {
		const eq = equipment_options.find(op => op.label === label);
		if (!eq) continue;
		for (const attr of ['hab', 'adr', 'end', 'cha', 'deg', 'arm', 'crit', 'pv_max']) {
			if (info[attr] && eq[attr]) {
				info[attr].equip = (info[attr].equip || 0) + eq[attr];
			}
		}
		if (eq.type) equip_type_counts[eq.type] = (equip_type_counts[eq.type] || 0) + 1;
	}

	if (equipment.includes('LA DAGUE') && (equipment.includes("L'ARC") || equip_type_counts.ARME >= 2)) {
		info.notes.push("<b>LA DAGUE</b> ne vous apporte pas d'<b>HABILETÉ</b> si vous avez <b>L'ARC</b> ou deux <b>ARMES</b>.");
		if (info.hab) info.hab.equip -= 1;
	}

	if (equip_type_counts.ARME >= 2) info.personality = 'GUERRIER';
	if (equip_type_counts.ÉQUIPEMENT >= 2) info.personality = 'PRUDENT';
	if (equip_type_counts.OUTIL >= 2) info.personality = 'PAYSAN';

	for (const attr of ['hab', 'adr', 'end', 'cha', 'deg', 'arm', 'crit', 'pv_max']) {
		const stat = info[attr];
		if (!stat) continue;

		const perso_obj = personalities[info.personality];
		if (perso_obj?.[attr]) {
			stat.perso = (stat.perso || 0) + perso_obj[attr];
		}

		if (attr !== 'pv_max') {
			stat.total = (stat.base || 0) + (stat.equip || 0) + (stat.perso || 0) + (stat.opinion || 0) + (stat.bonus || 0);

			if (stat.max && stat.total > stat.max) {
				info.notes.push(`Tu ne peux pas avoir plus de ${stat.max} ${stat.title}`);
				stat.total = stat.max;
			}
		}
	}

	if (info.pv_max && info.end) {
		info.pv_max.end = info.end.total * 3;
		info.pv_max.total = info.pv_max.end + (info.pv_max.equip || 0) + (info.pv_max.perso || 0) + (info.pv_max.opinion || 0) + (info.pv_max.bonus || 0);
	}

	return info;
}

window.getSituationDmg = (hab_diff, dice_val) => {
	const clamped_diff = Math.max(-7, Math.min(7, hab_diff));
	const situation_table = window.CONSTANTS?.[current_book]?.situation_table;
	return situation_table?.[clamped_diff]?.[dice_val];
};
