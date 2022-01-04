import { merge } from './utilities.js';

function makeTileset( contentFileExt, mergedTilesetContent ) {

	const base = {
		"asset": {
			"version": "1.0"
		},
		"geometricError": 1.0,
		"root": {
			"content": {
				"uri": `root.${contentFileExt}`
			},
			"boundingVolume": {
				"box": [ 68, - 22, 4, 74, 0, 0, 0, - 29, 0, 0, 0, 6 ]
			},
			"geometricError": 1.0,
			"refine": "REPLACE",
			"children": [
				{
					"content": {
						"uri": `tile.${contentFileExt}`
					},
					"boundingVolume": {
						"box": [ 68, - 22, 4, 74, 0, 0, 0, - 29, 0, 0, 0, 6 ]
					},
					"geometricError": 0.5,
					"refine": "REPLACE",
					"children": [ ]
				}
			]
		}
	};

	// note, concats any arrays in both objects, so children in merged content are additive
	return merge( [ base, mergedTilesetContent ] );

}

const gltfExtensionContent = {
	"extensionsUsed": [
		"3DTILES_content_gltf",
	],
	"extensionsRequired": [
		"3DTILES_content_gltf",
	],
	"extensions": {
		"3DTILES_content_gltf": {
			"extensionsUsed": [
				"KHR_draco_mesh_compression",
				"KHR_texture_basisu",
			],
			"extensionsRequired": [
				"KHR_draco_mesh_compression",
				"KHR_texture_basisu",
			]
		},
	},
};

const vendorRequiredContent = {
	"extensionsUsed": [
		"VENDOR_required_extension"
	],
	"extensionsRequired": [
		"VENDOR_required_extension"
	],
	"extensions": {
		"VENDOR_required_extension": {
			"details": [ "required", "content" ]
		}
	},
};

const vendorOptionalContent = {
	"extensionsUsed": [
		"VENDOR_optional_extension",
	],
	"extensions": {
		"VENDOR_optional_extension": {
			"details": [ "some", "tileset", "wide", "content" ]
		},
	},
};

export const TILESETS = {

	EXT_NAMES: {
		"VENDOR_required_extension": "VENDOR_required_extension",
		"VENDOR_optional_extension": "VENDOR_optional_extension",
		"3DTILES_content_gltf": "3DTILES_content_gltf",
	},

	base: makeTileset( 'b3dm', {} ),
	gltf: makeTileset( 'gltf', gltfExtensionContent ),
	vendorOptional: makeTileset( 'glb', vendorOptionalContent ),
	vendorRequired: makeTileset( 'pnts', vendorRequiredContent ),
	vendorOptionalAndRequired: makeTileset( 'b3dm', merge( [ vendorRequiredContent, vendorOptionalContent ] ) ),
	vendorRequiredAndgltf: makeTileset( 'gltf', merge( [ vendorRequiredContent, gltfExtensionContent ] ) ),
	allTheThings: makeTileset( 'glb', merge( [ gltfExtensionContent, vendorRequiredContent, vendorOptionalContent ] ) ),

};
