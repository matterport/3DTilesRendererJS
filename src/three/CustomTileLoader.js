import { DefaultLoadingManager } from 'three';

/**
 * A simple wrapper that forwards an input filetype to its
 * registered handler in the LoadingManager
 *
 * Ex: Supporting a single custom .gltf tile.content via:
 * - tilesRenderer.manager.addHandler(/\gltf$/, new GLTFLoader( manager ));
 * - tilesRenderer.registerTileContentParser( 'gltf', CustomTileLoader );
 */
export class CustomTileLoader {

	constructor( manager = DefaultLoadingManager, extension = '' ) {

		this.manager = manager;
		this.extension = `path.${ extension || 'unknown' }`;

	}

	parse( buffer ) {

		const manager = this.manager;
		const handlerKey = this.extension;

		return new Promise( ( resolve, reject ) => {

			const loader = manager.getHandler( handlerKey );

			loader.parse( buffer, null, model => {

				resolve( model );

			}, reject );

		} );

	}

}
