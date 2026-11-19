# WebGPU Ray Tracer

Renderizador baseado em raios desenvolvido em **WGSL e WebGPU** para a disciplina de **Computação Gráfica** do Insper (Projeto 3).

Este repositório utiliza o template do curso e foi desenvolvido por etapas. **A implementação cobre todos os níveis, de D até A+:** todas as cenas do template, uma cena nova (`Templo`) e uma primitiva geométrica nova (cilindro).

## Execução

Abra um terminal na raiz do projeto e execute:

```bash
python -m http.server 8000
```

Acesse <http://localhost:8000/> no Chrome ou Edge com suporte a WebGPU. Alternativamente, use a extensão **Live Server** do VS Code. Não abra o `index.html` diretamente sem um servidor HTTP.

Na interface lateral, selecione as cenas em **Scene**. O projeto inicia com `Basic` para facilitar a verificação das funcionalidades já implementadas.

## Funcionalidades

| Nível | Cenas | Estado |
| --- | --- | --- |
| D | Basic, Metal, Fuzz | Implementação adicionada |
| C | Specular, Emissive | Implementação adicionada |
| C+ | Dielectric, Spheres, Night | Implementação adicionada |
| B | Cubes, Cornell, Mirror, Infinite | Implementação adicionada |
| B+ | Bunny, Suzanne e cena própria (`Templo`) | Implementação adicionada |
| A | Nova primitiva geométrica (cilindro) | Implementação adicionada |
| A+ | Rotation, Everything | Implementação adicionada |

