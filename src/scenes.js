import { Sphere, Quad, Box, Cylinder, Mesh } from './objects.js';
import { loadMesh, getObjBoundingBox, getSpheresRandom } from './util.js';

const groundDefault = new Sphere([0, -1001, 0], [0.7, 0.7, 0.7], 1000, [0.9, 0.0, 0.6, 0.0]);

async function getAvailableScene(index, scenesList)
{
    let sceneName = Object.keys(scenesList)[index];
    let sceneFunction = eval(sceneName);
    return await sceneFunction();
}

async function Spheres(numSpheres = 4)
{
    let offset = [0, -1, -5];
    let spheres = [groundDefault];
    spheres = spheres.concat(getSpheresRandom(numSpheres, offset));

    spheres.push(new Sphere([offset[0], 1.3 + offset[1], offset[2]], [1.0, 1.0, 1.0], 1.3, [-1.0, 0.001, 0.9, 0.0]));
    spheres.push(new Sphere([-3.3 + offset[0], 1.3 + offset[1], offset[2]], [1.0, 0.1, 0.1], 1.3, [0.0, 0.0, 0.0, 0.0]));
    spheres.push(new Sphere([3.3 + offset[0], 1.3 + offset[1], offset[2]], [0.7, 0.7, 0.7], 1.3, [1.0, 0.0, 1.0, 0.0]));

    return {
        spheres, 
        quads: [], 
        boxes: [], 
        triangles: [], 
        meshes: [], 
        backgroundColor1: [0.0, 0.5, 1.0], 
        backgroundColor2: [1.0, 1.0, 1.0], 
        focusDistance: 5.0, 
        focusAngle: 0.2,
        sunIntensity: 1.0,
        samplesPerPixel: 1.0,
        maxBounces: 10.0
    };
}

async function Night()
{
    let { spheres, quads, boxes, triangles, meshes, backgroundColor1, backgroundColor2 } = await Spheres();

    return {
        spheres,
        quads,
        boxes,
        triangles,
        meshes,
        backgroundColor1: [0.0, 0.0, 0.0],
        backgroundColor2: [0.0, 0.0, 0.0],
        focusDistance: 5.0,
        focusAngle: 0.2,
        sunIntensity: 0.1,
        samplesPerPixel: 1.0,
        maxBounces: 10.0
    }
}

async function Basic()
{
    let spheres = [
        new Sphere([0, -1001, 0], [0.5, 0.5, 0.5], 1000, [0.0, 0.0, 0.0, 0.0]),
        new Sphere([-0.0, -0.5, -2.0], [1.0, 0.0, 0.0], 0.5, [0.0, 0.0, 0.0, 0.0]),
    ];

    return {
        spheres, 
        quads: [], 
        boxes: [], 
        triangles: [], 
        meshes: [], 
        backgroundColor1: [0.0, 0.5, 1.0], 
        backgroundColor2: [1.0, 1.0, 1.0],
        focusDistance: 5.0, 
        focusAngle: 0.0,
        sunIntensity: 1.0,
        samplesPerPixel: 1.0,
        maxBounces: 10.0
    };
}

async function Metal() 
{
	let spheres = [
		new Sphere([0, -1001, 0], [0.10980392156862745, 0.12156862745098039, 0.2901960784313726], 1000, [1, 0, 0.01, 0]), 
		new Sphere([0, -0.26, -2], [0.3, 0.3, 1], 0.5, [1, 0, 1, 0]), 
		new Sphere([-1, -0.5, -2], [1, 0.3, 0.3], 0.5, [1, 0, 1, 0]), 
		new Sphere([1, -0.5, -2], [0.3, 1, 0.3], 0.5, [1, 0, 1, 0]), 
		new Sphere([0.01, 0.51, -1.9], [1, 1, 1], 0.23, [1, 0, 1, 0]), 
	];

	let quads = [
	];

	let boxes = [
	];

	return {
		spheres : spheres,
		quads : quads,
		boxes : boxes,
		triangles: [],
		meshes: [],
		backgroundColor1 : [0, 0.5, 1],
		backgroundColor2 : [1, 1, 1],
		focusDistance: 5,
		focusAngle: 0,
		sunIntensity: 1,
		samplesPerPixel: 1,
		maxBounces: 30
	};
}

