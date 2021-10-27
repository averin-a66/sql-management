import * as Interfaces from '../Interface/interfaces';
import * as Utils from '../Utils/Utils';

import IProperties = Interfaces.sqlProvider.IProperties;
import ITableColumn = Interfaces.sqlProvider.ITableColumn;
import IForeignKey = Interfaces.sqlProvider.IForeignKey;
import IIndexColumn = Interfaces.sqlProvider.IIndexColumn;
import DirOrder = Interfaces.sqlProvider.DirOrder;
import IIndex = Interfaces.sqlProvider.IIndex;
import KindIndex = Interfaces.sqlProvider.KindIndex;
import IView = Interfaces.sqlProvider.IView;
import ITable = Interfaces.sqlProvider.ITable;
import IColumns = Interfaces.sqlProvider.IColumns;
import IIndexes = Interfaces.sqlProvider.IIndexes;
import IForeignKeys = Interfaces.sqlProvider.IForeignKeys;
import ITables = Interfaces.sqlProvider.ITables;
import IViews = Interfaces.sqlProvider.IViews;
import ISqlSchema = Interfaces.sqlProvider.ISqlSchema;
import IDBNode = Interfaces.sqlProvider.IDBNode;
import factorySqlDriver = Interfaces.sqlProvider.factorySqlDriver;

import kindObjectDB = Interfaces.sqlProvider.kindObjectDB;

export namespace PGProvider {

	export class Properties implements IProperties {
		[values: string]: string;
	}

	export class TableColumn /*extends Serializable*/ implements ITableColumn {
		//@jsonProperty(String)
		public name: string;
		//@jsonProperty(String)
		public type: string;
		//@jsonProperty(Boolean)
		public isNullable: boolean;
		//@jsonProperty(Boolean)
		public isUnique: boolean;
		//@jsonProperty(Boolean)
		public isAutoIncremental: boolean;
		//@jsonProperty(String)
		public defaultValue: string;

		public CreateScript(command: string, properties?: Properties): string {
			switch (command) {
				case 'create': return `${this.name} ${this.type} ` + this.isNullable ? ' null' : ' not null';
				case 'select':
					return `${this.name}`;
				default: return `${this.name}`;
			}
		}
		public properties: Properties;

		constructor(name: string, type: string) {
			//super();
			this.name = name;
			this.type = type;
			this.isNullable = true;
			this.isUnique = false;
			this.isAutoIncremental = false;
			this.defaultValue = null;
			this.properties = {};
		}
	}

	export class ForeignKey /*extends Serializable*/ implements IForeignKey {
		//@jsonProperty(String)
		public name: string;
		//@jsonProperty(String)
		public columns: string[];
		//@jsonProperty(String)
		public tableForeign: string;
		//@jsonProperty(String)
		public columnsForeign: string[];
		CreateScript(command: string, properties?: IProperties): string {
			throw new Error('Method not implemented.');
		}
		//@jsonProperty(String)
		public properties: Properties;

		constructor(name: string, columns: string[], tableForeign: string, columnsForeign: string[]) {
			//super();
			this.name = name;
			this.columns = columns;
			this.tableForeign = tableForeign;
			this.columnsForeign = columnsForeign;
			this.properties = {};
		}
	}

	export class IndexColumn /*extends Serializable*/ implements IIndexColumn {
		public name: string;
		public dir: DirOrder;

		constructor(name: string, dir: DirOrder) {
			//super();
			this.name = name;
			this.dir = dir;
		}
	}

	export class Index /*extends Serializable*/ implements IIndex {
		public name: string;
		public columns: IndexColumn[];
		public kind: KindIndex;
		public isCluster: boolean;
		public fillFactor: number;

		CreateScript(command: string, properties?: IProperties): string {
			throw new Error('Method not implemented.');
		}
		public properties: Properties;

		constructor(name: string, columns: IndexColumn[]) {
			//super();
			this.name = name;
			this.columns = columns;
			this.kind = KindIndex.None;
			this.isCluster = false;
			this.fillFactor = 90;
			this.properties = {};
		}
	}