Todas as cenas foram comparadas visualmente com o [gabarito da disciplina](https://gubebra.itch.io/raytracing).

### Nível D: como foi feito

- `src/shaders/shapes.wgsl` — `hit_sphere`: resolve a equação quadrática de interseção raio-esfera, escolhe o primeiro encontro válido e calcula a normal.
- `src/shaders/raytracer.wgsl` — `check_ray_collision`: encontra a esfera mais próxima atingida pelo raio e retorna sua cor e seu material.
- `src/shaders/raytracer.wgsl` — `lambertian`: sorteia uma direção no hemisfério da normal para reflexões difusas (cena `Basic`).
- `src/shaders/raytracer.wgsl` — `metal`: calcula a direção refletida com `reflect` e acrescenta rugosidade com `fuzz` (cenas `Metal` e `Fuzz`).
- `src/shaders/raytracer.wgsl` — `trace`: percorre os raios refletidos até encontrar o ambiente ou atingir o limite de reflexões.
- `src/shaders/raytracer.wgsl` — `render`: gera raios por pixel, faz múltiplas amostras, calcula a média e acumula os resultados entre quadros.

### Nível C: como foi feito

- `src/shaders/raytracer.wgsl` — `trace`: agora considera `material.z` (**Specular**) na probabilidade de reflexão especular, em conjunto com `material.x` (**Smoothness**). Valores menores resultam em mais reflexões difusas; `Metal` e `Fuzz` permanecem com `Specular = 1`.
- `src/shaders/raytracer.wgsl` — `emissive`: converte cor e intensidade `material.w` (**Light**) em radiância emitida; `trace` soma essa contribuição quando um raio atinge a fonte, inclusive após reflexões.
- `src/shaders/raytracer.wgsl` — `check_ray_collision`: detecta a caixa luminosa usada na cena `Specular` (no nível B as caixas passaram a ser tratadas por completo).
- `src/scenes.js` — as cenas `Specular` e `Emissive` já vieram definidas pelo professor e **não precisaram ser alteradas**.

### Nível C+: como foi feito

- `src/shaders/raytracer.wgsl` — `dielectric`: calcula a refração de raios usando a lei de Snell (`refract`) e a reflexão (`reflect`). A aproximação de Schlick determina a probabilidade de reflexão conforme o ângulo de incidência, com tratamento de reflexão interna total.
- `src/shaders/raytracer.wgsl` — `trace`: identifica como dielétricas as superfícies com `material.x < 0` (convenção já utilizada nas cenas do template) e chama `dielectric` antes de tratar os materiais opacos. Para os vidros do projeto, foi adotado índice de refração **1,5**. O componente `material.y` acrescenta rugosidade ao raio transmitido/refletido; `0` corresponde a vidro liso.
- `src/shaders/shapes.wgsl` — `hit_sphere`: já determinava se a colisão ocorreu na face externa (`frontface`) e orientava a normal contra o raio; essas informações são utilizadas por `dielectric` para distinguir a entrada e a saída do vidro.
- `src/scenes.js` — as cenas `Dielectric`, `Spheres` e `Night` **não foram alteradas**. `Spheres` usa a geração de pequenas esferas aleatórias do template, com diferentes materiais, e os recursos de profundidade de campo já existentes na câmera (`get_camera`/`get_ray`). `Night` reutiliza essa composição, mas com ambiente escuro e fontes emissivas aleatórias.
- `main.js` — já havia espaço para **70 esferas**, suficiente para as 68 presentes na configuração padrão de `Spheres` e `Night` (64 aleatórias + 4 esferas fixas).

### Nível B: como foi feito

- `src/shaders/raytracer.wgsl` — `check_ray_collision`: além das esferas, percorre os **quads** (`hit_quad`, de um lado só, como no template) e as **caixas** (`hit_box`), sempre guardando o hit mais próximo.
- `src/shaders/shapes.wgsl` — `hit_box`: além da entrada pela face mais próxima, agora trata o raio que começa **dentro** da caixa (sai pela face de `tF`). Isso é necessário para caixas de vidro.
- `src/shaders/shapes.wgsl` — `hit_triangle`: ganhou uma checagem para raio paralelo ao triângulo, que antes gerava `NaN` e um hit falso.
- `src/shaders/raytracer.wgsl` — `set_face_normal`: função única para orientar a normal contra o raio e marcar `frontface`, usada por caixas, cilindros e malhas.
- `src/shaders/raytracer.wgsl` — `trace`: com `Smoothness < 1`, a direção refletida é misturada com uma direção difusa, deixando o reflexo borrado como no gabarito (chão da `Cubes` e da `Specular`). Com `Smoothness = 1` nada muda (`Metal` e `Fuzz`).
- `Cornell`, `Mirror` e `Infinite` usam quads como paredes, espelhos (`Smoothness = 1`) e luz de teto emissiva; `Infinite` usa uma esfera de raio negativo como luz, o que inverte a normal dela.

### Nível B+: como foi feito

- `src/shaders/raytracer.wgsl` — `check_ray_collision`: as **malhas** são testadas no espaço do `.obj`. O raio é levado para lá tirando a posição, girando e dividindo pela escala; a direção não é normalizada, então o `t` local é o mesmo `t` do mundo.
- Antes dos triângulos, `AABB_intersect` testa a bounding box da malha (`min`/`max`); se o raio não passa por ela, todos os triângulos são pulados.
- A normal do triângulo volta para o mundo dividida pela escala (inversa transposta, para escala não uniforme) e girada de volta.
- `src/scenes.js` — **`Templo`**: cena nova com um templo circular de colunas ao entardecer, Suzanne de ouro sobre um pedestal, teto luminoso, orbes emissivos e cilindros de vidro e de cobre. Ela reúne quase tudo do projeto (primitiva nova, malha, rotação, vidro, metal e emissão).

### Nível A: como foi feito (primitiva nova: cilindro)

- `src/shaders/shapes.wgsl` — `hit_cylinder`: cilindro com tampas no espaço local (eixo `y`). Resolve a lateral pela equação `x² + z² = r²` (limitada pela altura) e os dois discos das tampas, ficando com o menor `t` válido. Como também encontra a saída, funciona com vidro.
- `src/objects.js` — classe `Cylinder`: usa o mesmo layout da `Box` no buffer (centro, raio, rotação, cor, material), então gira igual a uma caixa. `radius = [raio, metade da altura, raio, 1]`; o `1` no `W` avisa o shader que é um cilindro. Pela interface, basta trocar o `W` do raio de uma caixa para `1` para virá-la em cilindro.

### Nível A+: como foi feito

- `src/shaders/raytracer.wgsl` — `check_ray_collision`: a rotação (ângulos de Euler) de caixas, cilindros e malhas vira um quaternion (`quaternion_from_euler`). O raio é girado com `rotate_ray_quaternion` para o espaço local, onde o objeto fica alinhado aos eixos, e a normal volta para o mundo com o quaternion inverso.
- `Rotation` testa caixas e malha girados; `Everything` junta tudo, inclusive caixa de vidro (que usa o `hit_box` com saída por dentro) e a Suzanne girada nos três eixos.

## Como testar

1. Selecione **Basic**: devem aparecer uma esfera vermelha, o solo cinza e o céu em gradiente, com material difuso.
2. Selecione **Metal**: devem aparecer esferas coloridas com reflexos metálicos nítidos.
3. Selecione **Fuzz**: compare as três esferas metálicas; rugosidades diferentes devem produzir reflexos mais nítidos ou mais espalhados.
4. Selecione **Specular**: compare as três esferas brancas com valores diferentes do campo **Specular**; a caixa emissiva acima delas também deve aparecer.
5. Selecione **Emissive**: o fundo é preto e a esfera branca à esquerda emite luz; após amostras suficientes, sua luz aparece nos demais objetos.
6. Selecione **Dielectric**: a esfera grande no centro deve ficar transparente, distorcendo as esferas coloridas ao fundo. Observe os reflexos nas bordas e a refração ao atravessar a superfície.
7. Selecione **Spheres**: uma cena com várias esferas pequenas aleatórias, materiais difusos, metálicos, emissivos e dielétricos. A câmera utiliza profundidade de campo.
8. Selecione **Night**: a mesma composição aleatória de `Spheres`, com fundo preto e iluminação solar reduzida; as esferas emissivas são as principais fontes de luz. Cada nova seleção cria uma distribuição aleatória diferente.
9. Selecione **Cubes**: duas caixas (vermelha e branca), uma esfera metálica e o chão com reflexo borrado.
10. Selecione **Cornell** e **Mirror**: caixas de quads com luz no teto; na `Mirror`, as paredes laterais são espelhos.
11. Selecione **Infinite**: uma sala de espelhos, com reflexões que se repetem até o limite de **Max Bounces**.
12. Selecione **Bunny** e **Suzzanne**: as malhas `.obj` com sombreamento facetado.
13. Selecione **Rotation** e **Everything**: caixas e malhas girados, caixa de vidro e metais.
14. Selecione **Templo**: a cena nova, com os cilindros (primitiva nova).
15. Aumente **Samples Per Pixel** para reduzir ruído e **Max Bounces** para permitir mais reflexões/refrações, caso necessário.

Cenas com iluminação indireta (`Emissive`, `Spheres` e `Night`) podem apresentar ruído antes de acumular muitas amostras. A qualidade de imagem pode mudar durante o acúmulo progressivo de amostras. Para inspecionar erros de WGSL ou WebGPU, abra as ferramentas de desenvolvedor do navegador (F12 → Console).

## Controles

- **W/A/S/D/Q/E**: movimentação da câmera.
- **Setas**: orientação da câmera.
- **Z/X**: rotação adicional.
- **Scene**: seleção de cenas pré-configuradas.
- **Save Image**: salva a imagem renderizada.

## Estrutura principal

```text
webgpu-raytracer/
├── index.html
├── main.js
├── src/
│   ├── objects.js
│   ├── scenes.js
│   ├── util.js
│   └── shaders/
│       ├── raytracer.wgsl
│       ├── shapes.wgsl
│       ├── rng.wgsl
│       └── utils.wgsl
└── media/
```

## Referências

- [Template de Ray Tracing WGSL da disciplina](https://github.com/Gustavobb/raytracing-wgsl-template)
- [Referência visual das cenas do projeto](https://gubebra.itch.io/raytracing)

**Entrega:** 20/11/2026, via Blackboard (link do repositório Git).
