'use strict';

import * as vscode from 'vscode';
import { SqlManagementProvider } from './sqlManagement';

export function activate(context: vscode.ExtensionContext) {
	const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

	const sqlManagementProvider = new SqlManagementProvider(context);
	vscode.window.registerTreeDataProvider('sqlManagement', sqlManagementProvider);
	//vscode.commands.registerCommand('sqlManagement.refresh', () => sqlManagementProvider.refresh());
	vscode.commands.registerCommand('sqlManagement.refreshDB', nodeDb => sqlManagementProvider.refreshDB(nodeDb));
	vscode.commands.registerCommand('extension.openSqlObject', sqlObject => sqlManagementProvider.select(sqlObject));
	//vscode.commands.registerCommand('sqlManagement.renameNode', offset => sqlManagementProvider.rename(offset));

}