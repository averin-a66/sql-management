import * as prv from '../src/sqlProvider/PGProvider';
import { suite, test } from '@testdeck/mocha';
import * as _chai from 'chai';
import { expect } from 'chai';

import TableColumn = prv.PGProvider.TableColumn;

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
    this.SUT.properties['Comment']= 'Primary key';
  }

  @test 'TableColumn default created' () {
    expect(this.SUT.name).to.be.equal('Id');
    expect(this.SUT.type).to.be.equal('int');
    expect(this.SUT.defaultValue, 'defaultValue').to.be.null;
    expect(this.SUT.isNullable, 'isNullable').to.be.true;
    expect(this.SUT.isUnique, 'isUnique').to.be.false;
    expect(this.SUT.isAutoIncremental, 'isAutoIncremental').to.be.false;

    expect(this.SUT.properties.length).to.be.equal(1);
    expect(this.SUT.properties['Comment']).to.be.equal('Primary key');
  }
}