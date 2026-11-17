let current_book = null;
let user_data_store = {};

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

function getUserId() {
	let user_id = localStorage.getItem('user_id');
	if (!user_id) {
		user_id = Array.from(crypto.getRandomValues(new Uint8Array(16)), b => (b % 32).toString(32)).join('');
		localStorage.setItem('user_id', user_id);
	}
	return user_id;
}

async function loadServerData() {
	const user_id = getUserId();
	const res = await fetch(`/api/data/${user_id}`);
	return res.ok ? await res.json() : {};
}

async function saveServerData(data) {
	const user_id = getUserId();
	await fetch(`/api/data/${user_id}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});
}

// Run the initial check on load
window.addEventListener('DOMContentLoaded', async () => {
	getUserId();
	const string_data = localStorage.getItem('data');

	if (string_data) {
		let data = JSON.parse(string_data);
		if (data.pv) data = { FCDN: data };
		localStorage.setItem('backup', string_data);
		localStorage.removeItem('data');
		user_data_store = data;
		await saveServerData(user_data_store);
	} else {
		user_data_store = await loadServerData();
	}

	window.CONSTANTS = await (await fetch('/CONSTANTS.json')).json();
	openPage('books');
});

// Get user data
function getUserData() {
	return current_book ? user_data_store[current_book] || null : null;
}

// Save user data
function saveUserData(callback) {
	if (!current_book) return;

	const new_book_data = callback(getUserData());
	if (new_book_data) {
		user_data_store[current_book] = new_book_data;
		saveServerData(user_data_store);
	}
}

// Get opinion key
function getOpinionKey(respect = 0, resentment = 0, book = current_book) {
	const opinions = window.CONSTANTS?.[book]?.opinions;
	if (!opinions) return null;

	const diff = (respect || 0) - (resentment || 0);
	let key = null;
	if (diff >= 4) key = 'max_respect';
	else if (diff >= 2) key = 'high_respect';
	else if (diff <= -4) key = 'max_resentment';
	else if (diff <= -2) key = 'high_resentment';

	return key && opinions[key] ? key : null;
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
	const opinion_key = getOpinionKey(respect, resentment);
	if (opinion_key && book_constants.opinions?.[opinion_key]) {
		for (const [attr, val] of Object.entries(book_constants.opinions[opinion_key])) {
			if (info[attr]) info[attr].opinion = (info[attr].opinion || 0) + val;
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
