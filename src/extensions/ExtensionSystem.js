import { ExtensionBase } from './ExtensionBase.js';
import { ExtensionType } from './ExtensionType.js';

/**
 * This should only exist as long as the GLTFExtensionLoader stays built in to the parseTile fn.
 * If this extension shifts to be separable via extension system then this initial 'support' should be removed.
 */
const DEFAULT_SUPPORTED_EXTENSIONS = [ '3DTILES_content_gltf' ];

/** Adjust in index.d.ts:FunctionName also */
const SUPPORTED_FUNCTIONS = [ 'parse', 'fetch' ];

/**
 * Manage extensions to the 3d-tiles system.
 *
 * Modeled very loosely after the GLTFLoader extension system in threejs
 */
export class ExtensionSystem {

	constructor( ) {

		/** Map<FuncName, Set<()=>ExtensionBase> - track extension factory funcs per function type */
		this.extensionsByFunc = new Map();
		/** Map<ExtensionName, Set<()=>ExtensionBase> - track extension factory funcs per function registered ExtensionName */
		this.extensionsByName = new Map();

		/** Set<string> - system support */
		this.extensionsRegistered = new Set( DEFAULT_SUPPORTED_EXTENSIONS.slice() );

		/** Tileset|null - most recent useTileset, tileset used for the tileset-wise data available within extensions */
		this.tileset = null;
		/** Set<string> - ExtensionNames optionally used by the tileset */
		this.extensionsUsed = new Set();
		/** Set<string> - ExtensionNames required to load the tileset */
		this.extensionsRequired = new Set();

	}

	dispose() {

		this.extensionsByName.forEach( extensionSet => {

			extensionSet.forEach( cb => {

				this._unregister( cb(), cb );

			} );

		} );
		// TODO(extensions): uncomment after automated tests exist, these should be cleared by the _unregister.
		// this.extensionsByName.clear();
		// this.extensionsByFunc.clear();
		// this.extensionsRegistered.clear();

		this.tileset = null;
		this.extensionsUsed.clear();
		this.extensionsRequired.clear();

	}

	/** check specific extension registered */
	has( extensionName ) {

		return this.extensionsRegistered.has( extensionName );

	}

	/** check specific extension needed AND not registered */
	requires( extensionName ) {

		const extensionsRequired = this.extensionsRequired;
		const extensionsRegistered = this.extensionsRegistered;

		const required = extensionsRequired.has( extensionName );
		const unregistered = ! extensionsRegistered.has( extensionName );
		return required && unregistered;

	}

	/** Set the tileset used for access to the top level extensions objects */
	useTileset( tileset ) {

		this.tileset = tileset;
		this.checkSupport( tileset, false );
		return this;

	}

	/** notify of unsupported extensions */
	checkSupport( tileset, log = true ) {

		const extensionsUsed = this.extensionsUsed;
		const extensionsRequired = this.extensionsRequired;
		const extensionsRegistered = this.extensionsRegistered;

		const used = tileset && tileset.extensionsUsed || [];
		const required = tileset && tileset.extensionsRequired || [];
		extensionsUsed.add( ...used );
		extensionsRequired.add( ...required );

		if ( ! log ) return;

		for ( const ext of extensionsUsed.values() ) {

			extensionsRegistered.has( ext ) ? '' : console.log( `Optional extension ${ext} was not registered` );

		}
		for ( const ext of extensionsRequired.values() ) {

			extensionsRegistered.has( ext ) ? '' : console.warn( `Required extension ${ext} was not registered` );

		}

	}

	/**
	 * Iterate through any extensions registered for this type/function,
	 * and return first Truthy result
	 *
	 * TODO(extensions): Likely need a way to support a way to default behavior + use all matching extensions?
	 */
	useFunction( funcName, obj, ...args ) {

		const tileset = this.tileset;
		const extensions = this.extensionsByFunc.get( funcName );
		if ( ! extensions || extensions.length === 0 ) return null;

		for ( const callback of extensions.values() ) {

			const extension = callback();
			// TODO(extensions): do we need different type data per function at all?! this gives us
			// root level data + data from the .extensionType registered at extension creation time
			// which I *think* should be enough for now?
			// unless different functions implemented within a single extension need to reference
			// different data types.. in which case we'll need more info !
			extension.useTileset( tileset );
			const data = getExtensionSpecificData( extension.name, getExtensionTypeData( extension.extensionType, obj ) );
			const func = getFunction( extension, funcName );

			// TODO(extensions): Is there a better way to narrow execution scope?
			// Maybe?: TILE/CONTENT/ASSET type require data vs TILESET type doesn't?
			// ex: 3DTILES_content_gltf has top level data but not per-tile data
			// as do some of the metadata extensions which might apply styling from top level ext data
			// to the tile?

			// or just delegate getting the data to the extension implementation?
			if ( func && data ) {

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
	 * @param { ( tilesRenderer: TilesRenderer ) => T extends ExtensionBase } callback
	 * @returns { { cancel: () => boolean, renew: () => boolean, active: () => boolean, callback } } registration
	 */
	register( callback ) {

		const ext = callback();
		const name = ext.name;
		const registration = {
			active: () => this.extensionsByName.get( name ).size > 0,
			cancel: () => this._unregister( callback ),
			renew: () => this._register( callback ),
			callback,
		};
		registration.renew();
		return registration;

	}

	/** Returns true if callback is added to the tracked set of resources */
	_register( callback ) {

		let changed = false;
		const { extensionsByName, extensionsByFunc, extensionsRegistered } = this;
		const extensionInstance = callback();
		const name = extensionInstance.name;
		const byName = ( extensionsByName.get( name ) || new Set() );
		const nsize = byName.size;

		SUPPORTED_FUNCTIONS.forEach( ( fname ) => {

			const byFname = ( extensionsByFunc.get( fname ) || new Set() );
			const fsize = byFname.size;
			if ( fname in extensionInstance ) {

				extensionsByFunc.set( fname, byFname.add( callback ) );
				extensionsByName.set( name, byName.add( callback ) );

			}
			changed = fsize !== byFname.size || byName.size !== nsize;

		} );

		// track as registered still needed?
		extensionsRegistered.add( name );

		// return whether this call had some effect on tracked extensions
		return changed;

	}

	/** Returns true if tracked extension usage has changed */
	_unregister( callback ) {

		let changed = false;
		const { extensionsByName, extensionsByFunc, extensionsRegistered } = this;
		const extensionInstance = callback();
		const name = extensionInstance.name;
		const byName = ( extensionsByName.get( name ) || new Set() );
		const nsize = byName.size;

		SUPPORTED_FUNCTIONS.forEach( ( fname ) => {

			const byFname = ( extensionsByFunc.get( fname ) || new Set() );
			const fsize = byFname.size;
			if ( fname in extensionInstance ) {

				extensionsByFunc.set( fname, byFname.delete( callback ) );

			}
			if ( ! byFname.has( fname ) ) {

				extensionsByName.set( name, byName.delete( callback ) );

			}

			changed = byFname.size !== fsize || byName.size !== nsize;

		} );

		// if no callbacks are registered any longer, remove from the overall set
		if ( ! byName.has( name ) ) {

			extensionsRegistered.delete( name );

		}

		// return whether _unregister call had some effect on tracked extensions
		return changed;

	}

}

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

		return implementation.bind( extension );

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
