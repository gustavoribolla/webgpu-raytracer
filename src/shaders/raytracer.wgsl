const THREAD_COUNT = 16;
const RAY_TMIN = 0.0001;
const RAY_TMAX = 100.0;
const PI = 3.1415927f;
const FRAC_1_PI = 0.31830987f;
const FRAC_2_PI = 1.5707964f;

@group(0) @binding(0)  
  var<storage, read_write> fb : array<vec4f>;

@group(0) @binding(1)
  var<storage, read_write> rtfb : array<vec4f>;

@group(1) @binding(0)
  var<storage, read_write> uniforms : array<f32>;

@group(2) @binding(0)
  var<storage, read_write> spheresb : array<sphere>;

@group(2) @binding(1)
  var<storage, read_write> quadsb : array<quad>;

@group(2) @binding(2)
  var<storage, read_write> boxesb : array<box>;

@group(2) @binding(3)
  var<storage, read_write> trianglesb : array<triangle>;

@group(2) @binding(4)
  var<storage, read_write> meshb : array<mesh>;

struct ray {
  origin : vec3f,
  direction : vec3f,
};

struct sphere {
  transform : vec4f,
  color : vec4f,
  material : vec4f,
};

struct quad {
  Q : vec4f,
  u : vec4f,
  v : vec4f,
  color : vec4f,
  material : vec4f,
};

struct box {
  center : vec4f,
  radius : vec4f,
  rotation: vec4f,
  color : vec4f,
  material : vec4f,
};

struct triangle {
  v0 : vec4f,
  v1 : vec4f,
  v2 : vec4f,
};

struct mesh {
  transform : vec4f,
  scale : vec4f,
  rotation : vec4f,
  color : vec4f,
  material : vec4f,
  min : vec4f,
  max : vec4f,
  show_bb : f32,
  start : f32,
  end : f32,
};

struct material_behaviour {
  scatter : bool,
  direction : vec3f,
};

struct camera {
  origin : vec3f,
  lower_left_corner : vec3f,
  horizontal : vec3f,
  vertical : vec3f,
  u : vec3f,
  v : vec3f,
  w : vec3f,
  lens_radius : f32,
};

struct hit_record {
  t : f32,
  p : vec3f,
  normal : vec3f,
  object_color : vec4f,
  object_material : vec4f,
  frontface : bool,
  hit_anything : bool,
};

fn ray_at(r: ray, t: f32) -> vec3f
{
  return r.origin + t * r.direction;
}

fn get_ray(cam: camera, uv: vec2f, rng_state: ptr<function, u32>) -> ray
{
  var rd = cam.lens_radius * rng_next_vec3_in_unit_disk(rng_state);
  var offset = cam.u * rd.x + cam.v * rd.y;
  return ray(cam.origin + offset, normalize(cam.lower_left_corner + uv.x * cam.horizontal + uv.y * cam.vertical - cam.origin - offset));
}

fn get_camera(lookfrom: vec3f, lookat: vec3f, vup: vec3f, vfov: f32, aspect_ratio: f32, aperture: f32, focus_dist: f32) -> camera
{
  var camera = camera();
  camera.lens_radius = aperture / 2.0;

  var theta = degrees_to_radians(vfov);
  var h = tan(theta / 2.0);
  var w = aspect_ratio * h;

  camera.origin = lookfrom;
  camera.w = normalize(lookfrom - lookat);
  camera.u = normalize(cross(vup, camera.w));
  camera.v = cross(camera.u, camera.w);

  camera.lower_left_corner = camera.origin - w * focus_dist * camera.u - h * focus_dist * camera.v - focus_dist * camera.w;
  camera.horizontal = 2.0 * w * focus_dist * camera.u;
  camera.vertical = 2.0 * h * focus_dist * camera.v;

  return camera;
}

fn envoriment_color(direction: vec3f, color1: vec3f, color2: vec3f) -> vec3f
{
  var unit_direction = normalize(direction);
  var t = 0.5 * (unit_direction.y + 1.0);
  var col = (1.0 - t) * color1 + t * color2;

  var sun_direction = normalize(vec3(uniforms[13], uniforms[14], uniforms[15]));
  var sun_color = int_to_rgb(i32(uniforms[17]));
  var sun_intensity = uniforms[16];
  var sun_size = uniforms[18];

  var sun = clamp(dot(sun_direction, unit_direction), 0.0, 1.0);
  col += sun_color * max(0, (pow(sun, sun_size) * sun_intensity));

  return col;
}