async function Fuzz() 
{
	let spheres = [
		new Sphere([0, -1001, 0], [0.21568627450980393, 0.21568627450980393, 0.40784313725490196], 1000, [0, 0, 0, 0]), 
		new Sphere([0, -0.2, -2], [1, 1, 1], 0.5, [1, 0.1, 1, 0]), 
		new Sphere([-1, -0.5, -2], [1, 1, 1], 0.5, [1, 0.5, 1, 0]), 
		new Sphere([1, -0.5, -2], [1, 1, 1], 0.5, [1, 0, 1, 0]), 
	];

	let quads = [
	];

	let boxes = [
	];

	return {
		spheres : spheres,
		quads : quads,
		boxes : boxes,
		triangles: [],
		meshes: [],
		backgroundColor1 : [0, 0.3803921568627451, 0.7607843137254902],
		backgroundColor2 : [1, 1, 1],
		focusDistance: 5,
		focusAngle: 0,
		sunIntensity: 1,
		samplesPerPixel: 1,
		maxBounces: 30
	};
}

async function Specular() 
{
	let spheres = [
		new Sphere([0, -1001, 0], [194/255, 163/255, 1], 1000, [0.74, 0, 1, 0]), 
		new Sphere([0, -0.5, -2], [1, 1, 1], 0.5, [1, 0, 0.1, 0]), 
		new Sphere([-1, -0.5, -2], [1, 1, 1], 0.5, [1, 0, 0.02, 0]), 
		new Sphere([1, -0.5, -2], [1, 1, 1], 0.5, [1, 0, 1, 0]), 
	];

	let quads = [
	];

	let boxes = [
		new Box([0, 1.54, -2, 0], [1, 1, 1], [0, 0, 0, 0], [1.3, 0.02, 0.36, 0], [0, 0, 0, 3]), 
	];

	return {
		spheres : spheres,
		quads : quads,
		boxes : boxes,
		triangles: [],
		meshes: [],
		backgroundColor1 : [0, 0, 0],
		backgroundColor2 : [0.34509803921568627, 0.6039215686274509, 0.9921568627450981],
		focusDistance: 5,
		focusAngle: 0,
		sunIntensity: 1,
		samplesPerPixel: 10,
		maxBounces: 30
	};
}

async function Emissive()
{
    let spheres = [
        groundDefault,
        new Sphere([.5, 0., -2.5], [1.0, 0.0, 0.0], 1.0, [0.0, 0.0, 0.0, 0.0]),
        new Sphere([-1.0, -0.5, -2.0], [1.0, 1.0, 1.0], 0.5, [0.0, 0.0, 0.0, 3.0]),
    ];

    return {
        spheres, 
        quads: [], 
        boxes: [], 
        triangles: [], 
        meshes: [], 
        backgroundColor1: [0.0, 0.0, 0.0], 
        backgroundColor2: [0.0, 0.0, 0.0],
        focusDistance: 5.0, 
        focusAngle: 0.0,
        sunIntensity: 0.0,
        samplesPerPixel: 1.0,
        maxBounces: 10.0
    };
}

async function Dielectric()
{
    let spheres = [
        groundDefault,
        new Sphere([0.0, -0.5, -4.0], [1.0, 0.0, 0.0], 0.5, [0.0, 0.0, 0.0, 0.0]),
        new Sphere([-0.2, 0.7, -4.0], [0.0, 0.0, 1.0], 0.5, [0.0, 0.0, 0.0, 0.0]),
        new Sphere([0.0, 0.0, -2.1], [1.0, 1.0, 1.0], 1, [-1.0, 0.0, 0.9, 0.0]),
    ];

    return {
        spheres, 
        quads: [], 
        boxes: [], 
        triangles: [], 
        meshes: [], 
        backgroundColor1: [0.0, 0.5, 1.0], 
        backgroundColor2: [1.0, 1.0, 1.0],
        focusDistance: 5.0, 
        focusAngle: 0.0,
        sunIntensity: 1.0,
        samplesPerPixel: 1.0,
        maxBounces: 10.0
    };
}

