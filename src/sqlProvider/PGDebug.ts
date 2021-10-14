import * as pgPrv from './PGProvider';
import TableColumn = pgPrv.PGProvider.TableColumn;

export namespace dbgPGProvider {
	
	export function debugTableColumn() {
		const tc : TableColumn = new TableColumn('Id', 'int');
	}
}
