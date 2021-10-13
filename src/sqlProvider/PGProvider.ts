import { off } from 'process';
import { jsonProperty, Serializable } from "Serializable";
import * as sqlSchema from '../Interface/interfaces';

export class Property  extends Serializable implements sqlSchema.IProperty {
	@jsonProperty(String)
	public name: string;
	@jsonProperty(String)
	public value: string;

}

export class TableColumn  extends Serializable implements sqlSchema.ITableColumn {
	@jsonProperty(String)
	public name: string;
	@jsonProperty(String)
	public type: string;
	@jsonProperty(Boolean)
	public isNullable: boolean;
	@jsonProperty(Boolean)
	public isUnique: boolean;
	@jsonProperty(Boolean)
	public isAutoincremental: boolean;
	@jsonProperty(String)
	public defaultValue: string;
	
	public CreateScript(command: string, properties: Property[]): string {
		switch(command) {
			case 'view' : return `${this.name} ${this.type }`;
			default : return `${this.name}`;
		}
	}
	public properties: Property[];
	
	constructor( name : string, type : string )  {
		super();
		this.name = name;
		this.type = type;
		this.isNullable = true;
		this.isUnique = false;
		this.isAutoincremental = false;
		this.defaultValue = null;
	}
}

