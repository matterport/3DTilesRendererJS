
/**
 * 3d-tiles Tile object per spec:
 * (incomplete, expanding as features become supported.)
 * - https://github.com/CesiumGS/3d-tiles/blob/master/specification/schema/tile.schema.json
 */
export interface TileBase {
    boundingVolume : { box: number[] },
    children : TileBase[];
    content : {
        uri? : string;
        boundingVolume : { box: number[] },
        // noted as only existing in the code to support old pre-1.0 tilesets
        url? : string;
    }
    geometricError : number,
    refine? : 'REPLACE' | 'ADD';
	extras? : Record<string, any>;
}

/** Documented 3d-tile state managed by the TilesRenderer* / traverseFunctions! */
export interface Tile extends TileBase {

    parent : Tile;
	/**
	 * Hierarchy Depth from the TileGroup
	 */
	__depth : number;
	/**
	 * The screen space error for this tile
	 */
	__error : number;
	/**
	 * How far is this tiles bounds from the nearest active Camera.
	 * Expected to be filled in during calculateError implementations.
	 */
	 __distanceFromCamera : number;
	/**
	 * This tile is currently active if:
	 *  1: Tile content is loaded and ready to be made visible if needed
	 */
	__active : boolean;
	/**
	 * This tile is currently visible if:
	 *  1: Tile content is loaded
	 *  2: Tile is within a camera frustum
	 *  3: Tile meets the SSE requirements
	 */
	 __visible : boolean;
	/**
	 * Frame number that this tile was last used: active+visible
	 */
	 __lastFrameVisited : number;
	/**
	 * TODO: Document this if it is useful enough to be the default property in the LRU sorting.
	 */
	 __depthFromRenderedParent : number;

}

/** Internal state used/set by the package. */
export interface TileInternal extends Tile {

	// tile description
	__externalTileSet : boolean;
	__contentEmpty : boolean;
	__isLeaf : boolean;

	// resource tracking
	__usedLastFrame : boolean;
	__used : boolean;
	
	// Visibility tracking
	__allChildrenLoaded : boolean;
	__childrenWereVisible : boolean;
	__inFrustum : boolean;
	__wasSetVisible : boolean;

	// download state tracking

	/**
	 * This tile is currently active if:
	 *  1: Tile content is loaded and ready to be made visible if needed
	 */
	__active : boolean;
	__loadIndex : number;
	__loadAbort : AbortController | null;
	/** TODO: enum for -> UNLOADED, LOADING, PARSING, LOADED, FAILED from constants.js */
	__loadingState : number;
	__wasSetActive : boolean;

}
