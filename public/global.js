function getUserData() {
	const string_data = localStorage.getItem('data');
	if (!string_data) return null;
	return JSON.parse(string_data);
}

function saveUserData(callback) {
	const new_data = callback(getUserData()) || {};
	localStorage.setItem('data', JSON.stringify(new_data));
}
