import { Box3, Matrix4, Vector3, Sphere } from 'three';

const vecX = new Vector3();
const vecY = new Vector3();
const vecZ = new Vector3();

// Convert optional 3d-tiles transform object into a THREE.Matrix4
export function convertTileTransform( transform, parentMatrix ) {

	const result = new Matrix4();
	if ( transform ) {

		const transformArr = transform;
		for ( let i = 0; i < 16; i ++ ) {

			result.elements[ i ] = transformArr[ i ];

		}

	} else {

		result.identity();

	}

	if ( parentMatrix ) {

		result.premultiply( parentMatrix );

	}

	return result;

}

// Convert 3d-tiles boundingVolume optional definitions into concrete THREE box/sphere/matrix description
// - ex: used in 'tile.cached'
export function convertTileBoundingVolume( boundingVolume, transform ) {

	let box = null;
	let boxTransform = null;
	let boxTransformInverse = null;
	if ( 'box' in boundingVolume ) {

		const data = boundingVolume.box;
		box = new Box3();
		boxTransform = new Matrix4();
		boxTransformInverse = new Matrix4();

		// get the extents of the bounds in each axis
		vecX.set( data[ 3 ], data[ 4 ], data[ 5 ] );
		vecY.set( data[ 6 ], data[ 7 ], data[ 8 ] );
		vecZ.set( data[ 9 ], data[ 10 ], data[ 11 ] );

		const scaleX = vecX.length();
		const scaleY = vecY.length();
		const scaleZ = vecZ.length();

		vecX.normalize();
		vecY.normalize();
		vecZ.normalize();

		// handle the case where the box has a dimension of 0 in one axis
		if ( scaleX === 0 ) {

			vecX.crossVectors( vecY, vecZ );

		}

		if ( scaleY === 0 ) {

			vecY.crossVectors( vecX, vecZ );

		}

		if ( scaleZ === 0 ) {

			vecZ.crossVectors( vecX, vecY );

		}

		// create the oriented frame that the box exists in
		boxTransform.set(
			vecX.x, vecY.x, vecZ.x, data[ 0 ],
			vecX.y, vecY.y, vecZ.y, data[ 1 ],
			vecX.z, vecY.z, vecZ.z, data[ 2 ],
			0, 0, 0, 1
		);
		boxTransform.premultiply( transform );
		boxTransformInverse.copy( boxTransform ).invert();

		// scale the box by the extents
		box.min.set( - scaleX, - scaleY, - scaleZ );
		box.max.set( scaleX, scaleY, scaleZ );

	}

	let sphere = null;
	if ( 'sphere' in boundingVolume ) {

		const data = boundingVolume.sphere;
		sphere = new Sphere();
		sphere.center.set( data[ 0 ], data[ 1 ], data[ 2 ] );
		sphere.radius = data[ 3 ];
		sphere.applyMatrix4( transform );

	} else if ( 'box' in boundingVolume ) {

		const data = boundingVolume.box;
		sphere = new Sphere();
		box.getBoundingSphere( sphere );
		sphere.center.set( data[ 0 ], data[ 1 ], data[ 2 ] );
		sphere.applyMatrix4( transform );

	}

	let region = null;
	if ( 'region' in boundingVolume ) {

		console.warn( 'ThreeTilesRenderer: region bounding volume not supported.' );

	}

	return {

		box,
		boxTransform,
		boxTransformInverse,
		sphere,
		region,

	};

}

// Convert a three box3 + transform into a 3d-tiles boundingVolume.box array
export function convertBox3ToBoundingVolume( box, boxTransform ) {

	const worldBox = new Box3().copy( box ).applyMatrix4( boxTransform );
	const min = [ worldBox.min.x, worldBox.min.y, worldBox.min.z ];
	const max = [ worldBox.max.x, worldBox.max.y, worldBox.max.z ];

	const center = [
		( max[ 0 ] - min[ 0 ] ) / 2 + min[ 0 ],
		( max[ 1 ] - min[ 1 ] ) / 2 + min[ 1 ],
		( max[ 2 ] - min[ 2 ] ) / 2 + min[ 2 ],
	];

	const halfX = ( max[ 0 ] - min[ 0 ] ) / 2.0;
	const halfY = ( max[ 1 ] - min[ 1 ] ) / 2.0;
	const halfZ = ( max[ 2 ] - min[ 2 ] ) / 2.0;

	// oriented bounding box
	// a right-handed 3-axis (x, y, z) Cartesian coordinate system where the z-axis is up.
	const boundingVolumeBox = [
		// The first three elements define the x, y, and z values for the center of the box.
	  	// center
		center[ 0 ], center[ 1 ], center[ 2 ],

		// The next three elements (with indices 3, 4, and 5) define the x-axis direction and half-length.
	  	halfX, 0.0, 0.0,

		// The next three elements (indices 6, 7, and 8) define the y-axis direction and half-length.
		// TODO: verify handedness swap and whether we really need to flip the Y axis direction, or if something
		// else is wrong internally?
	  	0.0, - halfY, 0.0,

		// The last three elements (indices 9, 10, and 11) define the z-axis direction and half-length.
	  	0.0, 0.0, halfZ,
	];
	return boundingVolumeBox;

}
