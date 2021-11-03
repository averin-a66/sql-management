import * as vscode from 'vscode';
import * as Interfaces from '../Interface/interfaces';
import { getNonce } from '../Utils/Utils';

import IDBNode = Interfaces.sqlProvider.IDBNode;
import ITableColumn = Interfaces.sqlProvider.ITableColumn;

export class SqlTableEditor {
	panel: vscode.WebviewPanel;
	hasChanged : boolean;
	tableJsonStart : any;

	constructor(private context: vscode.ExtensionContext, private tableJson: any, private tableNode: IDBNode) {
		const title = `${tableJson.schema}.${tableJson.name} [${tableNode.rootDB.name}]`;
		this.tableJsonStart = tableJson;
		this.hasChanged = false;
		this.panel = vscode.window.createWebviewPanel(
			'tableEditor',  		// Identifies the type of the webview. Used internally
			title, 					// Title of the panel displayed to the user
			vscode.ViewColumn.One, 	// Editor column to show the new webview panel in.
			{
				enableScripts: true
			} 						// Webview options. More on these later.
		);

		this.panel.webview.html = this.getHtmlForWebview(this.panel.webview);
		this.updatePropertiesColumn(1);

		function updateWebview() {
			this.panel.webview.postMessage({
				type: 'update',
				text: JSON.stringify(tableJson, null, 2),
			});
		}
		
		this.panel.webview.onDidReceiveMessage(e => {
			switch (e.type) {
				case 'focus':
					this.updatePropertiesColumn(Number.parseInt(e.id.substr(3)));
					return;

				case 'change-editor':
					this.processChangeColumnData(e);
					return;

				case 'add-column':
					return;

				case 'delete-column':
					return;

				case 'save-data-prepare':
					this.doSavePrepare();
					return;
				case 'execute-sql':
					return;
			}
		});

		this.panel.onDidDispose(
			() => { console.info('Destroy webView'); },
			null,
			context.subscriptions
		);

		updateWebview();
	}

	private processChangeColumnData( e: any) : void {
		const idx =  Number.parseInt(e.idx.substr('column-'.length));
		const nameProperty = e.id.substr('edit-'.length);
		const clm : ITableColumn = this.tableJson.columns[idx-1];
		clm[nameProperty] = e.value;
		this.hasChanged = true;
	}

	private setActivePage(idx : number) {
		this.panel.webview.postMessage({
			type: 'set-active-page',
			indexPage: idx
		});
	}

	private createSqlText() : {text : string, countLine : number } {
		let sql = '';

		sql = 
		`CREATE TABLE [dbo].[cfg_Config](
			[CONFIG_NO] [bigint] NOT NULL,
			[STT] [tinyint] NOT NULL,
			[TS] [timestamp] NOT NULL,
			[NAME] [varchar](128) NOT NULL,
			[NAME_SYS] [varchar](128) NOT NULL,
			[VAL] [varchar](1000) NULL,
			[STATE] [int] NOT NULL,
			[TAG] [varchar](1000) NULL,
			[GROUP_ENM] [smallint] NOT NULL,
			[CLASS_NO] [bigint] NOT NULL,
		 CONSTRAINT [PK__cfg_Config] PRIMARY KEY NONCLUSTERED 
		(
			[CONFIG_NO] ASC
		)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, FILLFACTOR = 90) ON [PRIMARY]
		) ON [PRIMARY]`;

		return {text:sql, countLine:16};
	}

	private doSavePrepare() : void {
		console.log('doSave');
		const sql = this.createSqlText();
		this.panel.webview.postMessage({
			type: 'view-sql-text',
			sql : sql.text,
			countRow: sql.countLine
		});
		//this.tableJsonStart = this.tableJson;
	}

	private updatePropertiesColumn(columnIdx : number) : void {
		this.updateProperties( this.createColumnProperties(columnIdx), 'ColumnProperties', 'Свойства столбца');
	}

	private createColumnProperties(idx: number) : string {
		let result = '';

		const clm :ITableColumn = this.tableJson.columns[idx-1];

		function htmlEditorRow( caption : string, type : string, id : string, value : string ) : string {
			const html = 
			`<div class="inspector-row">
				<div class="inspector-caption">${caption}</div>
			   	<div class="inspector-data">
			   		<input id="${id}" class="inspector-editor" type="${type}" `+ 
						(type === 'checkbox' ? `onclick="doChangeEditor('${id}')"` : ` onchange="doChangeEditor('${id}')"`)+
						(type === 'checkbox' ? (value=='true'? ' checked': '') : ` value="${value===null? '' : value }"`)+
						`/>
				</div>
			</div>`;
			return html;
		}

		result = 
			`Свойства столбца
			<div class="inspector-table" id="column-${idx}">`+
				htmlEditorRow( 'Имя столбца', 'text', 'edit-name', clm.name )+
				htmlEditorRow( 'Не NULL', 'checkbox', 'edit-isNullable', clm.isNullable.toString() )+
				htmlEditorRow( 'Уникальный', 'checkbox', 'edit-isUnique', clm.isUnique.toString() )+
				htmlEditorRow( 'Автоинкриментнный', 'checkbox', 'edit-isAutoIncremental', clm.isAutoIncremental.toString() )+
				htmlEditorRow( 'Значение по умолчанию', 'text', 'edit-defaultValue', clm.defaultValue )+
			`</div>`;
		return result;
	}

	private get webView(): vscode.Webview {
		return this.panel.webview;
	}


