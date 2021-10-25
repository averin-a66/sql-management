

export namespace sqlProvider {

	export function indexesToArray<T>(object:{[name:string]:T} | undefined) :  T[] {
		return  object !== undefined ? Object.values(object) : [];
	}
	
}