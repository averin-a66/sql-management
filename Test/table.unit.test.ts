import { TableColumn } from '../src/sqlProvider/PGProvider';
import { suite, test } from '@testdeck/mocha';
import * as _chai from 'chai';
import { expect } from 'chai';

_chai.should();
_chai.expect;

@suite class TableColumnModuleTest {
  private SUT: TableColumn;
  private name: string;
  private type: string;

  before() {
    this.name = 'Id';
    this.type = 'int';
    this.SUT = new TableColumn(this.name, this.type);
  }

  @test 'TableColumn is created' () {
    this.SUT.name.should.to.not.be.undefined.and.have.property('name').equal('Id');
  }
}