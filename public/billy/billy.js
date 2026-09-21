window.onload = () => {
	const { personality } = getUserData();
	const descriptions = (document.querySelector('#personality').innerText = personality);
	document.querySelector('#description').innerText = descriptions[personality];

	console.log(getUserData());
	console.log(getBillyInfo());
};
