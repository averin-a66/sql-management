"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const prv = require("../src/sqlProvider/PGProvider");
const mocha_1 = require("@testdeck/mocha");
const _chai = require("chai");
const chai_1 = require("chai");
var TableColumn = prv.PGProvider.TableColumn;
_chai.should();
_chai.expect;
let TableColumnModuleTest = class TableColumnModuleTest {
    before() {
        this.name = 'Id';
        this.type = 'int';
        this.SUT = new TableColumn(this.name, this.type);
        this.SUT.properties['Comment'] = 'Primary key';
    }
    'TableColumn default created'() {
        (0, chai_1.expect)(this.SUT.name).to.be.equal('Id');
        (0, chai_1.expect)(this.SUT.type).to.be.equal('int');
        (0, chai_1.expect)(this.SUT.defaultValue, 'defaultValue').to.be.null;
        (0, chai_1.expect)(this.SUT.isNullable, 'isNullable').to.be.true;
        (0, chai_1.expect)(this.SUT.isUnique, 'isUnique').to.be.false;
        (0, chai_1.expect)(this.SUT.isAutoIncremental, 'isAutoIncremental').to.be.false;
        (0, chai_1.expect)(this.SUT.properties.length).to.be.equal(1);
        (0, chai_1.expect)(this.SUT.properties['Comment']).to.be.equal('Primary key');
    }
};
__decorate([
    mocha_1.test
], TableColumnModuleTest.prototype, "TableColumn default created", null);
TableColumnModuleTest = __decorate([
    mocha_1.suite
], TableColumnModuleTest);
//# sourceMappingURL=table.unit.test.js.map