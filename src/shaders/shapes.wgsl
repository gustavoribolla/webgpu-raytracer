// Encontra a primeira intersecao valida de um raio com uma esfera.
// Calcula tambem a normal orientada contra o raio incidente.
fn hit_sphere(center: vec3f, radius: f32, r: ray, record: ptr<function, hit_record>, max: f32)
{
  record.hit_anything = false;

  let oc = r.origin - center;
  let a = dot(r.direction, r.direction);
  let half_b = dot(oc, r.direction);
  let c = dot(oc, oc) - radius * radius;
  let discriminant = half_b * half_b - a * c;

  if (discriminant < 0.0)
  {
    return;
  }

  let sqrt_d = sqrt(discriminant);
  var root = (-half_b - sqrt_d) / a;

  if (root < RAY_TMIN || root > max)
  {
    root = (-half_b + sqrt_d) / a;
    if (root < RAY_TMIN || root > max)
    {
      return;
    }
  }

  let point = ray_at(r, root);
  let outward_normal = (point - center) / radius;
  let frontface = dot(r.direction, outward_normal) < 0.0;

  record.t = root;
  record.p = point;
  record.frontface = frontface;
  record.normal = select(-outward_normal, outward_normal, frontface);
  record.hit_anything = true;
}

fn hit_quad(r: ray, Q: vec4f, u: vec4f, v: vec4f, record: ptr<function, hit_record>, max: f32)
{
  var n = cross(u.xyz, v.xyz);
  var normal = normalize(n);
  var D = dot(normal, Q.xyz);
  var w = n / dot(n.xyz, n.xyz);

  var denom = dot(normal, r.direction);
  if (abs(denom) < 0.0001)
  {
    record.hit_anything = false;
    return;
  }

  var t = (D - dot(normal, r.origin)) / denom;
  if (t < RAY_TMIN || t > max)
  {
    record.hit_anything = false;
    return;
  }

  var intersection = ray_at(r, t);
  var planar_hitpt_vector = intersection - Q.xyz;
  var alpha = dot(w, cross(planar_hitpt_vector, v.xyz));
  var beta = dot(w, cross(u.xyz, planar_hitpt_vector));

  if (alpha < 0.0 || alpha > 1.0 || beta < 0.0 || beta > 1.0)
  {
    record.hit_anything = false;
    return;
  }

  if (dot(normal, r.direction) > 0.0)
  {
    record.hit_anything = false;
    return;
  }

  record.t = t;
  record.p = intersection;
  record.normal = normal;
  record.hit_anything = true;
}

fn hit_triangle(r: ray, v0: vec3f, v1: vec3f, v2: vec3f, record: ptr<function, hit_record>, max: f32)
{
  var v1v0 = v1 - v0;
  var v2v0 = v2 - v0;
  var rov0 = r.origin - v0;

  var n = cross(v1v0, v2v0);
  var q = cross(rov0, r.direction);

  // Raio paralelo ao triangulo: sem essa checagem u, v e t viram NaN
  // e o teste abaixo deixaria passar um hit invalido.
  var denom = dot(r.direction, n);
  if (abs(denom) < 1e-12)
  {
    record.hit_anything = false;
    return;
  }

  var d = 1.0 / denom;

  var u = d * dot(-q, v2v0);
  var v = d * dot(q, v1v0);
  var t = d * dot(-n, rov0);

  if (u < 0.0 || u > 1.0 || v < 0.0 || (u + v) > 1.0)
  {
    record.hit_anything = false;
    return;
  }

  if (t < RAY_TMIN || t > max)
  {
    record.hit_anything = false;
    return;
  }

  record.t = t;
  record.p = ray_at(r, t);
  record.normal = normalize(n);
  record.hit_anything = true;
}

fn hit_box(r: ray, center: vec3f, rad: vec3f, record: ptr<function, hit_record>, t_max: f32)
{
  var m = 1.0 / r.direction;
  var n = m * (r.origin - center);
  var k = abs(m) * rad;

  var t1 = -n - k;
  var t2 = -n + k;

  var tN = max(max(t1.x, t1.y), t1.z);
  var tF = min(min(t2.x, t2.y), t2.z);

  record.hit_anything = false;
  if (tN > tF || tF < RAY_TMIN)
  {
    return;
  }

  // Por fora o raio entra pela face de tN. Se ele ja comeca dentro (caixa de
  // vidro), a colisao valida e a saida, na face de tF.
  var t = tN;
  var outward_normal = -sign(r.direction) * step(t1.yzx, t1.xyz) * step(t1.zxy, t1.xyz);
  if (tN < RAY_TMIN)
  {
    t = tF;
    outward_normal = sign(r.direction) * step(t2.xyz, t2.yzx) * step(t2.xyz, t2.zxy);
  }

  if (t > t_max)
  {
    return;
  }

  // A normal fica apontando para fora; quem chama decide o lado (frontface).
  record.t = t;
  record.p = ray_at(r, t);
  record.normal = outward_normal;
  record.hit_anything = true;
}

// Primitiva nova: cilindro com tampas, no espaco local (eixo y, centro na origem).
// Testa a lateral (x^2 + z^2 = raio^2) e os dois discos das tampas e fica com o
// menor t valido. Como pega tambem a saida, funciona com o raio vindo de dentro.
fn hit_cylinder(r: ray, radius: f32, half_height: f32, record: ptr<function, hit_record>, t_max: f32)
{
  record.hit_anything = false;
  var best_t = t_max;
  var best_normal = vec3f(0.0);

  // lateral: so as componentes x e z do raio importam
  let a = r.direction.x * r.direction.x + r.direction.z * r.direction.z;
  if (a > 1e-8)
  {
    let half_b = r.origin.x * r.direction.x + r.origin.z * r.direction.z;
    let c = r.origin.x * r.origin.x + r.origin.z * r.origin.z - radius * radius;
    let discriminant = half_b * half_b - a * c;

    if (discriminant >= 0.0)
    {
      let sqrt_d = sqrt(discriminant);
      for (var i = 0; i < 2; i = i + 1)
      {
        let t = (-half_b + (f32(i) * 2.0 - 1.0) * sqrt_d) / a;
        let p = ray_at(r, t);
        if (t > RAY_TMIN && t < best_t && abs(p.y) <= half_height)
        {
          best_t = t;
          best_normal = vec3f(p.x, 0.0, p.z) / radius;
        }
      }
    }
  }

  // tampas: planos y = -half_height e y = +half_height
  if (abs(r.direction.y) > 1e-8)
  {
    for (var i = 0; i < 2; i = i + 1)
    {
      let side = f32(i) * 2.0 - 1.0;
      let t = (side * half_height - r.origin.y) / r.direction.y;
      let p = ray_at(r, t);
      if (t > RAY_TMIN && t < best_t && p.x * p.x + p.z * p.z <= radius * radius)
      {
        best_t = t;
        best_normal = vec3f(0.0, side, 0.0);
      }
    }
  }

  if (best_t >= t_max)
  {
    return;
  }

  record.t = best_t;
  record.p = ray_at(r, best_t);
  record.normal = best_normal;
  record.hit_anything = true;
}