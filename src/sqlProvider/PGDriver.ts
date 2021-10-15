import * as json from 'jsonc-parser';
import { Pool, QueryResult, Client } from 'pg';
import * as Interfaces from '../Interface/interfaces';

import IDBDriver = Interfaces.sqlProvider.IDBDriver;
import IProperties = Interfaces.sqlProvider.IProperties;

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
			this.DBTree = json.parseTree(`{"name" : ${this.database}, "tables:[]", "views":[]}`);
			return this.DBTree;
		}

		private fillTablesAndViews(json: json.Node): json.Node {
			const sql = "SELECT table_schema, table_name, table_type FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema');";
			DBDriver.pool.query(sql)
				.then(res => {
					for( let i=0; i < res.rows.length; i++) {
						console.log(`${res.rows[i].table_schema}.${res.rows[i].table_name} ${res.rows[i].table_type}`);	
					}
				})
				.catch(err => {
					console.error('Error executing query', err.stack);
				});
			return json;
		}

		public listSqlObjects(): json.Node {
			this.connect();
			let result: json.Node = this.initJson();
			try {

				result = this.fillTablesAndViews(result);
			}
			finally {
				this.disconnect();
			}

			return result;
		}
	}
}