/** MP_TILES_PROTO */

import {
	Cache,
	DefaultLoadingManager,
	CanvasTexture,
	NearestFilter,
	NearestMipmapLinearFilter,
	NearestMipmapNearestFilter,
	LinearFilter,
	LinearMipmapLinearFilter,
	ClampToEdgeWrapping,
	MirroredRepeatWrapping,
	RepeatWrapping,
	RGBFormat,
	LinearMipmapNearestFilter,
} from 'three';

export class GLTFTileLoader {
	constructor( manager = DefaultLoadingManager ) {
		this.manager = manager;
	}

    getLoader() {
        const manager = this.manager;
        return manager.getHandler( 'path.gltf' );
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

// LOTS of copy/pasted junk from GLTFLoader/GLTFParser all in order to allow Cache.enabled to actually work for texture re-use
export class MpCachedTextureLoader {
	constructor ( parser ) {
		this.parser = parser;
		Cache.enabled = true;
	}

	// mostly taken from GLTFLoader.js: 2427
	loadTexture = function ( textureIndex ) {

		var parser = this.parser;
		var json = parser.json;
		var options = parser.options;

		var textureDef = json.textures[ textureIndex ];

		var textureExtensions = textureDef.extensions || {};

		var source;

		if ( textureExtensions[ EXTENSIONS.MSFT_TEXTURE_DDS ] ) {

			source = json.images[ textureExtensions[ EXTENSIONS.MSFT_TEXTURE_DDS ].source ];

		} else {

			source = json.images[ textureDef.source ];

		}

		var loader;

		if ( source.uri ) {

			loader = options.manager.getHandler( source.uri );

		}

		if ( ! loader ) {

			loader = textureExtensions[ EXTENSIONS.MSFT_TEXTURE_DDS ]
				? parser.extensions[ EXTENSIONS.MSFT_TEXTURE_DDS ].ddsLoader
				: parser.textureLoader;

		}

		return this.loadTextureImage( textureIndex, source, loader );

	};

	// mostly taken from GLTFLoader.js: 2469
	loadTextureImage = function ( textureIndex, source, loader ) {

		var parser = this.parser;
		var json = parser.json;
		var options = parser.options;

		var textureDef = json.textures[ textureIndex ];

		var URL = self.URL || self.webkitURL;

		var sourceURI = source.uri;

		const cached = Cache.get(sourceURI);
		if (cached) {
			return Promise.resolve(cached);
		}

		var isObjectURL = false;
		var hasAlpha = true;

		if ( source.mimeType === 'image/jpeg' ) hasAlpha = false;

		if ( source.bufferView !== undefined ) {

			// Load binary image data from bufferView, if provided.

			sourceURI = parser.getDependency( 'bufferView', source.bufferView ).then( function ( bufferView ) {

				if ( source.mimeType === 'image/png' ) {

					// Inspect the PNG 'IHDR' chunk to determine whether the image could have an
					// alpha channel. This check is conservative — the image could have an alpha
					// channel with all values == 1, and the indexed type (colorType == 3) only
					// sometimes contains alpha.
					//
					// https://en.wikipedia.org/wiki/Portable_Network_Graphics#File_header
					var colorType = new DataView( bufferView, 25, 1 ).getUint8( 0, false );
					hasAlpha = colorType === 6 || colorType === 4 || colorType === 3;

				}

				isObjectURL = true;
				var blob = new Blob( [ bufferView ], { type: source.mimeType } );
				sourceURI = URL.createObjectURL( blob );
				return sourceURI;

			} );

		}



		return Promise.resolve( sourceURI ).then( function ( sourceURI ) {
			return new Promise( function ( resolve, reject ) {

				var onLoad = resolve;

				if ( loader.isImageBitmapLoader === true ) {

					onLoad = function ( imageBitmap ) {

						const texture = new CanvasTexture( imageBitmap )
						resolve( texture );

					};

				}

				loader.load( resolveURL( sourceURI, options.path ), onLoad, undefined, reject );

			} );

		} ).then( function ( texture ) {

			// Clean up resources and configure Texture.

			if ( isObjectURL === true ) {

				URL.revokeObjectURL( sourceURI );

			}

			texture.flipY = false;

			if ( textureDef.name ) texture.name = textureDef.name;

			// When there is definitely no alpha channel in the texture, set RGBFormat to save space.
			if ( ! hasAlpha ) texture.format = RGBFormat;

			var samplers = json.samplers || {};
			var sampler = samplers[ textureDef.sampler ] || {};

			texture.magFilter = WEBGL_FILTERS[ sampler.magFilter ] || LinearFilter;
			texture.minFilter = WEBGL_FILTERS[ sampler.minFilter ] || LinearMipmapLinearFilter;
			texture.wrapS = WEBGL_WRAPPINGS[ sampler.wrapS ] || RepeatWrapping;
			texture.wrapT = WEBGL_WRAPPINGS[ sampler.wrapT ] || RepeatWrapping;

			parser.associations.set( texture, {
				type: 'textures',
				index: textureIndex
			} );

			Cache.add(sourceURI, texture);

			return texture;

		} );

	};

}

var WEBGL_FILTERS = {
	9728: NearestFilter,
	9729: LinearFilter,
	9984: NearestMipmapNearestFilter,
	9985: LinearMipmapNearestFilter,
	9986: NearestMipmapLinearFilter,
	9987: LinearMipmapLinearFilter
};

var WEBGL_WRAPPINGS = {
	33071: ClampToEdgeWrapping,
	33648: MirroredRepeatWrapping,
	10497: RepeatWrapping
};

var EXTENSIONS = {
	KHR_BINARY_GLTF: 'KHR_binary_glTF',
	KHR_DRACO_MESH_COMPRESSION: 'KHR_draco_mesh_compression',
	KHR_LIGHTS_PUNCTUAL: 'KHR_lights_punctual',
	KHR_MATERIALS_CLEARCOAT: 'KHR_materials_clearcoat',
	KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS: 'KHR_materials_pbrSpecularGlossiness',
	KHR_MATERIALS_TRANSMISSION: 'KHR_materials_transmission',
	KHR_MATERIALS_UNLIT: 'KHR_materials_unlit',
	KHR_TEXTURE_BASISU: 'KHR_texture_basisu',
	KHR_TEXTURE_TRANSFORM: 'KHR_texture_transform',
	KHR_MESH_QUANTIZATION: 'KHR_mesh_quantization',
	EXT_TEXTURE_WEBP: 'EXT_texture_webp',
	EXT_MESHOPT_COMPRESSION: 'EXT_meshopt_compression',
	MSFT_TEXTURE_DDS: 'MSFT_texture_dds'
};

function resolveURL( url, path ) {

	// Invalid URL
	if ( typeof url !== 'string' || url === '' ) return '';

	// Host Relative URL
	if ( /^https?:\/\//i.test( path ) && /^\//.test( url ) ) {

		path = path.replace( /(^https?:\/\/[^\/]+).*/i, '$1' );

	}

	// Absolute URL http://,https://,//
	if ( /^(https?:)?\/\//i.test( url ) ) return url;

	// Data URI
	if ( /^data:.*,.*$/i.test( url ) ) return url;

	// Blob URL
	if ( /^blob:.*$/i.test( url ) ) return url;

	// Relative URL
	return path + url;

}
