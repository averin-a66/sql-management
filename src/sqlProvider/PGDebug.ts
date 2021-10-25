import * as pgPrv from './PGProvider';
import * as pgDrv from './PGDriver';
import * as json from 'jsonc-parser';

import TableColumn = pgPrv.PGProvider.TableColumn;
import PG = pgDrv.PGDriver.DBDriver;

export namespace dbgPGProvider {

	export async function debugTableColumn() : Promise<pgPrv.PGProvider.DBNode> {
		const pg = new PG();
		pg.database = 'Test';
		pg.password = 'Bdfysx1966';
		const tree = await pg.TreeDB(undefined);

		return tree;
	}
}
