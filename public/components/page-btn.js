// Button component to trigger page navigation with optional "before" action
class PageBtn extends CustomComponent {
	connectedCallback() {
		this.classList.add('btn');

		this.onclick = async e => {
			await this.before?.();
			openPage(this.getAttribute('page'));
		};
	}
}

register(PageBtn);
