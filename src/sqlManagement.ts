import * as ts from "typescript";
import * as vscode from 'vscode';
import * as json from 'jsonc-parser';
import * as path from 'path';
import * as pgPrv from './sqlProvider/PGProvider';
import * as Interfaces from './Interface/interfaces';
import * as pgDrv from './sqlProvider/PGDriver';
import PG = pgDrv.PGDriver.DBDriver;
import * as Config from './Config/Config.json';

import IDBNode = Interfaces.sqlProvider.IDBNode;
import kindObjectDB = Interfaces.sqlProvider.kindObjectDB;
import factorySqlDriver = Interfaces.sqlProvider.factorySqlDriver;
import IDDL = Interfaces.sqlProvider.IDDL;
import Properties = pgPrv.PGProvider.Properties;
import DBNode = pgPrv.PGProvider.DBNode;

export class SqlManagementProvider implements vscode.TreeDataProvider<IDBNode> {

	private _onDidChangeTreeData: vscode.EventEmitter<IDBNode | null> = new vscode.EventEmitter<IDBNode | null>();
	readonly onDidChangeTreeData: vscode.Event<IDBNode | null> = this._onDidChangeTreeData.event;

	private tree: IDBNode;
	private autoRefresh = true;
	public factoryDrv = (config : any) => {
		return new PG(config);
	}

	constructor(private context: vscode.ExtensionContext) {
		this.autoRefresh = vscode.workspace.getConfiguration('sqlManagement').get('autoRefresh');
		vscode.workspace.onDidChangeConfiguration(() => {
			this.autoRefresh = vscode.workspace.getConfiguration('sqlManagement').get('autoRefresh');
		});

		this.parseConfig().catch( (err) => { console.error(err); });
	}

	public async refreshDB(nodeDB?: IDBNode): Promise<void> {
		await nodeDB.value.TreeDB(nodeDB);
	}

	private async parseConfig(): Promise<void> {
		this.tree = new DBNode(kindObjectDB.DataBases, true, 'Сервера');
		this.tree.children = Array<DBNode>();
		let i = 0;
		Config.connections.forEach(cfg => {
			const srv : DBNode = new DBNode(kindObjectDB.DataBase, false, cfg.name === '' ? cfg.host + ' ' + cfg.dataBase: cfg.name);
			srv.value = this.factoryDrv(cfg);
			this.tree.children[i++] = srv;
		});
	}

	getChildren(node?: IDBNode): Thenable<IDBNode[]> {
		if (node) {
			if(node.kind == kindObjectDB.DataBase && node.children===undefined) {

				node.value.TreeDB(node).then((n)=> {
					this._onDidChangeTreeData.fire(node);
					return Promise.resolve(node.children); 
				});
			}
			return Promise.resolve(node.children);
		} else {
			return Promise.resolve(this.tree ? this.tree.children : []);
		}
	}

	getTreeItem(node: IDBNode): vscode.TreeItem {
		if (node) {
			const notChildren = node.children === undefined;
			const treeItem: vscode.TreeItem = new vscode.TreeItem(node.name, notChildren && node.kind != kindObjectDB.DataBase ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed);
			treeItem.iconPath = this.getIcon(node);
			treeItem.contextValue = kindObjectDB[node.kind] + (node.isFolder ? '_folder' : '');
			treeItem.command = {
				command: 'extension.openSqlObject',
				title: '',
				arguments: [node]
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

	public async select(sqlObject: IDBNode) : Promise<void> {

		if(sqlObject.kind === kindObjectDB.DataBase) {
			console.log('select database');
			if(sqlObject.children === undefined) {
				await sqlObject.value.TreeDB(sqlObject);
			}
			return;
		}

		const ddlObj = sqlObject.value as IDDL;
		if (ddlObj === undefined) {
			console.log('select');
			return; 
		}
		const str = ddlObj.CreateScript(sqlObject.name, {typeResultFile:'json'});
	}
}
