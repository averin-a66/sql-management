import * as fs from 'fs';
import * as ts from "typescript";
import * as vscode from 'vscode';
import * as json from 'jsonc-parser';
import * as path from 'path';
import * as pgPrv from './sqlProvider/PGProvider';
import * as Interfaces from './Interface/interfaces';
import * as pgDrv from './sqlProvider/PGDriver';
import PG = pgDrv.PGDriver.DBDriver;
import * as fileExplorer from './Utils/fileExplorer';
import {SqlTableEditor} from './Editors/tableEditor';


import IDBNode = Interfaces.sqlProvider.IDBNode;
import ITable = Interfaces.sqlProvider.ITable;
import kindObjectDB = Interfaces.sqlProvider.kindObjectDB;
import factorySqlDriver = Interfaces.sqlProvider.factorySqlDriver;
import IDDL = Interfaces.sqlProvider.IDDL;
import Properties = pgPrv.PGProvider.Properties;
import DBNode = pgPrv.PGProvider.DBNode;
import FileSystem = fileExplorer.FileSystem;

export class SqlManagementProvider implements vscode.TreeDataProvider<IDBNode> {

	private _onDidChangeTreeData: vscode.EventEmitter<IDBNode | null> = new vscode.EventEmitter<IDBNode | null>();
	readonly onDidChangeTreeData: vscode.Event<IDBNode | null> = this._onDidChangeTreeData.event;

	private tree: IDBNode;
	private autoRefresh = true;
	public factoryDrv = (config: any) => {
		return new PG(config);
	}

	constructor(private context: vscode.ExtensionContext) {
		this.autoRefresh = vscode.workspace.getConfiguration('sqlManagement').get('autoRefresh');
		vscode.workspace.onDidChangeConfiguration(() => {
			this.autoRefresh = vscode.workspace.getConfiguration('sqlManagement').get('autoRefresh');
		});

		this.parseConfig().catch((err) => { console.error(err); });
	}

	public async refreshDB(nodeDB?: IDBNode): Promise<void> {
		await nodeDB.value.TreeDB(nodeDB);
	}

	private get fileConfig(): string {
		return vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'Config', 'Config.json').fsPath;
	}

	private async getFileCacheUri(nameFile: string, obj: IDBNode): Promise<vscode.Uri> {
		const cacheDbUri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'Cache', obj.rootDB.name);

		if (FileSystem.exists(cacheDbUri)) {
			await FileSystem.createDirectory(cacheDbUri);
		}
		if (!FileSystem.exists(cacheDbUri)) {
				return undefined;
		}

		return vscode.Uri.joinPath(cacheDbUri, nameFile);
	}

	private async parseConfig(): Promise<void> {
		this.tree = new DBNode(kindObjectDB.DataBases, true, 'Сервера');
		this.tree.children = Array<DBNode>();

		const p = this.fileConfig; //vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'Config', 'Config.json').fsPath;
		const json = fs.readFileSync(p).toString();
		const config = JSON.parse(json);
		let i = 0;
		config.connections.forEach(cfg => {
			const srv: DBNode = new DBNode(kindObjectDB.DataBase, false, cfg.name === '' ? cfg.host + '-' + cfg.dataBase : cfg.name);
			srv.value = this.factoryDrv(cfg);
			this.tree.children[i++] = srv;
		});
	}

	getChildren(node?: IDBNode): Thenable<IDBNode[]> {
		if (node) {
			if (node.kind == kindObjectDB.DataBase && node.children === undefined) {

				node.value.TreeDB(node).then((n) => {
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

	public async select(sqlObject: IDBNode): Promise<void> {

		if (sqlObject.kind === kindObjectDB.DataBase) {
			console.log('select database');
			if (sqlObject.children === undefined) {
				await sqlObject.value.TreeDB(sqlObject);
			}
			return;
		}

		const ddlObj = sqlObject.value as IDDL;
		if (ddlObj === undefined) {
			console.log('select');
			return;
		}
		await this.openTable(sqlObject);
	}

	private async openTable(table: IDBNode): Promise<void> {

		const nameFile = await this.getFileCacheUri(`${table.name}.tbljson`, table);
		if (nameFile) {
			const str : string = table.value.CreateScript('FOR_EDIT', { typeResultFile: 'json' });
			try {
				await FileSystem.writeFile(nameFile, str, {create: true, overwrite:true});
				const tableJson = JSON.parse(str);
				const panel = new SqlTableEditor(this.context, tableJson, table);
			}
			catch (e) {
				console.error(e);
			}
		}
	}
}
