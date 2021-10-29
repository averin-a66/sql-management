// @ts-check
// Script run within the webview itself.

var vscode;

(function () {
  // Get a reference to the VS Code webview api.
  // We use this API to post messages back to our extension.

  // @ts-ignore
  // eslint-disable-next-line no-undef
  vscode = acquireVsCodeApi();

  const columnPropertiesContainer = /** @type {HTMLElement} */ (document.querySelector('.inspector-column'));

  function setProperties(/**@type {string}*/type, /**@type {string}*/properties, /**@type {string}*/ nameProperty) {
		columnPropertiesContainer.innerHTML = properties;
	}

  window.addEventListener('message', event => {
		const message = event.data; // The json data that the extension sent
		switch (message.type) {
			case 'update':
				const text = message.text;

				// Update our webview's content
				//updateContent(text);

				// Then persist state information.
				// This state is returned in the call to `vscode.getState` below when a webview is reloaded.
				vscode.setState({ text });
				return;

			case 'setColumnProperties':
				columnPropertiesContainer.innerHTML = message.properties;
				return;

		}
	});

}());

function SelectTab(idx) { //idx - выбранная вкладка
  const tabCount = 7; //Всего вкладок
  for (let i = 1; i <= tabCount; ++i) {
    const _tab = /** @type {HTMLElement} */(document.getElementById("tab" + i)); //Div - содержимое вкладки i
    const _tabTitle = /** @type {HTMLElement} */(document.getElementById("tab-title" + i)); //Li - вкладка i
    if (idx != i) { //Если это не выбранная вкладка
      _tab.setAttribute("class", "tab");
      _tabTitle.setAttribute("class", "tab-title");
    }
    else { //Если это выбранная вкладка
      _tab.setAttribute("class", "tab selected");
      _tabTitle.setAttribute("class", "tab-title selected-li");
    }
  }
}

function doFocusedField(/**@type {string}*/ fieldId ) {
  console.log(`fieldId=${fieldId}`);
  const field = /**@type {HTMLElement}*/ (document.getElementById(fieldId));
  const focused = /**@type {HTMLElement}*/ (document.querySelector('.focused'));

  if(focused != field) {
    if(focused) 
        focused.classList.remove('focused');

    field.classList.add('focused');
    vscode.postMessage({
      type: 'focus',
      id: fieldId
    });
  }
}