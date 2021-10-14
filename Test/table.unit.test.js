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
var TableColumn = prv.PGProvider.TableColumn;
_chai.should();
_chai.expect;
let TableColumnModuleTest = class TableColumnModuleTest {
    before() {
        this.name = 'Id';
        this.type = 'int';
        this.SUT = new TableColumn(this.name, this.type);
    }
    'TableColumn is created'() {
        this.SUT.name.should.to.not.be.undefined.and.have.property('name').equal('Id');
    }
};
__decorate([
    mocha_1.test
], TableColumnModuleTest.prototype, "TableColumn is created", null);
TableColumnModuleTest = __decorate([
    mocha_1.suite
], TableColumnModuleTest);
//# sourceMappingURL=table.unit.test.js.map