import { ExtensionBase, ExtensionType } from './index.js';

/**
 * Map of functions which extract the data required for each type of extension
 * - TBD: may need info from multiple places?
 */
const ExtractTypeData = Object.freeze( {
	[ ExtensionType.ASSET ]: ( tileset ) => tileset && tileset[ ExtensionType.ASSET ] && tileset[ ExtensionType.ASSET ].extensions || null,
	[ ExtensionType.CONTENT ]: ( tileOrTileset ) => tileOrTileset && tileOrTileset[ ExtensionType.CONTENT ] && tileOrTileset[ ExtensionType.CONTENT ].extensions || null,
	[ ExtensionType.TILE ]: ( tile ) => tile && tile.extensions || null,
	[ ExtensionType.TILESET ]: ( tileset ) => tileset && tileset.extensions || null,
} );

const DEFAULT_SUPPORTED_EXTENSIONS = [ '3DTILES_content_gltf' ];

/** Adjust in index.d.ts:FunctionName also */
const SUPPORTED_FUNCTIONS = [ 'parse', 'fetch' ];

/**
 * Manage extensions to the 3d-tiles system.
 *
 * Modeled very loosely after the GLTFLoader extension system in threejs
 */
export class ExtensionSystem {

	constructor( tilesRenderer ) {

		this.tilesRenderer = tilesRenderer;
		// Map<ExtensionType, ExtensionBase[]>
		this.extensions = new Map();
		// Map<FuncName, ExtensionBase[]>
		this.functions = new Map();

		this.extensionsRegistered = new Set( DEFAULT_SUPPORTED_EXTENSIONS.slice() );
		this.extensionsUsed = new Set();
		this.extensionsRequired = new Set();

	}

	// At tileset parse, flag any extensions that are used
	setExtensionsUsed( used ) {

		this.extensionsUsed.add( ...used );

	}

	setExtensionsRequired( required ) {

		this.extensionsRequired.add( ...required );

	}

	// notify of unsupported extensions
	checkSupport( extensionName = undefined ) {

		if ( extensionName ) {

			return this.extensionsRegistered.has( extensionName );

		}

		for ( const ext of this.extensionsUsed.values() ) {

			if ( this.extensionsRegistered.has( ext ) ) {

				console.log( `Optional extension ${ext} was not registered` );

			}

		}

		for ( const ext of this.extensionsRequired.values() ) {

			if ( this.extensionsRegistered.has( ext ) ) {

				console.error( `Required extension ${ext} was not registered` );

			}

		}

	}

	/**
	 * Iterate through any extensions registered for this type/function,
	 * and return first Truthy result
	 */
	useFunction( funcName, obj, ...args ) {

		const extensions = this.functions.get( funcName );
		if ( ! extensions || extensions.length === 0 ) return null;

		for ( let i = 0; i < extensions.length; i ++ ) {

			const extension = extensions[ i ]();
			// TODO(extensions): do we need different type data per function at all?! this gives us
			// root level data + data from the .type registered at extension creation time
			// which I *think* should be enough for now?
			// unless different functions implemented within a single extension need to reference
			// different data types.. in which case we'll need more info !
			extension.setTileset( this.tilesRenderer.rootTileset );
			const data = getExtensionSpecificData( extension.name, getExtensionTypeData( extension.type, obj ) );
			const func = getFunction( extension, funcName );
			if ( func ) {

				// data can be null.. ex: 3DTILES_content_gltf has top level data
				// but not per-tile data
				const result = func( data, ...args );
				if ( result ) return result;

			}

		}

		return null;

	}

	/**
	 * Registering the extension as a factory function allows the user to specify
	 * wheter each extension is a singleton or should create 1 extension
	 * instance per invocation.
	 *
	 * @param callback: ( tilesRenderer: TilesRenderer ) => T extends ExtensionBase
	 */
	register( callback ) {

		// create an instance so that we can register by implemented function
		const ext = callback();
		for ( const fname of SUPPORTED_FUNCTIONS ) {

			if ( fname in ext ) {

				const functionCallbacks = this.functions.get( fname ) || [];
				if ( functionCallbacks.indexOf( callback ) === - 1 ) {

					functionCallbacks.push( callback );

				}
				this.functions.set( fname, functionCallbacks );

			}

		}

		// track as registered
		this.extensionsRegistered.add( ext.name );
		return this;

	}

	unregister( type, callback ) {

		// TODO(extensions): implement unregister once we narrow down the
		// ways they need to be tracked.
		throw new Error( 'unregister not implemented yet' );

	}

}

/** Return valid function if one exists as part of a valid ExtensionBase or null. */
function getFunction( extension, fn ) {

	const functionAllowed = (
		// 1: extensions must extend ExtensionBase
		extension instanceof ExtensionBase &&
		extension.extensionType in ExtractTypeData &&
		// 2: we must know how to extract base 3d-tiles data for that extension
		ExtractTypeData[ extension.extensionType ] &&
		// 3: object containing valid function names if restricted
		SUPPORTED_FUNCTIONS.indexOf( fn ) !== - 1
	);

	// 4: and the function is implemented by the extension
	const implementation = (
		fn in extension &&
		extension[ fn ]
	);

	if ( functionAllowed && implementation ) {

		return implementation;

	}

	if ( ! functionAllowed && implementation ) {

		// noisy for dev time, notify if not allowed but is implemented ?!
		console.warn( `Attempting to use unsupported function in extension`, extension.name, fn );

	}

	return null;

}

function getExtensionTypeData( extensionType, obj ) {

	const extract = (
		extensionType in ExtractTypeData &&
		ExtractTypeData[ extensionType ] ||
		null
	);

	const extensionData = extract && extract( obj );
	return extensionData || null;

}

/** Return a valid extension data object if one exists, null if not */
function getExtensionSpecificData( extensionName, extensionTypeData ) {

	if ( extensionTypeData ) {

		return extensionTypeData[ extensionName ] || null;

	}
	return null;

}
