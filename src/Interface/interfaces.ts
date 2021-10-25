import * as json from 'jsonc-parser';

export namespace sqlProvider {

	export interface IDBNode {
		children : IDBNode[] | undefined;
		value : any | undefined;
		kind : kindObjectDB;
		isFolder : boolean;
		name : string;
	}

	export interface ItoDBTree {
		toDBTree() : IDBNode;
	}

	export interface IProperties {
		[values: string] : any;
	}

	export interface IHasProperties {
		properties: IProperties;
	}

	export interface IDDL {
		CreateScript(command: string, properties?: IProperties): string;
	}

	export interface IDbObject {
		name: string;
		schema: string;
	}

	export interface ITableColumn extends IDDL, IHasProperties {
		name: string;
		type: string;
		isNullable: boolean;
		isUnique: boolean;
		isAutoIncremental: boolean;
		defaultValue: string;
	}

	export interface IForeignKey extends IDDL, IHasProperties {
		name: string;
		columns: string[];
		tableForeign: string;
		columnsForeign: string[];
	}

	export enum DirOrder {
		Asc,
		Desc
	}

	export enum KindIndex {
		None,
		Primary,
		UniqueKey,
		UniqueIndex
	}

	export interface IIndexColumn {
		name: string;
		dir: DirOrder;
	}

	export interface IIndex extends IDDL, IHasProperties {
		name: string;
		columns: IIndexColumn[];
		kind: KindIndex;
		isCluster: boolean;
		fillFactor: number;
	}

	export interface IIndexes {
		[values: string] : IIndex;
	}

	export interface IColumns {
		[values: string] : ITableColumn;
	}

	export interface IView extends IDDL, IDbObject, IHasProperties, ItoDBTree {
		columns: IColumns;
		indexes?: IIndexes;
	}

	export interface IForeignKeys {
		[values: string] : IForeignKey;
	}

	export interface ITable extends IView {
		foreignKeys?: IForeignKeys;
	}

	export enum KindProgramObject {
		Procedure,
		FunctionScalar,
		FunctionTable
	}

	export enum DirParams {
		In,
		Out,
		InOut
	}

	export interface IParameter {
		name: string;
		type: string;
		dir: DirParams;
	}

	export interface IParameters {
		[values: string] : IParameter;
	}

	export interface IProgramObject extends IDDL, IDbObject, IHasProperties {
		parameters: IParameters;
	}

	export interface IScalarFunction extends IProgramObject {
		typeReturn: string;
	}

	export interface ITableFunction extends IProgramObject {
		tableResult: IColumns;
	}

	export interface IProcedure extends IProgramObject {
		tableResult: IColumns;
	}

	export interface IViews {
		[values: string] : IView;
	}
	export interface ITables {
		[values: string] : ITable;
	}

	export interface IProcedures {
		[values: string] : IProcedure;
	}

	export interface IAllFunctions {
		[values: string] : IProgramObject;
	}

	export interface IScalarFunctions {
		[values: string] : IScalarFunction;
	}

	export interface ITableFunctions {
		[values: string] : ITableFunction;
	}

	export type factorySqlDriver = () => IDBDriver;
	export interface ISqlSchema extends IHasProperties {
		nameSqlServer: string;
		initialized : boolean
		getSchemaJSON(): string;
		getSourceObject(name: string): string;

		schemas: string[];
		tables: ITables;
		views: IViews;
		//functions: IAllFunctions;
		//scalarFunctions: IScalarFunctions;
		//tableFunctions: ITableFunctions;
		//procedures: IProcedures;
	}

	export enum kindObjectDB {
		DataBases,
		DataBase,
		Table,
		View,
		Index,
		ForeignKey,
		Trigger,
		Procedure,
		Function,
		Rule,
		Check,
		UserType,
		Users,
		Column
	}

	export interface IDBDriver extends IHasProperties {
		typeServer : string;
		host : string;
		port : number;
		database : string;
		user : string;
		password : string;

		connect();
		disconnect();
		getConnectionStr() : string;

		listSqlObjects(): Promise<ISqlSchema>;

	}

	
}