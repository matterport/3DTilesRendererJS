import { ExtensionBase, ExtensionType } from './index.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DefaultLoadingManager } from 'three';

export class GLTFExtension extends ExtensionBase {

	constructor( manager = DefaultLoadingManager ) {

		super( ExtensionType.TILE, '3DTILES_content_gltf' );
		this.manager = manager;
		this.parse = this.parse.bind( this );

	}

	parse( _thereIsNoExtData, buffer, fileExtension ) {

		if ( [ 'glb', 'gltf' ].indexOf( fileExtension ) === - 1 ) return null;

		// TODO(extensions): there's no trivial way to tell whether a GLTFLoader instance supports an extension
		// if there was, we could notify the dev?
		// const requiredGltfExtensions = this.data.extensionsRequired;
		const manager = this.manager;

		return new Promise( ( resolve, reject ) => {

			let loader = manager.getHandler( 'path.gltf' ) || manager.getHandler( 'path.glb' );

			if ( ! loader ) {

				loader = new GLTFLoader( manager );
				loader.crossOrigin = this.crossOrigin;
				loader.withCredentials = this.withCredentials;

			}

			// assume any pre-registered loader has paths configured as the user desires, but if we're making
			// a new loader, use the working path during parse to support relative uris on other hosts
			const resourcePath = loader.resourcePath || loader.path || this.workingPath;

			loader.parse( buffer, resourcePath, model => {

				resolve( model.scene );

			}, reject );

		} );

	}

}
