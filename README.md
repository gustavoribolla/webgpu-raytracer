# WebGPU Ray Tracer

Renderizador baseado em raios desenvolvido em **WGSL e WebGPU** para a disciplina de **Computação Gráfica** do Insper (Projeto 3).

Este repositório utiliza o template do curso e está sendo desenvolvido por etapas. **A implementação atual contempla os níveis D, C e C+:** `Basic`, `Metal`, `Fuzz`, `Specular`, `Emissive`, `Dielectric`, `Spheres` e `Night`.

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
| B | Cubes, Cornell, Mirror, Infinite | Pendente |
| B+ | Bunny, Suzanne e cena própria | Pendente |
| A | Nova primitiva geométrica | Pendente |
| A+ | Rotation, Everything | Pendente |

A presença de uma cena no seletor **não significa** que ela já esteja implementada: o template traz as definições de todas as cenas desde o início.

### Nível D: como foi feito

- `src/shaders/shapes.wgsl` — `hit_sphere`: resolve a equação quadrática de interseção raio-esfera, escolhe o primeiro encontro válido e calcula a normal.
- `src/shaders/raytracer.wgsl` — `check_ray_collision`: encontra a esfera mais próxima atingida pelo raio e retorna sua cor e seu material.
- `src/shaders/raytracer.wgsl` — `lambertian`: sorteia uma direção no hemisfério da normal para reflexões difusas (cena `Basic`).
- `src/shaders/raytracer.wgsl` — `metal`: calcula a direção refletida com `reflect` e acrescenta rugosidade com `fuzz` (cenas `Metal` e `Fuzz`).
- `src/shaders/raytracer.wgsl` — `trace`: percorre os raios refletidos até encontrar o ambiente ou atingir o limite de reflexões.
- `src/shaders/raytracer.wgsl` — `render`: gera raios por pixel, faz múltiplas amostras, calcula a média e acumula os resultados entre quadros.

As demais primitivas e materiais mais avançados ainda não estão integrados ao traçado de raios. A cena `Specular` utiliza uma **caixa emissiva sem rotação** como fonte luminosa; esse suporte pontual não equivale à implementação completa de caixas exigida no nível B.

### Nível C: como foi feito

- `src/shaders/raytracer.wgsl` — `trace`: agora considera `material.z` (**Specular**) na probabilidade de reflexão especular, em conjunto com `material.x` (**Smoothness**). Valores menores resultam em mais reflexões difusas; `Metal` e `Fuzz` permanecem com `Specular = 1`.
- `src/shaders/raytracer.wgsl` — `emissive`: converte cor e intensidade `material.w` (**Light**) em radiância emitida; `trace` soma essa contribuição quando um raio atinge a fonte, inclusive após reflexões.
- `src/shaders/raytracer.wgsl` — `check_ray_collision`: detecta a caixa luminosa **sem rotação** usada na cena `Specular`, chamando a função `hit_box` já presente no template. Caixas comuns continuam pendentes para o nível B.
- `src/scenes.js` — as cenas `Specular` e `Emissive` já vieram definidas pelo professor e **não precisaram ser alteradas**.

### Nível C+: como foi feito

- `src/shaders/raytracer.wgsl` — `dielectric`: calcula a refração de raios usando a lei de Snell (`refract`) e a reflexão (`reflect`). A aproximação de Schlick determina a probabilidade de reflexão conforme o ângulo de incidência, com tratamento de reflexão interna total.
- `src/shaders/raytracer.wgsl` — `trace`: identifica como dielétricas as superfícies com `material.x < 0` (convenção já utilizada nas cenas do template) e chama `dielectric` antes de tratar os materiais opacos. Para os vidros do projeto, foi adotado índice de refração **1,5**. O componente `material.y` acrescenta rugosidade ao raio transmitido/refletido; `0` corresponde a vidro liso.
- `src/shaders/shapes.wgsl` — `hit_sphere`: já determinava se a colisão ocorreu na face externa (`frontface`) e orientava a normal contra o raio; essas informações são utilizadas por `dielectric` para distinguir a entrada e a saída do vidro.
- `src/scenes.js` — as cenas `Dielectric`, `Spheres` e `Night` **não foram alteradas**. `Spheres` usa a geração de pequenas esferas aleatórias do template, com diferentes materiais, e os recursos de profundidade de campo já existentes na câmera (`get_camera`/`get_ray`). `Night` reutiliza essa composição, mas com ambiente escuro e fontes emissivas aleatórias.
- `main.js` — já havia espaço para **70 esferas**, suficiente para as 68 presentes na configuração padrão de `Spheres` e `Night` (64 aleatórias + 4 esferas fixas).

## Como testar os níveis D, C e C+

1. Selecione **Basic**: devem aparecer uma esfera vermelha, o solo cinza e o céu em gradiente, com material difuso.
2. Selecione **Metal**: devem aparecer esferas coloridas com reflexos metálicos nítidos.
3. Selecione **Fuzz**: compare as três esferas metálicas; rugosidades diferentes devem produzir reflexos mais nítidos ou mais espalhados.
4. Selecione **Specular**: compare as três esferas brancas com valores diferentes do campo **Specular**; a caixa emissiva acima delas também deve aparecer.
5. Selecione **Emissive**: o fundo é preto e a esfera branca à esquerda emite luz; após amostras suficientes, sua luz aparece nos demais objetos.
6. Selecione **Dielectric**: a esfera grande no centro deve ficar transparente, distorcendo as esferas coloridas ao fundo. Observe os reflexos nas bordas e a refração ao atravessar a superfície.
7. Selecione **Spheres**: uma cena com várias esferas pequenas aleatórias, materiais difusos, metálicos, emissivos e dielétricos. A câmera utiliza profundidade de campo.
8. Selecione **Night**: a mesma composição aleatória de `Spheres`, com fundo preto e iluminação solar reduzida; as esferas emissivas são as principais fontes de luz. Cada nova seleção cria uma distribuição aleatória diferente.
9. Aumente **Samples Per Pixel** para reduzir ruído e **Max Bounces** para permitir mais reflexões/refrações, caso necessário.

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
