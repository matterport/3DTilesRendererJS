import { Matrix4, Quaternion, Vector3 } from 'three';
import * as utils from '../src/three/ThreeTileUtils.js';

/** Tests to verify portions of the tile spec <-> threejs conversions */

const identity = new Matrix4().identity();
const defaultTransform = {
	"transform": [
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 1.0,
	]
};
const testBounds = {
	"boundingVolume": {
		"box": [
			66, - 13, 6,
			3, 0, 0,
			0, - 7, 0,
			0, 0, 2,
		]
	},
};

function decompose( transform ) {

	const position = new Vector3();
	const rotation = new Quaternion();
	const scale = new Vector3();
	transform.decompose( position, rotation, scale );
	return { position, rotation, scale };

}

describe( 'ThreeTileUtils', () => {

	describe( 'transform', () => {

		it( 'default tile.transform is identity', () => {

			const transform = utils.convertTileTransform( defaultTransform.transform, identity );
			expect( transform.elements ).toEqual( identity.elements );

		} );

	} );

	describe( 'boundingVolume', () => {

		it( 'boundingVolume.box to Box3', () => {

			const { box, boxTransform } = utils.convertTileBoundingVolume( testBounds.boundingVolume, identity );
			expect( box.min ).toEqual( new Vector3( - 3, - 7, - 2 ) );
			expect( box.max ).toEqual( new Vector3( 3, 7, 2 ) );

			const transform = decompose( boxTransform );
			// - 0 is a thing three does internally apparently. ~= 0.
			expect( transform.rotation ).toEqual( new Quaternion( 0, 0, 1, - 0 ) );
			expect( transform.position ).toEqual( new Vector3( 66, - 13, 6 ) );
			expect( transform.scale ).toEqual( new Vector3( - 1, 1, 1 ) );

		} );

		it( 'boundingVolume.box to Box3 to boundingVolume.box', () => {

			// from 3d-tiles tile data to threejs box objects
			const { box, boxTransform } = utils.convertTileBoundingVolume( testBounds.boundingVolume, identity );
			// from threejs objects back to 3d-tiles volume box
			const boundingVolumeBox = utils.convertBox3ToBoundingVolume( box, boxTransform );
			// should be roughly equal
			expect( boundingVolumeBox ).toEqual( testBounds.boundingVolume.box );

		} );

	} );

} );