async function Cubes() 
{
	let spheres = [
		new Sphere([0, -1001, 0], [0.5, 0.5, 0.5], 1000, [0.9, 0, 0.6, 0]), 
		new Sphere([0, 0.49, -1.5], [0.4, 0.9, 0.8], 0.25, [1, 0, 1, 0]), 
	];

	let quads = [
	];

	let boxes = [
		new Box([-1, 0, -2.23, 0], [1, 0, 0], [0, 0, 0, 0], [0.5, 0.5, 0.5, 0], [0, 0, 0, 0]), 
		new Box([1, 0, -2.21, 0], [1, 1, 1], [0, 0, 0, 0], [0.5, 0.5, 0.5, 0], [0, 0, 0, 0]), 
	];

	return {
		spheres : spheres,
		quads : quads,
		boxes : boxes,
		triangles: [],
		meshes: [],
		backgroundColor1 : [0, 0.5, 1],
		backgroundColor2 : [1, 1, 1],
		focusDistance: 5,
		focusAngle: 0,
		sunIntensity: 1,
		samplesPerPixel: 1,
		maxBounces: 10
	};
}

async function Cornell() 
{
	let spheres = [
		new Sphere([-0.5, -0.4, -1.4], [1, 1, 1], 0.5, [0, 0, 0, 0]), 
		new Sphere([0.07, 0.42, -1.5], [0.4, 0.9, 0.8], 0.39, [1, 0, 0.7, 0]), 
	];

	let quads = [

		new Quad([-1, -1, 0, 0], [0, 0, -2, 0], [0, 2, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0]), 

		new Quad([-1, -1, -2, 0], [2, 0, 0, 0], [0, 2, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]), 

		new Quad([-1, 1, -2, 0], [2, 0, 0, 0], [0, 0, 2, 0], [1, 1, 1, 1], [0, 0, 0, 0]), 

		new Quad([1, -1, -2, 0], [0, 0, 2, 0], [0, 2, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]), 

		new Quad([1, -1, -2, 0], [-2, 0, 0, 0], [0, 0, 2, 0], [1, 1, 1, 1], [0, 0, 0, 0]), 

		new Quad([1, -1, 0, 0], [-2, 0, 0, 0], [0, 2, 0, 0], [0, 0, 1, 1], [0, 0, 0, 0]), 

		new Quad([-0.5, 0.99, -1.5, 0], [1, 0, 0, 0], [0, 0, 1, 0], [1, 1, 1, 1], [0, 0, 0, 5]), 
	];

	let boxes = [
		new Box([0.5, -0.5, -1.36, 0], [0.03137254901960784, 0.23529411764705882, 0.6509803921568628], [0, 0, 0, 0], [0.24, 0.5, 0.24, 0], [0.5, 0.5, 0.5, 0]), 
	];

	return {
		spheres : spheres,
		quads : quads,
		boxes : boxes,
		triangles: [],
		meshes: [],
		backgroundColor1 : [0, 0, 0],
		backgroundColor2 : [0, 0, 0],
		focusDistance: 5,
		focusAngle: 0,
		sunIntensity: 1,
		samplesPerPixel: 5,
		maxBounces: 10
	};
}

async function Mirror() 
{
	let spheres = [
		new Sphere([0.3, 0, -1.4], [0.023529411764705882, 0.9764705882352941, 0.7843137254901961], 0.5, [0, 0, 0, 0]), 
		new Sphere([-0.5, -0.4, -1.4], [0.34901960784313724, 0, 1], 0.3, [1, 0, 0.5, 0]), 
	];

	let quads = [

		new Quad([-1, -1, 0, 0], [0, 0, -2, 0], [0, 2, 0, 0], [1, 1, 1, 0], [1, 0.01, 1, 0]), 

		new Quad([-1, -1, -2, 0], [2, 0, 0, 0], [0, 2, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]), 

		new Quad([-1, 1, -2, 0], [2, 0, 0, 0], [0, 0, 2, 0], [1, 1, 1, 1], [0, 0, 0, 0]), 

		new Quad([1, -1, -2, 0], [0, 0, 2, 0], [0, 2, 0, 0], [1, 1, 1, 0], [1, 0.01, 1, 0]), 

		new Quad([1, -1, -2, 0], [-2, 0, 0, 0], [0, 0, 2, 0], [1, 1, 1, 1], [0, 0, 0, 0]), 

		new Quad([1, -1, 0, 0], [-2, 0, 0, 0], [0, 2, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]), 

		new Quad([-0.5, 0.99, -1.5, 0], [1, 0, 0, 0], [0, 0, 1, 0], [1, 1, 1, 1], [0, 0, 0, 2]), 
	];

	let boxes = [
	];

	return {
		spheres : spheres,
		quads : quads,
		boxes : boxes,
		triangles: [],
		meshes: [],
		backgroundColor1 : [0, 0, 0],
		backgroundColor2 : [0, 0, 0],
		focusDistance: 5,
		focusAngle: 0,
		sunIntensity: 1,
		samplesPerPixel: 3,
		maxBounces: 10
	};
}

