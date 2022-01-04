import type { Box3, Matrix4, Sphere } from 'three';
import type { TileBase } from '../base/TileBase';

// Convert optional 3d-tiles transform object into a THREE.Matrix4
export function convertTileTransform( transform: TileBase['transform'], parentMatrix: Matrix4 ): Matrix4;

type BoundingVolumeDescriptor = {
	box: Box3|null,
	boxTransform: Matrix4|null,
	boxTransformInverse: Matrix4|null,
	sphere: Sphere,
	region: null,
}

// Convert 3d-tiles boundingVolume optional definitions into concrete THREE box/sphere/matrix description
// - ex: used in 'tile.cached'
export function convertTileBoundingVolume( boundingVolume: TileBase['boundingVolume'], transform: Matrix4 ): BoundingVolumeDescriptor;

export function convertBox3ToBoundingVolume( localBox: Box3, boxTransform: Matrix4 ): number[];