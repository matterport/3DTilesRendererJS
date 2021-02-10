import { DefaultLoadingManager } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class GLTFTileLoader {
	constructor( manager = DefaultLoadingManager ) {
		this.manager = manager;
	}

    getLoader() {
        const manager = this.manager;
        return manager.getHandler( 'path.gltf' ) || new GLTFLoader( manager );
    }

	parse( buffer ) {
		return new Promise( ( resolve, reject ) => {
			const loader = this.getLoader();
			loader.parse( buffer, null, model => {
                resolve( model );
            }, reject );
		} );
	}
}