async function Infinite() 
{
	let spheres = [
		new Sphere([0.3, 0, -1], [0.4, 0.9, 0.8], 0.3, [0, 0, 0, 0]), 
		new Sphere([-0.5, -0.4, -1], [1, 1, 1], -0.25, [0, 0, 0, 1]), 
		new Sphere([-0.32, 0.5, -1], [1, 1, 1], 0.2, [1, 0, 1, 0]), 
	];

	let quads = [

		new Quad([-1, -1, 0, 0], [0, 0, -2, 0], [0, 2, 0, 0], [1, 1, 1, 1], [1, 0.005, 1, 0]), 

		new Quad([-1, -1, -2, 0], [2, 0, 0, 0], [0, 2, 0, 0], [1, 1, 1, 1], [1, 0.005, 1, 0]), 

		new Quad([-1, 1, -2, 0], [2, 0, 0, 0], [0, 0, 2, 0], [1, 1, 1, 1], [1, 0.005, 1, 0]), 

		new Quad([1, -1, -2, 0], [0, 0, 2, 0], [0, 2, 0, 0], [1, 1, 1, 1], [1, 0.005, 1, 0]), 

		new Quad([1, -1, -2, 0], [-2, 0, 0, 0], [0, 0, 2, 0], [1, 1, 1, 1], [1, 0.005, 1, 0]), 

		new Quad([1, -1, 0, 0], [-2, 0, 0, 0], [0, 2, 0, 0], [1, 1, 1, 1], [1, 0.005, 1, 0]), 
	];

	let boxes = [
	];

	return {
		spheres : spheres,
		quads : quads,
		boxes : boxes,
		triangles: [],
		meshes: [],
		backgroundColor1 : [0, 0, 0],
		backgroundColor2 : [0, 0, 0],
		focusDistance: 5,
		focusAngle: 0,
		sunIntensity: 1,
		samplesPerPixel: 5,
		maxBounces: 10
	};
}

async function Bunny()
{
    let offset = [0, -1, -2];
    let spheres = [groundDefault];
    spheres = spheres.concat(getSpheresRandom(3, offset));

    let { verticesMesh, trianglesMesh, triangles } = await loadMesh('./media/stanford-bunny.obj');
    
    let meshes = [new Mesh([0, -1, -4], [2, 2, 2], [0, .2, 0], [0.4, 0.3, 0.6, 1.0], [1.0, 0.0, 0.5, 0.0], 0, 0, triangles.length)];
    let { min, max } = getObjBoundingBox(verticesMesh);
    meshes[0].setBoundingBox(min, max);

    return {
        spheres, 
        quads: [], 
        boxes: [], 
        triangles, 
        meshes, 
        backgroundColor1: [0.0, 0.5, 1.0], 
        backgroundColor2: [1.0, 1.0, 1.0], 
        focusDistance: 4.0, 
        focusAngle: 0.2,
        sunIntensity: 1.0,
        samplesPerPixel: 1.0,
        maxBounces: 10.0
    };
}

