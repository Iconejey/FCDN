// Check the current path and render the corresponding component
function checkRoute() {
	const user_data = getUserData();
	const active_path = window.location.pathname;

	// Redirect to /welcome if there is no user data and they aren't on /welcome or /equipment
	if (!user_data && !['/welcome', '/equipment'].includes(active_path)) {
		navigate('/welcome');
		return;
	}

	const app_container = $('#app');
	app_container.innerHTML = '';

	if (active_path === '/welcome') {
		const page_element = document.createElement('welcome-page');
		app_container.appendChild(page_element);
	} else if (active_path === '/equipment') {
		const page_element = document.createElement('equipment-page');
		app_container.appendChild(page_element);
	} else if (active_path === '/billy') {
		const page_element = document.createElement('billy-page');
		app_container.appendChild(page_element);
	} else if (active_path === '/dashboard') {
		const page_element = document.createElement('dashboard-page');
		app_container.appendChild(page_element);
	} else {
		// Fallback/Default route
		if (!user_data) navigate('/welcome');
		else navigate('/dashboard');
	}
}

// Navigate to a path without reloading the page
function navigate(path) {
	window.history.pushState({}, '', path);
	checkRoute();
}

// Listen for browser back/forward buttons
window.addEventListener('popstate', checkRoute);

// Intercept all local anchor link clicks for SPA routing
document.addEventListener('click', e => {
	const clicked_link = e.target.closest('a');
	if (clicked_link && clicked_link.href && clicked_link.host === window.location.host) {
		const target_url = new URL(clicked_link.href);
		if (!target_url.pathname.includes('.')) {
			e.preventDefault();
			navigate(target_url.pathname);
		}
	}
});

// Run the initial routing check on load
window.addEventListener('DOMContentLoaded', checkRoute);
