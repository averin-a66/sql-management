import * as json from 'jsonc-parser';
//import {findNodeAtLocation} from 'jsonc-parser';
import { Pool, QueryResult, Client } from 'pg';
import * as Interfaces from '../Interface/interfaces';
import * as PGProvider from '../sqlProvider/PGProvider';

import ISqlSchema = Interfaces.sqlProvider.ISqlSchema;
import IDBDriver = Interfaces.sqlProvider.IDBDriver;
import IProperties = Interfaces.sqlProvider.IProperties;
import ITables = Interfaces.sqlProvider.ITables;
import IViews = Interfaces.sqlProvider.ITables;
import IColumns = Interfaces.sqlProvider.IColumns;
import IIndexes = Interfaces.sqlProvider.IIndexes;
import kindObjectDB = Interfaces.sqlProvider.kindObjectDB;
import IDBNode = Interfaces.sqlProvider.IDBNode;
import ItoDBTree = Interfaces.sqlProvider.ItoDBTree;

import Table = PGProvider.PGProvider.Table;
import TableColumn = PGProvider.PGProvider.TableColumn;
import View = PGProvider.PGProvider.View;
import SqlSchema = PGProvider.PGProvider.SqlSchema;
import DBNode = PGProvider.PGProvider.DBNode;

export namespace PGDriver {

	export class DBDriver implements IDBDriver {
		public typeServer: string;
		public host: string;
		public port: number;
		public database: string;
		public user: string;
		public password: string;
		public properties: IProperties;
		static pool: Pool = undefined;
		private DBTree: json.Node;

		constructor(config?: any) {
			this.typeServer = 'PostgreSql';
			if (config === undefined) {
				this.host = 'localhost';
				this.port = 5432;
				this.user = 'postgres';
			}
			else {
				this.host = config.host;
				this.database = config.dataBase;
				this.user = config.user;
				this.password = config.password;
			}

			this.properties = {};
			this.properties.idleTimeoutMs = 30000;
			this.properties.connectionTimeoutMs = 12000;
		}

		public getPool(): Pool {
			if (DBDriver.pool == undefined) {
				DBDriver.pool = new Pool({
					host: this.host,
					database: this.database,
					user: this.user,
					password: this.password,
					port: this.port,
					idleTimeoutMillis: this.properties['idleTimeoutMs'],
					connectionTimeoutMillis: this.properties['connectionTimeoutMs'],
				});
			}
			return DBDriver.pool;
		}

		getConnectionStr(): string {
			throw new Error('Method not implemented.');
		}

		public connected(): boolean {
			return DBDriver.pool == undefined;
		}

		public connect() {
			this.getPool();
		}

		public disconnect() {
			DBDriver.pool.end();
			DBDriver.pool = undefined;
		}

		private initJson(): json.Node {
			this.DBTree = json.parseTree(`{"name" : ${this.database}, "tables":[], "views":[]}`);
			return this.DBTree;
		}

		private async fillTableIndexes(): Promise<Array<{ string, IIndexes }> | undefined> {
			const result: Array<{ string, IIndexes }> = [];
			const sql =
				`SELECT *
				FROM information_schema.columns
				where table_schema NOT IN ('pg_catalog', 'information_schema')
				order by table_schema, table_name, ordinal_position;`;

			try {
				const res = await DBDriver.pool.query(sql);
			}
			catch (err) {
				console.error('Error executing query', err.stack);
			}

			return undefined;
		}

		private async fillTableColumns(): Promise<Array<{ string, IColumns }> | undefined> {
			const result: Array<{ string, IColumns }> = [];
			const sql =
				`SELECT *
				FROM information_schema.columns
				where table_schema NOT IN ('pg_catalog', 'information_schema')
				order by table_schema, table_name, ordinal_position;`;

			try {
				const res = await DBDriver.pool.query(sql);
				for (let i = 0; i < res.rows.length;) {
					const schema = res.rows[i].table_schema;
					const table = res.rows[i].table_name;
					const columns: IColumns = {};
					for (; i < res.rows.length && schema == res.rows[i].table_schema && table == res.rows[i].table_name; i++) {
						const column = new TableColumn(res.rows[i].column_name, res.rows[i].data_type);
						columns[res.rows[i].column_name] = column;
					}
					result[schema + '.' + table] = columns;
				}
				return result;
			}
			catch (err) {
				console.error('Error executing query', err.stack);
				return undefined;
			}
		}

		private async fillTablesAndViews(srv: ISqlSchema): Promise<ISqlSchema | undefined> {
			const sql = "SELECT table_schema, table_name, table_type FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema');";
			try {
				const arrayColumns = await this.fillTableColumns();
				const res = await DBDriver.pool.query(sql);
				const tbl: ITables = {};
				const vw: IViews = {};
				for (let i = 0; i < res.rows.length; i++) {
					const schema = res.rows[i].table_schema;
					const name = res.rows[i].table_name;
					const type = res.rows[i].table_type;

					console.log(`${schema}.${name} ${type}`);
					if (type == 'VIEW') {
						vw[schema + '.' + name] = new View(name, schema, arrayColumns[schema + '.' + name]);
					}
					else {
						tbl[schema + '.' + name] = new Table(name, schema, arrayColumns[schema + '.' + name]);
					}
				}
				srv.tables = tbl;
				srv.views = vw;
				return srv;
			}
			catch (err) {
				console.error('Error executing query', err.stack);
				return undefined;
			}
		}

		public async listSqlObjects(): Promise<ISqlSchema> {
			this.connect();
			const result: ISqlSchema = new SqlSchema(this.database);
			try {
				await this.fillTablesAndViews(result);
			}
			finally {
				this.disconnect();
			}

			return result;
		}

		public async TreeDB(node: IDBNode): Promise<DBNode> {
			const tree = this.createStartTreeDB(node);
			const chm: ISqlSchema = await this.listSqlObjects();

			this.insertObjectsToTreeDB(tree.children[PgIndexFolder.Table], chm.tables);
			this.insertObjectsToTreeDB(tree.children[PgIndexFolder.View], chm.views);
			/*for (let i = 0; i < tree.children.length; i++) {
				const treeDb = tree.children[i];
				this.insertObjectsToTreeDB(treeDb.children[PgIndexFolder.Table], chm.tables);
				this.insertObjectsToTreeDB(treeDb.children[PgIndexFolder.View], chm.views);
			}*/

			return tree;
		}

		private insertObjectsToTreeDB(nodeObject: DBNode, schObjects: IProperties): void {
			nodeObject.children = Array<DBNode>();
			let i = 0;
			for (const key in schObjects) {
				nodeObject.children[i++] = schObjects[key].toDBTree();
			}
		}

		public createStartTreeDB(node: IDBNode): DBNode {
			node.children = [
				new DBNode(kindObjectDB.Table, true, 'Таблицы'),
				new DBNode(kindObjectDB.View, true, 'Представления'),
				new DBNode(kindObjectDB.Procedure, true, 'Процедуры'),
				new DBNode(kindObjectDB.Function, true, 'Функции'),
				new DBNode(kindObjectDB.Trigger, true, 'Триггеры'),
				new DBNode(kindObjectDB.Rule, true, 'Правила'),
				new DBNode(kindObjectDB.Index, true, 'Индексы')
			];
			return node;
		}
	}

	export enum PgIndexFolder {
		Table = 0,
		View = 1,
		Procedure = 2,
		Function = 3,
		Trigger = 4,
		Rule = 5,
		Index = 6,
	}


}