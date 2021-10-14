import { off } from 'process';
//import { jsonProperty, Serializable } from "ts-serializable";
import * as sqlSchema from '../Interface/interfaces';

import IProperties = sqlSchema.sqlProvider.IProperties;
import ITableColumn = sqlSchema.sqlProvider.ITableColumn;
import IForeignKey = sqlSchema.sqlProvider.IForeignKey;
import IIndexColumn = sqlSchema.sqlProvider.IIndexColumn;
import DirOrder = sqlSchema.sqlProvider.DirOrder;
import IIndex = sqlSchema.sqlProvider.IIndex;
import KindIndex = sqlSchema.sqlProvider.KindIndex;
import IView = sqlSchema.sqlProvider.IView;
import ITable = sqlSchema.sqlProvider.ITable;
import IColumns = sqlSchema.sqlProvider.IColumns;
import IIndexes = sqlSchema.sqlProvider.IIndexes;
import IForeignKeys = sqlSchema.sqlProvider.IForeignKeys;

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

		public CreateScript(command: string, properties: Properties): string {
			switch (command) {
				case 'create': return `${this.name} ${this.type} `+this.isNullable? ' null': ' not null';
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
		CreateScript(command: string, properties: IProperties): string {
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

		CreateScript(command: string, properties: IProperties): string {
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

		CreateScript(command: string, properties: IProperties): string {
			throw new Error('Method not implemented.');
		}

		constructor(name: string, schema : string, columns: IColumns) {
			//super();
			this.name = name;
			this.columns = columns;
			this.indexes = {};
			this.properties = {};
		}
	}

	export class Table /*extends Serializable*/ implements ITable {
		public name: string;
		public schema: string;
		public columns: IColumns;
		public indexes: IIndexes;
		public foreignKeys: IForeignKeys;
		public properties: Properties;

		CreateScript(command: string, properties: IProperties): string {
			throw new Error('Method not implemented.');
		}

		constructor(name: string, schema : string, columns: IColumns) {
			//super();
			this.name = name;
			this.columns = columns;
			this.indexes = {};
			this.foreignKeys = {};
			this.properties = {};
		}
	}
}