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
import Table = PGProvider.PGProvider.Table;
import TableColumn = PGProvider.PGProvider.TableColumn;
import View = PGProvider.PGProvider.View;
import SqlSchema = PGProvider.PGProvider.SqlSchema;

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

		constructor() {
			this.host = 'localhost';
			this.port = 5432;
			this.user = 'postgres';
			this.typeServer = 'PostgreSql';
			this.properties = {};
			this.properties['idleTimeoutMs'] = 30000;
			this.properties['connectionTimeoutMs'] = 12000;
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

		private async fillTableColumns(): Promise<Array<{string,IColumns}>> {
			const result : Array<{string,IColumns}> = [];
			const sql = 
			`SELECT *
				FROM information_schema.columns
				where table_schema NOT IN ('pg_catalog', 'information_schema')
				order by table_schema, table_name, ordinal_position;`;

			try {
				const res = await DBDriver.pool.query(sql);
				for( let i=0; i < res.rows.length;) {
					const schema = res.rows[i].table_schema;
					const table = res.rows[i].table_name;
					const columns : IColumns = {};
					for(; i < res.rows.length && schema == res.rows[i].table_schema && table == res.rows[i].table_name; i++) {
						const column = new TableColumn(res.rows[i].column_name, res.rows[i].data_type);
						columns[res.rows[i].column_name] = column;
					}
					result[schema+'.'+table] = 	columns;
				}
				return result;
			}
			catch(err){
				console.error('Error executing query', err.stack);
				return undefined;
			}
		}

		private async fillTablesAndViews(srv : ISqlSchema): Promise<ISqlSchema> {
			const sql = "SELECT table_schema, table_name, table_type FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema');";
			try {
				const arrayColumns = await this.fillTableColumns();
				const res = await DBDriver.pool.query(sql);
				const tbl : ITables = {};
				const vw : IViews = {};
				for( let i=0; i < res.rows.length; i++) {
					const schema = res.rows[i].table_schema;
					const name = res.rows[i].table_name;
					const type = res.rows[i].table_type;

					console.log(`${schema}.${name} ${type}`);	
					if(type == 'VIEW') {
						vw[schema+'.'+name] = new View(name, schema, arrayColumns[schema+'.'+name]);
					}
					else {
						tbl[schema+'.'+name] = new Table(name, schema, arrayColumns[schema+'.'+name]);
					}
				}
				srv.tables = tbl;
				srv.views = vw;
				return srv;
			}
			catch(err) {
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
	}
}