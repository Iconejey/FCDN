class BooksPage extends CustomComponent {
	connectedCallback() {
		this.innerHTML = html`
			<h1>Choisis ton livre !</h1>
			<img src="/assets/open_book.png" />
			<div id="books-list"></div>
		`;

		const $list = this.querySelector('#books-list');
		const constants = window.CONSTANTS || {};

		for (const [key, book] of Object.entries(constants)) {
			const $btn = emmet`button.btn`;
			$btn.innerText = key;
			$btn.onclick = () => selectBook(key);
			$list.appendChild($btn);
		}
	}
}

register(BooksPage);
