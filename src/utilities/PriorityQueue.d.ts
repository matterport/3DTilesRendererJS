export class PriorityQueue<T> {

	maxJobs : number;
	autoUpdate : boolean;
	priorityCallback : ( itemA : T , itemB : T ) => number;

	sort() : void;
	add( item : T, callback : ( item : T ) => any ) : Promise< any >;
	remove( item : any ) : void;

	tryRunJobs() : void;
	scheduleJobRun() : void;

}
