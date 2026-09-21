window.onload = () => {
	const { personality } = getUserData();

	document.querySelector('#title').innerText = personality;
};