async function Suzzanne()
{
    let { verticesMesh, trianglesMesh, triangles } = await loadMesh('./media/suzanne.obj');
    let meshes = [new Mesh([0, 0.0, -6], [2, 2, 2], [0, 0, 0], [0.6, 0.3, 0.7, 1.0], [0.0, 0.0, 0.0, 0.0], 0, 0, triangles.length)];
    let { min, max } = getObjBoundingBox(verticesMesh);
    meshes[0].setBoundingBox(min, max);

    return {
        spheres: [], 
        quads: [], 
        boxes: [], 
        triangles, 
        meshes, 
        backgroundColor1: [0.0, 0.5, 1.0], 
        backgroundColor2: [1.0, 1.0, 1.0], 
        focusDistance: 5.0, 
        focusAngle: 0.2,
        sunIntensity: 1.0,
        samplesPerPixel: 1.0,
        maxBounces: 10.0
    };
}

async function Rotation() 
{
	let spheres = [
		new Sphere([0, -1001, 0], [0.5, 0.5, 0.5], 1000, [0.9, 0, 0.6, 0]), 
		new Sphere([0, -0.58, -2.34], [0.8, 0.1, 0.2], 0.4, [0, 0.001, 0, 0]), 
		new Sphere([0.54, -0.81, -1.8], [0.4, 0.9, 0.8], 0.19, [0, 0, 0, 3]), 
	];

	let quads = [
	];

	let boxes = [
		new Box([-1.37, 0.6, -2.68, 0], [1, 1, 1], [-0.46, 5.32, 0.23, 0], [0.89, 1.41, 0.15, 0], [1, 0, 0.9, 0]), 
		new Box([0.49, 0.07, -2.04, 0], [1, 1, 1], [-0.56, -0.42, 0.31, 0], [0.2, 0.2, 0.2, 0], [0, 0, 0, 0]), 
		new Box([1.21, -0.36, -1.74, 0], [1, 1, 1], [-1.21, -3.65, -1.76, 0], [0.3, 0.3, 0.3, 0], [1, 0.03, 1, 0]), 
		new Box([1.13, -0.71, -1.17, 0], [1, 1, 1], [1.13, -0.73, 0, 0], [0.81, 0.01, 0.94, 0], [1, 0.01, 0.8, 0]), 
	];

	let { verticesMesh, trianglesMesh, triangles } = await loadMesh('./media/stanford-bunny.obj');
    let meshes = [new Mesh([-0.69, -1, -1.77], [.4, .4, .4], [0, -.75, 0], [0.4, 0.7, 0.6, 1.0], [1.0, 0.0, 0.5, 0.0], 0, 0, triangles.length)];
    let { min, max } = getObjBoundingBox(verticesMesh);
    meshes[0].setBoundingBox(min, max);

	return {
		spheres : spheres,
		quads : quads,
		boxes : boxes,
		triangles: triangles,
		meshes: meshes,
		backgroundColor1 : [1, 1, 1],
		backgroundColor2 : [0.06274509803921569, 0.0784313725490196, 0.19607843137254902],
		focusDistance: 3,
		focusAngle: 0,
		sunIntensity: 1,
		samplesPerPixel: 1,
		maxBounces: 10
	};
}

async function Everything()
{
    let offset = [0, -1, -2];
    let spheres = [groundDefault];
    spheres = spheres.concat(getSpheresRandom(3, offset));

    let boxes = [new Box([-1.0, 0.0, -2.6], [0.3, 0.5, 0.3], [0.0, -0.6, 0.0], [0.3, 0.9, 0.3], [1.0, 0.0, 0.9, 0.0]),
                new Box([1.0, 0.00, -2.6], [0.1, 0.2, 0.5], [0.0, -0.6, 0.0], [0.3, 0.9, 0.3], [-1.0, 0.0, 0.0, 0.0]),
                new Box([0.0, 0.00, -2.6], [0.5, 0.0, 0.5], [0.6, -0.6, 0.1], [0.3, 0.3, 0.3], [0.0, 0.0, 0.0, 0.0]),
                new Box([0.0, 1.0, -2.6], [0.3, 0.3, 0.3], [-0.6, -0.2, -0.1], [0.3, 0.3, 0.3], [1.0, 0.0, 0.9, 0.0]),
    ];

    let { verticesMesh, trianglesMesh, triangles } = await loadMesh('./media/suzanne.obj');
    let meshes = [new Mesh([0, -0.6, -2], [.25, .25, .25], [0.5, 0.3, 0.2], [0.6, 0.3, 0.7, 1.0], [1.0, 0.0, 0.7, 0.0], 0, 0, triangles.length)];
    let { min, max } = getObjBoundingBox(verticesMesh);
    meshes[0].setBoundingBox(min, max);

    return {
        spheres: spheres, 
        quads: [], 
        boxes: boxes, 
        triangles: triangles, 
        meshes: meshes,
        backgroundColor1: [0.0, 0.5, 1.0], 
        backgroundColor2: [1.0, 1.0, 1.0], 
        focusDistance: 3.0, 
        focusAngle: 0.0,
        sunIntensity: 1.0,
        samplesPerPixel: 1.0,
        maxBounces: 10.0
    };
}

