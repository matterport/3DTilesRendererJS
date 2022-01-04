import { TILESETS } from './__fixtures__/ExtensionSystem.tilesets.js';
import { ExtensionSystem } from '../src/extensions/ExtensionSystem.js';
import { ExtensionBase } from '../src/extensions/ExtensionBase.js';
import { ExtensionType } from '../src/extensions/ExtensionType.js';

describe( 'ExtensionSystem', () => {

	describe( '3DTILES_content_gltf', () => {

		it( 'says we support 3DTILES_content_gltf by default', () => {

			// change if gltf ends up removed from parseTile
			const extensions = new ExtensionSystem();
			expect( extensions.has( '3DTILES_content_gltf' ) ).toEqual( true );

		} );

		it( 'useTileset gltf expected', () => {

			const tileset = TILESETS.gltf;
			const extensions = new ExtensionSystem().useTileset( tileset );
			expect( extensions.has( '3DTILES_content_gltf' ) ).toEqual( true );

		} );

	} );

	describe( 'VENDOR_required_extension', () => {

		it( 'requires, register, has', () => {

			const tileset = TILESETS.vendorRequired;
			const extName = TILESETS.EXT_NAMES.VENDOR_required_extension;
			const extensions = new ExtensionSystem().useTileset( tileset );
			expect( extensions.has( extName ) ).toEqual( false );
			expect( extensions.requires( extName ) ).toEqual( true );

			// initial registration is active, valid, included in system, and no longer required
			const registration = extensions.register( () => new VendorRequiredTileExtension() );
			expect( registration.active() ).toEqual( true );
			expect( extensions.has( extName ) ).toEqual( true );
			expect( extensions.requires( extName ) ).toEqual( false );

			// unregistered, back to previous
			registration.cancel();
			expect( registration.active() ).toEqual( false );
			expect( extensions.has( extName ) ).toEqual( false );
			expect( extensions.requires( extName ) ).toEqual( true );

		} );

		it( 'can access tileset extension data', () => {

			const tileset = TILESETS.vendorRequired;
			const extensions = new ExtensionSystem().useTileset( tileset );
			extensions.register( () => new VendorRequiredTileExtension() );

			const response = extensions.useFunction( 'parse', tileset.root );
			expect( response ).not.toBeNull();
			expect( response.tileset ).not.toEqual( {} );
			expect( response.tile ).toBeNull();
			expect( response.tileset.details ).toEqual( [ "required", "content" ] );

		} );

	} );

	describe( 'VENDOR_optional_extension', () => {

		it( 'requires, register, has', () => {

			const tileset = TILESETS.vendorOptionalAndRequired;
			const extName = TILESETS.EXT_NAMES.VENDOR_optional_extension;
			const extensions = new ExtensionSystem().useTileset( tileset );
			expect( extensions.has( extName ) ).toEqual( false );
			expect( extensions.requires( extName ) ).toEqual( false );

			// initial registration is active, valid, included in system, and no longer required
			const registration = extensions.register( () => new VendorOptionalContentExtension() );
			expect( registration.active() ).toEqual( true );
			expect( extensions.has( extName ) ).toEqual( true );
			expect( extensions.requires( extName ) ).toEqual( false );

			// unregistered, back to previous
			registration.cancel();
			expect( registration.active() ).toEqual( false );
			expect( extensions.has( extName ) ).toEqual( false );
			expect( extensions.requires( extName ) ).toEqual( false );

		} );

	} );

	describe( 'requires', () => {

		it( 'optional and required extensions in the full tileset', () => {

			const tileset = TILESETS.allTheThings;
			const extensions = new ExtensionSystem().useTileset( tileset );

			let extName = 'VENDOR_required_extension';
			expect( extensions.has( extName ) ).toEqual( false );
			expect( extensions.requires( extName ) ).toEqual( true );

			extName = 'VENDOR_optional_extension';
			expect( extensions.has( extName ) ).toEqual( false );
			expect( extensions.requires( extName ) ).toEqual( false );

			extName = '3DTILES_content_gltf';
			expect( extensions.has( extName ) ).toEqual( true );
			expect( extensions.requires( extName ) ).toEqual( false );

		} );

	} );

} );

describe( 'ExtensionBase', () => {

	it( 'requires a valid data type', () => {

		expect( () => new InvalidExtension() ).toThrow();
		expect( () => new VendorRequiredTileExtension() ).not.toThrow();
		expect( () => new VendorOptionalContentExtension() ).not.toThrow();

	} );

} );

/** Types of mock extensions used in the test */
class InvalidExtension extends ExtensionBase {

	constructor() {

		super( 'invalid_extension_type', 'extension_invalid' );

	}

}

class VendorRequiredTileExtension extends ExtensionBase {

	constructor() {

		super( ExtensionType.TILE, TILESETS.EXT_NAMES.VENDOR_required_extension );

	}

	parse( perTileData ) {

		const tileset = this.data;
		const tile = perTileData;
		return Object.assign( {}, { tileset }, { tile } );

	}

}

class VendorOptionalContentExtension extends ExtensionBase {

	constructor() {

		super( ExtensionType.CONTENT, TILESETS.EXT_NAMES.VENDOR_optional_extension );

	}

	fetch( perTileData ) {

		const tileset = this.data;
		const tile = perTileData;
		return Object.assign( {}, { tileset }, { tile } );

	}

}
