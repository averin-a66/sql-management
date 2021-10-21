import * as vscode from 'vscode';
import * as json from 'jsonc-parser';
import * as path from 'path';
import * as pgPrv from './sqlProvider/PGProvider';
import * as Interfaces from './Interface/interfaces';
import * as pgDrv from './sqlProvider/PGDriver';
import PG = pgDrv.PGDriver.DBDriver;

import IDBNode = Interfaces.sqlProvider.IDBNode;
import kindObjectDB = Interfaces.sqlProvider.kindObjectDB;
import IDDL = Interfaces.sqlProvider.IDDL;
import Properties = pgPrv.PGProvider.Properties;

export class SqlManagementProvider implements vscode.TreeDataProvider<IDBNode> {

	private _onDidChangeTreeData: vscode.EventEmitter<IDBNode | null> = new vscode.EventEmitter<IDBNode | null>();
	readonly onDidChangeTreeData: vscode.Event<IDBNode | null> = this._onDidChangeTreeData.event;

	private tree: IDBNode;
	private autoRefresh = true;

	constructor(private context: vscode.ExtensionContext) {
		this.autoRefresh = vscode.workspace.getConfiguration('sqlManagement').get('autoRefresh');
		vscode.workspace.onDidChangeConfiguration(() => {
			this.autoRefresh = vscode.workspace.getConfiguration('sqlManagement').get('autoRefresh');
		});

		/*const pg = new PG();
		pg.host = vscode.workspace.getConfiguration('connect').get('host');
		pg.database = vscode.workspace.getConfiguration('connect').get('dataBase');
		pg.user = vscode.workspace.getConfiguration('connect').get('user');
		pg.password = vscode.workspace.getConfiguration('connect').get('password');

		pg.TreeDB()
			.then((res) => {
				this.tree = res;
			});*/
		this.parseTree().catch( (err) => { console.error(err); });
	}

	refresh(offset?: number): void {
		this.parseTree();
	}

	private async parseTree(): Promise<void> {
		const pg = new PG();
		pg.host = vscode.workspace.getConfiguration('connect').get('host');
		pg.database = vscode.workspace.getConfiguration('connect').get('dataBase');
		pg.user = vscode.workspace.getConfiguration('connect').get('user');
		pg.password = vscode.workspace.getConfiguration('connect').get('password');

		this.tree = await pg.TreeDB();
	}

	getChildren(node?: IDBNode): Thenable<IDBNode[]> {
		if (node) {
			return Promise.resolve(node.children);
		} else {
			return Promise.resolve(this.tree ? this.tree.children : []);
		}
	}

	getTreeItem(node: IDBNode): vscode.TreeItem {
		if (node) {
			const notChildren = node.children === undefined;
			const treeItem: vscode.TreeItem = new vscode.TreeItem(node.name, notChildren ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed);
			treeItem.iconPath = this.getIcon(node);
			treeItem.contextValue = kindObjectDB[node.kind] + (node.isFolder ? '_folder' : '');
			treeItem.command = {
				command: 'extension.openSqlObject',
				title: '',
				arguments: [node.value]
			};

			return treeItem;
		}
		return null;
	}

	private getIcon(node: IDBNode): any {
		const nodeKind = node.kind;
		const isFolder = node.isFolder;
		if (nodeKind === kindObjectDB.Table) {
			return {
				light: this.context.asAbsolutePath(path.join('resources', 'light', 'boolean.svg')),
				dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'boolean.svg'))
			};
		}
		if (nodeKind === kindObjectDB.View) {
			return {
				light: this.context.asAbsolutePath(path.join('resources', 'light', 'string.svg')),
				dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'string.svg'))
			};
		}
		if (isFolder) {
			return {
				light: this.context.asAbsolutePath(path.join('resources', 'light', 'number.svg')),
				dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'number.svg'))
			};
		}
		return null;
	}

	public select(sqlObject: any) : void {

		const ddlObj = sqlObject as IDDL;
		if (ddlObj === undefined) {
			console.log('select');
			return; 
		}
		const prop=new Properties();
		prop['typeResultFile'] = 'json';
		const str = ddlObj.CreateScript(sqlObject.name, prop);
	}
}