// Cena nova (B+) feita para mostrar a primitiva nova (A): um templo circular
// de colunas cilindricas ao entardecer, com uma Suzanne de ouro no centro.
// Obs.: nada de funcoes auxiliares aqui, o seletor de cenas lista toda funcao do arquivo.
async function Templo()
{
    let center = [0, 0, -4.2];

    let spheres = [
        new Sphere([0, -1001, 0], [0.82, 0.8, 0.78], 1000, [0.85, 0, 0.4, 0]),
        new Sphere([0.0, -0.75, -2.9], [1, 1, 1], 0.25, [-1, 0, 0, 0]),
        new Sphere([-0.62, -0.82, -3.2], [0.4, 0.7, 1], 0.18, [0, 0, 0, 3]),
        new Sphere([0.68, -0.85, -3.3], [1, 0.4, 0.6], 0.15, [0, 0, 0, 3]),
    ];

    let boxes = [
        // base, teto luminoso e pedestal
        new Cylinder([center[0], -0.95, center[2]], [0.9, 0.88, 0.84], [0, 0, 0], 2.1, 0.05, [0, 0, 0, 0]),
        new Cylinder([center[0], 1.35, center[2]], [1, 0.85, 0.6], [0, 0, 0], 1.9, 0.04, [0, 0, 0, 1.5]),
        new Cylinder([center[0], -0.55, center[2]], [0.15, 0.15, 0.18], [0, 0, 0], 0.42, 0.35, [0.9, 0, 0.8, 0]),

        // cilindros soltos: um de vidro deitado e um de cobre inclinado
        new Cylinder([1.25, -0.72, -2.6], [0.85, 0.95, 1], [0, 0.6, 1.5708], 0.18, 0.42, [-1, 0, 0, 0]),
        new Cylinder([-1.3, -0.65, -2.7], [0.95, 0.5, 0.3], [0.25, 0, 0.2], 0.22, 0.35, [1, 0.15, 1, 0]),
    ];

    // seis colunas em volta do centro
    for (let i = 0; i < 6; i++)
    {
        let angle = i * Math.PI / 3;
        let position = [center[0] + 1.65 * Math.cos(angle), 0.2, center[2] + 1.65 * Math.sin(angle)];
        boxes.push(new Cylinder(position, [0.93, 0.91, 0.87], [0, 0, 0], 0.14, 1.1, [0, 0, 0, 0]));
    }

    let { verticesMesh, trianglesMesh, triangles } = await loadMesh('./media/suzanne.obj');
    let meshes = [new Mesh([center[0], 0.21, center[2]], [0.42, 0.42, 0.42], [0, 0.35, 0], [1.0, 0.76, 0.33, 1.0], [1.0, 0.08, 1.0, 0.0], 0, 0, triangles.length)];
    let { min, max } = getObjBoundingBox(verticesMesh);
    meshes[0].setBoundingBox(min, max);

    return {
        spheres: spheres,
        quads: [],
        boxes: boxes,
        triangles: triangles,
        meshes: meshes,
        backgroundColor1: [1.0, 0.5, 0.3],
        backgroundColor2: [0.15, 0.2, 0.45],
        focusDistance: 4.0,
        focusAngle: 0.0,
        sunIntensity: 1.0,
        samplesPerPixel: 2.0,
        maxBounces: 10.0
    };
}

export { getAvailableScene };