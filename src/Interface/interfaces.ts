import * as json from 'jsonc-parser';

export interface IProperty {
	name : string;
	value : string;
}

export interface IHasProperties {
	properties : IProperty[];
}

export interface IDDL {
	CreateScript(command : string, properties : IProperty[]) : string;
}

export interface IDbObject {
	name : string;
	schema : string;
}

export interface ITableColumn extends IDDL, IHasProperties {
	name : string;
	type : string;
	isNullable : boolean;
	isUnique : boolean;
	isAutoincremental : boolean;
	defaultValue : string;
}

export interface IForeignKey extends IDDL, IHasProperties {
	name : string;
	columns : string[];
	tableForeign : string;
	columnsForeign : string[];
}

export enum DirOrder {
	Asc,
	Desc
}

export enum KindIndex {
	Primary,
	UniqueKey,
	UniqueIndex
}

export interface IIndexColumn {
	name : string;
	dir : DirOrder;
}

export interface IIndex extends IDDL, IHasProperties {
	name : string;
	columns : IIndexColumn[];
	kind : KindIndex;
	isCluster : boolean;
	fillFactor : number;
}

export interface IView extends IDDL, IDbObject, IHasProperties {
	columns : ITableColumn[];
	indexes : IIndex[];
}

export interface ITable extends IView {
	foreignKeys : IForeignKey[];
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

export interface IParameter 
{
	name : string;
	type : string;
	dir : DirParams;
}

export interface IProgramObject extends IDDL, IDbObject, IHasProperties {
	parameters : IParameter[];
}

export interface IScalarFunction extends IProgramObject {
	typeReturn : string;
}

export interface ITableFunction extends IProgramObject {
	tableResult : ITableColumn[];
}

export interface IProcedure extends IProgramObject {
	tableResult : ITableColumn[];
}

export interface ISqlSchema {
    nameSqlServer: string;
    connection( connectionString: string ) : boolean;
	getSchemaJSON() : string;
	getSourceObject(name : string) : string;

	schemas : string[];
	tables : ITable[];
	views : IView[];
	functions : IProgramObject[];
	scalarFunctions : IScalarFunction[];
	tableFunctions : ITableFunction[];
	procedures : IProcedure[];
}