import { isValidExtensionType } from './utilities.js';

export class ExtensionBase {

	constructor( extType, name ) {

		// the key used to look up into the extension objects
		this.name = name;

		// enforce a 3d-tiles spec supported extensions blob, which we know how to extract
		this.extensionType = extType;
		if ( ! isValidExtensionType( extType ) ) throw Error( `Unsupported Extension Type: ${extType}` );

		// if the extension is used after a root tileset has been loaded
		// this should have any root level data associated with the extension.name
		// ex: for the `3DTILES_content_gltf` extension, it should include the extensionsUsed/Required to load the gltf files
		// referenced in the tileset.
		// - "3DTILES_content_gltf": { "extensionsUsed": ["EXT_mesh_gpu_instancing"], "extensionsRequired": ["EXT_mesh_gpu_instancing"] }
		// see extension specs @ https://github.com/CesiumGS/3d-tiles/tree/main/extensions for what you might find in the .data object.
		this.data = {};

	}

	setTileset( tileset ) {

		// initialize the base data from the top level for this extension if available
		this.data = tileset && tileset.extensions && tileset.extensions[ this.name ] || {};

	}

}