	export class View /*extends Serializable*/ implements IView {
		public name: string;
		public schema: string;
		public properties: Properties;
		columns: IColumns;
		indexes: IIndexes;

		CreateScript(command: string, properties?: IProperties): string {
			throw new Error('Method not implemented.');
		}

		constructor(name: string, schema: string, columns: IColumns) {
			//super();
			this.name = name;
			this.columns = columns;
			this.indexes = {};
			this.properties = {};
		}

		toDBTree(nodeDB : IDBNode): IDBNode {
			const tree = new DBNode(kindObjectDB.View, false, this.name, nodeDB);
			tree.value = this;
			return tree;
		}
	}

	export class Table /*extends Serializable*/ implements ITable {
		public name: string;
		public schema: string;
		public columns: IColumns;
		public indexes: IIndexes;
		public foreignKeys: IForeignKeys;
		public properties: Properties;

		CreateScript(command: string, properties?: IProperties): string {
			if (command === 'FOR_EDIT' && properties && properties.typeResultFile === 'json') {
				return this.toJson();
			}
			else {
				return '';
			}
		}

		constructor(name: string, schema: string, columns: IColumns) {
			//super();
			this.schema = schema;
			this.name = name;
			this.columns = columns;
			this.indexes = {};
			this.foreignKeys = {};
			this.properties = {};
		}

        private toJson() : string {
			const json = JSON.parse(JSON.stringify(this, ['name','schema']));
			json.columns = Utils.sqlProvider.indexesToArray<TableColumn>(this.columns);
			json.indexes = Utils.sqlProvider.indexesToArray<Index>(this.indexes);
			json.foreignKeys = Utils.sqlProvider.indexesToArray<ForeignKey>(this.foreignKeys);

			json.properties = Utils.sqlProvider.indexesToArray<any>(this.properties);
			return JSON.stringify(json, null, '  ');
		}

		toDBTree(nodeDB : IDBNode): IDBNode {
			const tree = new DBNode(kindObjectDB.Table, false, this.name, nodeDB);
			tree.children = [
				new DBNode(kindObjectDB.Column, true, 'Поля', nodeDB),
				new DBNode(kindObjectDB.Column, true, 'Внешние ключи', nodeDB),
				new DBNode(kindObjectDB.Column, true, 'Индексы', nodeDB),
				new DBNode(kindObjectDB.Column, true, 'Проверки', nodeDB),
				new DBNode(kindObjectDB.Column, true, 'Триггеры', nodeDB),
			];

			tree.value = this;
			tree.children[0].children = Array<DBNode>();
			let i = 0;
			Object.keys(this.columns).forEach(key => {
				tree.children[0].children[i++] = new DBNode(kindObjectDB.Column, false, key, nodeDB);
			});

			return tree;
		}
	}

	export class SqlSchema implements ISqlSchema {
		public nameSqlServer: string;
		public initialized : boolean;
		public schemas: string[];
		public tables: ITables;
		public views: IViews;
		public properties: IProperties;

		getSchemaJSON(): string {
			throw new Error('Method not implemented.');
		}
		getSourceObject(name: string): string {
			throw new Error('Method not implemented.');
		}

		constructor(name: string, cfg?: any ) {
			//super();
			this.nameSqlServer = name;
			this.properties = { host: "localhost", post: 5432, database:"", user: "postgres", password:""};
			if(cfg !== undefined) {
				this.properties.host = cfg.host;
				this.properties.database = cfg.dataBase;
				this.properties.user = cfg.user;
				this.properties.password = cfg.password;
			}

			this.initialized=false;
		}
	}
	export class DBNode implements IDBNode {
		public children: DBNode[] | undefined;
		public rootDB : IDBNode | undefined;
		public value: any | undefined;
		constructor(public kind: kindObjectDB, public isFolder: boolean, public name: string, rootDB : IDBNode=undefined) {
			this.children = undefined;
			this.value = undefined;
			this.rootDB = rootDB;
		}
	}
}