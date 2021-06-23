export class LRUCache<T> {

	maxSize : number;
	minSize : number;
	unloadPercent : number;
	unloadPriorityCallback : ( item : T ) => number;

	isFull() : boolean;
	add( item : T, callback : ( item : T ) => void ) : void;
	remove( item : T ) : boolean;

	markUsed( item : T ) : void;
	markAllUnused() : void;

	unloadUnusedContent() : void;
	scheduleUnload( markAllUnused? : boolean );

}
