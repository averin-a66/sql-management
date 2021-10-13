import { off } from 'process';
import { jsonProperty, Serializable } from "Serializable";
import * as sqlSchema from '../Interface/interfaces';

import IProperty = sqlSchema.sqlProvider.IProperty;
import ITableColumn = sqlSchema.sqlProvider.ITableColumn;
import IForeignKey = sqlSchema.sqlProvider.IForeignKey;
import IIndexColumn = sqlSchema.sqlProvider.IIndexColumn;
import DirOrder = sqlSchema.sqlProvider.DirOrder;
import IIndex = sqlSchema.sqlProvider.IIndex;
import KindIndex = sqlSchema.sqlProvider.KindIndex;
import IView = sqlSchema.sqlProvider.IView;
import ITable = sqlSchema.sqlProvider.ITable;

export namespace PGProvider {

	export class Property extends Serializable implements IProperty {
		@jsonProperty(String)
		public name: string;
		@jsonProperty(String)
		public value: string;

		constructor(name: string, value: string) {
			super();
			this.name = name;
			this.value = value;
		}
	}

	export class TableColumn extends Serializable implements ITableColumn {
		@jsonProperty(String)
		public name: string;
		@jsonProperty(String)
		public type: string;
		@jsonProperty(Boolean)
		public isNullable: boolean;
		@jsonProperty(Boolean)
		public isUnique: boolean;
		@jsonProperty(Boolean)
		public isAutoincremental: boolean;
		@jsonProperty(String)
		public defaultValue: string;

		public CreateScript(command: string, properties: Property[]): string {
			switch (command) {
				case 'view': return `${this.name} ${this.type}`;
				default: return `${this.name}`;
			}
		}
		public properties: Property[];

		constructor(name: string, type: string) {
			super();
			this.name = name;
			this.type = type;
			this.isNullable = true;
			this.isUnique = false;
			this.isAutoincremental = false;
			this.defaultValue = null;
			this.properties = [];
		}
	}

	export class ForeignKey extends Serializable implements IForeignKey {
		@jsonProperty(String)
		public name: string;
		@jsonProperty(String)
		public columns: string[];
		@jsonProperty(String)
		public tableForeign: string;
		@jsonProperty(String)
		public columnsForeign: string[];
		CreateScript(command: string, properties: IProperty[]): string {
			throw new Error('Method not implemented.');
		}
		@jsonProperty(String)
		public properties: Property[];

		constructor(name: string, columns: string[], tableForeign: string, columnsForeign: string[]) {
			super();
			this.name = name;
			this.columns = columns;
			this.tableForeign = tableForeign;
			this.columnsForeign = columnsForeign;
			this.properties = [];
		}
	}

	export class IndexColumn extends Serializable implements IIndexColumn {
		public name: string;
		public dir: DirOrder;

		constructor(name: string, dir: DirOrder) {
			super();
			this.name = name;
			this.dir = dir;
		}
	}

	export class Index extends Serializable implements IIndex {
		public name: string;
		public columns: IndexColumn[];
		public kind: KindIndex;
		public isCluster: boolean;
		public fillFactor: number;

		CreateScript(command: string, properties: IProperty[]): string {
			throw new Error('Method not implemented.');
		}
		public properties: Property[];

		constructor(name: string, columns: IndexColumn[]) {
			super();
			this.name = name;
			this.columns = columns;
			this.kind = KindIndex.None;
			this.isCluster = false;
			this.fillFactor = 90;
			this.properties = [];
		}
	}

	export class View extends Serializable implements IView {
		public name: string;
		public schema: string;
		public columns: TableColumn[];
		public indexes: Index[];
		public properties: Property[];

		CreateScript(command: string, properties: IProperty[]): string {
			throw new Error('Method not implemented.');
		}

		constructor(name: string, schema : string, columns: TableColumn[]) {
			super();
			this.name = name;
			this.columns = columns;
			this.indexes = [];
			this.properties = [];
		}
	}

	export class Table extends Serializable implements ITable {
		public name: string;
		public schema: string;
		public columns: TableColumn[];
		public indexes: Index[];
		public foreignKeys: ForeignKey[];
		public properties: Property[];

		CreateScript(command: string, properties: IProperty[]): string {
			throw new Error('Method not implemented.');
		}

		constructor(name: string, schema : string, columns: TableColumn[]) {
			super();
			this.name = name;
			this.columns = columns;
			this.indexes = [];
			this.foreignKeys = [];
			this.properties = [];
		}
	}
}