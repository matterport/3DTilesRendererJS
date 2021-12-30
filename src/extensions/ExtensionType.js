
const ASSET = 'asset';
const CONTENT = 'content';
const TILE = 'tile';
const TILESET = 'tileset';

/** Available extension types */
export const ExtensionType = Object.freeze( {

	/**
	 * Asset extensions: usage tbd?
	 * @ref: https://github.com/CesiumGS/3d-tiles/blob/main/specification/schema/asset.schema.json#L21
	 */
	ASSET: ASSET,
	/**
  	 * spefically run during content download / parse, passed any info in content.extensions
  	 * @ref: https://github.com/CesiumGS/3d-tiles/blob/main/specification/schema/content.schema.json#L21
	 */
	CONTENT: CONTENT,
	/* @ref: https://github.com/CesiumGS/3d-tiles/blob/main/specification/schema/tile.schema.json#L80 */
	TILE: TILE,
	/**
	 * Hooks before/after tileset loading, any data placed in tileset.extensions is available to all extensions
	 * @ref: https://github.com/CesiumGS/3d-tiles/blob/main/specification/schema/tileset.schema.json#L51
	 */
	TILESET: TILESET,

} );
