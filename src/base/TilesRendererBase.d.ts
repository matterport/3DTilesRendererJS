import { Tile, TileInternal } from '../base/Tile';
import { LRUCache } from '../utilities/LRUCache';
import { PriorityQueue } from '../utilities/PriorityQueue';

export class TilesRendererBase {

	readonly rootTileset : Object | null;
	readonly root : Object | null;

	errorTarget : number;
	errorThreshold : number;
	loadSiblings : boolean;
	displayActiveTiles : boolean;
	maxDepth : number;
	stopAtEmptyTiles : boolean;

	fetchOptions : Object;
	/** function to preprocess the url for each individual tile */
	preprocessURL : ((uri: string | URL) => string) | null;

	lruCache : LRUCache<TileInternal>;
	parseQueue : PriorityQueue<TileInternal>;
	downloadQueue : PriorityQueue<TileInternal>;

	constructor( url : String );
	update() : void;
	traverse(
		beforeCb : ( ( tile : TileInternal, parent : TileInternal, depth : number ) => boolean ) | null,
		afterCb : ( ( tile : TileInternal, parent : TileInternal, depth : number ) => boolean ) | null
	) : void;
	dispose() : void;

}
