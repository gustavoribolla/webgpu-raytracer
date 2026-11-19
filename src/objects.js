class Sphere
{
    name = "Sphere";
    transform = [0.0, 0.0, 0.0, 0.0];
    color = [0.0, 0.0, 0.0, 0.0];
    material = [0.0, 0.0, 0.0, 0.0];

    constructor(center, color, radius, material)
    {
        this.transform = [center[0], center[1], center[2], radius];
        this.color = [color[0], color[1], color[2], 1.0];
        this.material = material;
    }
}

class Quad
{
    name = "Quad";
    Q = [0.0, 0.0, 0.0, 0.0];
    U = [0.0, 0.0, 0.0, 0.0];
    V = [0.0, 0.0, 0.0, 0.0];
    color = [0.0, 0.0, 0.0, 0.0];
    material = [0.0, 0.0, 0.0, 0.0];

    constructor(Q, U, V, color, material)
    {
        this.Q = Q;
        this.U = U;
        this.V = V;
        this.color = color;
        this.material = material;
    }
}

class Box
{
    name = "Box";
    center = [0.0, 0.0, 0.0, 0.0];
    radius = [0.0, 0.0, 0.0, 0.0];
    rotation = [0.0, 0.0, 0.0, 0.0];
    color = [0.0, 0.0, 0.0, 0.0];
    material = [0.0, 0.0, 0.0, 0.0];

    constructor(center, color, rotation, radius, material)
    {
        this.center = [center[0], center[1], center[2], 0.0];
        // radius[3] (W) diz se e caixa (0) ou cilindro (1); o PrintScene preserva o valor
        this.radius = [radius[0], radius[1], radius[2], radius[3] ?? 0.0];
        this.rotation = [rotation[0], rotation[1], rotation[2], 0.0];
        this.color = [color[0], color[1], color[2], 1.0];
        this.material = material;
    }
}

// Primitiva nova: cilindro com tampas. Reaproveita o layout da caixa no buffer
// (centro, raio, rotacao, cor, material), entao gira igual a uma caixa.
// radius = [raio, metade da altura, raio, 1]; o 1 no W avisa o shader.
class Cylinder extends Box
{
    name = "Cylinder";

    constructor(center, color, rotation, radius, halfHeight, material)
    {
        super(center, color, rotation, [radius, halfHeight, radius, 1.0], material);
    }
}

class Triangle
{
    name = "Triangle";
    A = [0.0, 0.0, 0.0, 0.0];
    B = [0.0, 0.0, 0.0, 0.0];
    C = [0.0, 0.0, 0.0, 0.0];

    constructor(A, B, C)
    {
        this.A = A;
        this.B = B;
        this.C = C;
    }
}

class Mesh
{
    name = "Mesh";
    transform = [0.0, 0.0, 0.0, 0.0];
    scale = [0.0, 0.0, 0.0, 0.0];
    rotation = [0.0, 0.0, 0.0, 0.0];
    color = [0.0, 0.0, 0.0, 0.0];
    material = [0.0, 0.0, 0.0, 0.0];
    min = [0.0, 0.0, 0.0, 0.0];
    max = [0.0, 0.0, 0.0, 0.0];
    showBB = 0;
    start = 0;
    end = 0;

    constructor(transform, scale, rotation, color, material, showBB, start, end)
    {
        this.transform = [transform[0], transform[1], transform[2], 0.0];
        this.scale = [scale[0], scale[1], scale[2], 0.0];
        this.rotation = [rotation[0], rotation[1], rotation[2], 0.0];
        this.color = [color[0], color[1], color[2], 1.0];
        this.material = material;
        this.showBB = showBB;
        this.start = start;
        this.end = end;
    }

    setBoundingBox(min, max)
    {
        this.min = [min[0], min[1], min[2], 0.0];
        this.max = [max[0], max[1], max[2], 0.0];
    }
}

export { Sphere, Quad, Box, Cylinder, Triangle, Mesh };