// Procura a intersecao mais proxima com as esferas da cena.
// Para a cena Specular (nivel C), tambem detecta caixas emissivas sem rotacao.
// A implementacao completa de caixas e outras geometrias fica para o nivel B.
fn check_ray_collision(r: ray, max: f32) -> hit_record
{
  let spheresCount = i32(uniforms[19]);
  var closest = hit_record(min(max, RAY_TMAX), vec3f(0.0), vec3f(0.0), vec4f(0.0), vec4f(0.0), false, false);

  for (var i = 0; i < spheresCount; i = i + 1)
  {
    let current_sphere = spheresb[i];
    var candidate = hit_record(closest.t, vec3f(0.0), vec3f(0.0), vec4f(0.0), vec4f(0.0), false, false);
    hit_sphere(current_sphere.transform.xyz, current_sphere.transform.w, r, &candidate, closest.t);

    if (candidate.hit_anything)
    {
      candidate.object_color = current_sphere.color;
      candidate.object_material = current_sphere.material;
      closest = candidate;
    }
  }

  // A cena Specular utiliza uma pequena caixa luminosa acima das esferas.
  // Por enquanto, somente caixas emissivas (material.w > 0) sem rotacao
  // participam das colisoes; caixas comuns sao conteudo do nivel B.
  let boxesCount = i32(uniforms[21]);
  for (var i = 0; i < boxesCount; i = i + 1)
  {
    let current_box = boxesb[i];
    if (current_box.material.w <= 0.0)
    {
      continue;
    }

    var candidate = hit_record(closest.t, vec3f(0.0), vec3f(0.0), vec4f(0.0), vec4f(0.0), false, false);
    hit_box(r, current_box.center.xyz, current_box.radius.xyz, &candidate, closest.t);

    if (candidate.hit_anything)
    {
      candidate.object_color = current_box.color;
      candidate.object_material = current_box.material;
      candidate.frontface = dot(r.direction, candidate.normal) < 0.0;
      closest = candidate;
    }
  }

  return closest;
}

// Reflexao difusa: sorteia uma direcao no hemisferio da normal.
fn lambertian(normal: vec3f, absorption: f32, random_sphere: vec3f, rng_state: ptr<function, u32>) -> material_behaviour
{
  if (rng_next_float(rng_state) < clamp(absorption, 0.0, 1.0))
  {
    return material_behaviour(false, vec3f(0.0));
  }

  var scatter_direction = normal + random_sphere;
  if (dot(scatter_direction, scatter_direction) < 0.000001)
  {
    scatter_direction = normal;
  }

  return material_behaviour(true, normalize(scatter_direction));
}

// Reflexao metalica: 'fuzz' acrescenta rugosidade ao raio refletido.
fn metal(normal: vec3f, direction: vec3f, fuzz: f32, random_sphere: vec3f) -> material_behaviour
{
  let reflected = reflect(normalize(direction), normal);
  let scattered = normalize(reflected + clamp(fuzz, 0.0, 1.0) * random_sphere);
  let valid = dot(scattered, normal) > 0.0;

  return material_behaviour(valid, scattered);
}

fn dielectric(normal : vec3f, r_direction: vec3f, refraction_index: f32, frontface: bool, random_sphere: vec3f, fuzz: f32, rng_state: ptr<function, u32>) -> material_behaviour
{  
  return material_behaviour(false, vec3f(0.0));
}

// Materiais emissivos geram radiancia propria (sem depender do ambiente).
// O quarto componente do material e a intensidade da fonte de luz.
fn emissive(color: vec3f, intensity: f32) -> vec3f
{
  return color * max(intensity, 0.0);
}