	// ☑🔑🔗✔✖❌❎❓❔❕❗▫▪▶☑⚠⚡⚪⚫📁📂📃📄📅📆📈📊📋📌📍📎📟🔍💭🔲🔳

	private updateProperties( HTMLtext : string, kindProperties: string, nameProperty: string) {
		this.panel.webview.postMessage({
			type: 'set'+kindProperties,
			properties: HTMLtext,
			nameProperty : nameProperty,
		});
	}

	private getHtmlColumns() : string {
		let html = 
		`<div class="div-table">
			<div class="div-head-row">
			   <div class="div-cell data-check">▫</div>
			   <div class="div-cell">Имя поля</div>
			   <div class="div-cell">Тип данных</div>
			   <div class="div-cell data-check">Не NULL</div>
			   <div class="div-cell data-check"">Уника-льный</div>
			   <div class="div-cell data-check"">Автоин-кримен-тнный</div>
			   <div class="div-cell">Значение по умолчанию</div>
			</div>`;
		let tabIndex = 0;
		for (const column of this.tableJson.columns || []) {
			const focused = tabIndex==0 ? ' focused' : '';
			const isPK = tabIndex==0 ? '🔑' : '▫';
			html +=  
			`<div class="div-row${focused}" tabIndex="${tabIndex++}" id="Clm${tabIndex}" onfocus="doFocusedField('Clm${tabIndex}')">
				<div class="div-cell data-check">${isPK}</div>
				<div class="div-cell">${column.name}</div>
				<div class="div-cell">${column.type}</div>
				<div class="div-cell data-check">`+(column.isNullable?`🔲`:`🔳`)+`</div>
				<div class="div-cell data-check">`+(column.isUnique?`🔲`:`🔳`)+`</div>
				<div class="div-cell data-check">`+(column.isAutoIncremental?`🔲`:`🔳`)+`</div>
				<div class="div-cell">`+(column.defaultValue===null? `▫` :column.defaultValue) +`</div>
			</div>`;

		}
		html += `</div>`;
		return html;
	}

	private getHtmlForWebview(webview: vscode.Webview): string {
		// Local path to script and css for the webview
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'tableEditor.js'));
		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'reset.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'media', 'sqlEditors.css'));

		const nonce = getNonce();
		// Use a nonce to whitelist which scripts can be run
		const html = /* html */`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<!--meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';"-->

				<link href="${styleResetUri}" rel="stylesheet" />
				<link href="${styleVSCodeUri}" rel="stylesheet" />
				<link href="${styleMainUri}" rel="stylesheet" />

				<title>Cat Scratch</title>
			</head>
			<body>
				<div class="container">
					<ul id="tabs-title" >
						<li id="tab-title1" onclick="SelectTab(1);" class="tab-title selected-li">Поля</li>
						<li id="tab-title2" onclick="SelectTab(2);" class="tab-title">Внешние ключи</li>
						<li id="tab-title3" onclick="SelectTab(3);" class="tab-title">Индексы</li>
						<li id="tab-title4" onclick="SelectTab(4);" class="tab-title">Проверки</li>
						<li id="tab-title5" onclick="SelectTab(5);" class="tab-title">Триггеры</li>
						<li id="tab-title6" onclick="SelectTab(6);" class="tab-title">Данные</li>
						<li id="tab-title7" onclick="SelectTab(7);" class="tab-title">DDL</li>
						<li id="tab-title8" onclick="SelectTab(8);" class="tab-title">Скрипт</li>
		  			</ul>
			  		<div id="tabs">
						<div class="tab selected" id="tab1">
							<div class="container-head">
								<button class="tool-button" id="button-save" onclick="doSavePrepare()" disabled>Сохранить</button>
								<button class="tool-button" id="button-add">Add</button>
								<button class="tool-button" id="button-remove">Remove</button>
							</div>
							<div class="container-editor">
								<div class="col-3-4">
									${this.getHtmlColumns()}
								</div>
								<div class="col-1-4 inspector-column">
				  					<div class="inspector-class">Inspector column
									</div>
								</div>
							</div>
						</div>
						<div class="tab" id="tab2">
							Вторая вкладка Вторая вкладка Вторая вкладка Вторая вкладка Вторая вкладка
						</div>
						<div class="tab" id="tab3">
							Третья вкладка Третья вкладка Третья вкладка Третья вкладка Третья вкладка
						</div>
						<div class="tab" id="tab4">
							4
						</div>
						<div class="tab" id="tab5">
							5
						</div>
						<div class="tab" id="tab6">
							6
						</div>
						<div class="tab" id="tab7">
							7
						</div>
						<div class="tab" id="tab8">
							<div class="container-head">
								<button class="tool-button" id="button-execute-sql" onclick="doExecSql()">Выполнить</button>
							</div>
							<div class="container-editor">
							  <textarea class="sql-viewer" id="sql-text" readonly></textarea>
							</div>
						</div>
					</div>
				</div>
				<script  src="${scriptUri}"></script>
			</body>
			</html>`;

		return html;

	}

	/**
	 * Write out the json to a given document.
	 */
	private updateTextDocument(document: vscode.TextDocument, json: any) {
		const edit = new vscode.WorkspaceEdit();

		// Just replace the entire document every time for this example extension.
		// A more complete extension should compute minimal edits instead.
		edit.replace(
			document.uri,
			new vscode.Range(0, 0, document.lineCount, 0),
			JSON.stringify(json, null, 2));

		return vscode.workspace.applyEdit(edit);
	}
}