// Segue o caminho da luz pelas reflexoes sucessivas (path tracing simples).
// Nivel D: difuso, metal e fuzz. Nivel C: especularidade e emissao de luz.
fn trace(r: ray, rng_state: ptr<function, u32>) -> vec3f
{
  let maxbounces = max(1, i32(uniforms[2]));
  let backgroundcolor1 = int_to_rgb(i32(uniforms[11]));
  let backgroundcolor2 = int_to_rgb(i32(uniforms[12]));

  var radiance = vec3f(0.0);
  var throughput = vec3f(1.0);
  var current_ray = r;

  for (var j = 0; j < maxbounces; j = j + 1)
  {
    let hit = check_ray_collision(current_ray, RAY_TMAX);

    if (!hit.hit_anything)
    {
      radiance += throughput * envoriment_color(current_ray.direction, backgroundcolor1, backgroundcolor2);
      break;
    }

    // Uma fonte de luz contribui com radiancia e encerra o caminho.
    // A intensidade de emissao esta no quarto componente do material.
    if (hit.object_material.w > 0.0)
    {
      radiance += throughput * emissive(hit.object_color.rgb, hit.object_material.w);
      break;
    }

    // As superficies nao emissivas atenuam a luz pela sua cor.
    throughput *= hit.object_color.rgb;

    let random_direction = rng_next_vec3_in_unit_sphere(rng_state);
    let smoothness = clamp(hit.object_material.x, 0.0, 1.0);
    let absorption = hit.object_material.y;
    let specular = clamp(hit.object_material.z, 0.0, 1.0);
    var behaviour = material_behaviour(false, vec3f(0.0));

    // Smoothness controla a parcela metalica; Specular controla a chance
    // de reflexao especular. Valores menores deixam a superficie mais difusa.
    // As cenas Metal e Fuzz mantem Specular = 1 e seguem funcionando como antes.
    if (rng_next_float(rng_state) < smoothness * specular)
    {
      behaviour = metal(hit.normal, current_ray.direction, absorption, random_direction);
    }
    else
    {
      behaviour = lambertian(hit.normal, absorption, random_direction, rng_state);
    }

    if (!behaviour.scatter)
    {
      break;
    }

    // Pequeno deslocamento evita uma falsa colisao com a propria superficie.
    current_ray = ray(hit.p + RAY_TMIN * 2.0 * behaviour.direction, behaviour.direction);
  }

  return radiance;
}

@compute @workgroup_size(THREAD_COUNT, THREAD_COUNT, 1)
fn render(@builtin(global_invocation_id) id: vec3u)
{
  let rez = uniforms[1];
  if (id.x >= u32(rez) || id.y >= u32(rez))
  {
    return;
  }

  let frame = u32(uniforms[0]);
  var rng_state = init_rng(id.xy, vec2u(u32(rez)), frame);

  let lookfrom = vec3f(uniforms[7], uniforms[8], uniforms[9]);
  let lookat = vec3f(uniforms[23], uniforms[24], uniforms[25]);
  let cam = get_camera(lookfrom, lookat, vec3f(0.0, 1.0, 0.0), uniforms[10], 1.0, uniforms[6], uniforms[5]);

  let samples_per_pixel = max(1, i32(uniforms[4]));
  var color = vec3f(0.0);
  let fragCoord = vec2f(id.xy);

  for (var sample = 0; sample < samples_per_pixel; sample = sample + 1)
  {
    let uv = (fragCoord + sample_square(&rng_state)) / vec2f(rez);
    let primary_ray = get_ray(cam, uv, &rng_state);
    color += trace(primary_ray, &rng_state);
  }

  color /= f32(samples_per_pixel);

  let map_fb = mapfb(id.xy, rez);
  let previous = rtfb[map_fb];
  var average = color;
  var sample_count = 1.0;

  // Acumulacao progressiva em espaco linear. O contador fica no alpha do
  // buffer auxiliar; assim uma mudanca de cena pode reiniciar a media.
  if (uniforms[3] > 0.5 && previous.a > 0.0)
  {
    sample_count = min(previous.a + 1.0, 64.0);
    average = previous.rgb + (color - previous.rgb) / sample_count;
  }

  rtfb[map_fb] = vec4f(average, sample_count);
  fb[map_fb] = vec4f(linear_to_gamma(clamp(average, vec3f(0.0), vec3f(1.0))), 1.0);
}
