// Bitmoji Deluxe (style=5) - Full body avatars via libmoji / Bitmoji API

export type AvatarConfig = Record<string, string> & {
    style: string;
    skin_tone: string;
    hair: string;
    hair_tone: string;
    eye: string;
    pupil_tone: string;
    mouth: string;
    brow: string;
    nose: string;
    beard: string;
    body: string;
    outfit: string;
    backgroundColor: string;
    face_proportion: string;
    eye_spacing: string;
    eye_size: string;
    gender: string;
};

// ─── Ordered categories ───────────────────────────────────────────────────────
export const AVATAR_CATEGORY_ORDER = [
    'skin_tone',
    'hair',
    'hair_tone',
    'eye',
    'pupil_tone',
    'brow',
    'nose',
    'mouth',
    'beard',
    'body',
    'outfit',
    'backgroundColor',
] as const;

export type Category = (typeof AVATAR_CATEGORY_ORDER)[number];

export const AVATAR_CATEGORY_ICONS: Record<Category, string> = {
    skin_tone: 'color-filter-outline',
    hair: 'cut-outline',
    hair_tone: 'color-palette-outline',
    eye: 'eye-outline',
    pupil_tone: 'color-wand-outline',
    brow: 'remove-outline',
    nose: 'ellipse-outline',
    mouth: 'happy-outline',
    beard: 'man-outline',
    body: 'body-outline',
    outfit: 'shirt-outline',
    backgroundColor: 'image-outline',
};

export const CATEGORY_LABELS: Record<Category, string> = {
    skin_tone: 'Pele',
    hair: 'Cabelo',
    hair_tone: 'Cor do Cabelo',
    eye: 'Olhos',
    pupil_tone: 'Cor dos Olhos',
    brow: 'Sobrancelha',
    nose: 'Nariz',
    mouth: 'Boca',
    beard: 'Barba / Bigode',
    body: 'Corpo',
    outfit: 'Traje Completo',
    backgroundColor: 'Fundo',
};

export const COLOR_CATEGORIES = new Set([
    'skin_tone',
    'hair_tone',
    'pupil_tone',
    'backgroundColor',
]);

// ─── Hair ─────────────────────────────────────────────────────────────────────
// Each hair carries the gender required for correct rendering.
// When the user picks a hair, avatarConfig.gender is updated automatically.
export type HairEntry = { id: string; label: string; gender: '1' | '2' };

export const HAIR_OPTIONS: HairEntry[] = [
    // Male
    { id: '1305', label: 'Curto Social', gender: '1' },
    { id: '1328', label: 'Topete Casual', gender: '1' },
    { id: '1302', label: 'Raspado', gender: '1' },
    { id: '1330', label: 'Franja Lateral', gender: '1' },
    { id: '1346', label: 'Penteado para o lado', gender: '1' },
    { id: '1723', label: 'Penteado para trás', gender: '1' },
    { id: '1711', label: 'Bagunçado', gender: '1' },
    { id: '1306', label: 'Arrepiado curto', gender: '1' },
    { id: '1721', label: 'Arrepiado longo', gender: '1' },
    { id: '1722', label: 'Degradê', gender: '1' },
    // Female
    { id: '1314', label: 'Longo Liso', gender: '2' },
    { id: '1704', label: 'Ondulado', gender: '2' },
    { id: '1304', label: 'Chanel', gender: '2' },
    { id: '1307', label: 'Solto', gender: '2' },
    { id: '1313', label: 'Chanel com franja', gender: '2' },
    { id: '1695', label: 'Tranças laterais', gender: '2' },
    { id: '1706', label: 'Rabo de Cavalo Lateral', gender: '2' },
    { id: '1705', label: 'Rabo de Cavalo', gender: '2' },
    { id: '1683', label: 'Coque', gender: '2' },
    { id: '1694', label: 'Coque Alto', gender: '2' },
];

export const HAIR_LABEL: Record<string, string> = Object.fromEntries(
    HAIR_OPTIONS.map(h => [h.id, h.label])
);
export const HAIR_GENDER: Record<string, '1' | '2'> = Object.fromEntries(
    HAIR_OPTIONS.map(h => [h.id, h.gender])
);

// ─── Body ─────────────────────────────────────────────────────────────────────
// VERIFIED from screenshots — corrected labels:
//   gender=1: '0'=Normal, '3'=Esguio, '1'=Robusto(stocky/wide), '2'=Gorducho(heavy), '4'=Barrigudo
//   gender=2: '8'=Esguia, '7'=Curvilínea, '10'=Alta e Fina, '9'=Cheia
// Body gender must be synced to avatarConfig.gender when selected.
export type BodyEntry = { id: string; label: string; gender: '1' | '2' };

export const BODY_OPTIONS: BodyEntry[] = [
    { id: '0', label: 'Normal', gender: '1' },
    { id: '2', label: 'Gordo', gender: '1' },
    { id: '7', label: 'Atlético', gender: '2' },
    { id: '10', label: 'Forte', gender: '2' },
    { id: '9', label: 'Magro', gender: '2' },
];

export const BODY_LABEL: Record<string, string> = Object.fromEntries(
    BODY_OPTIONS.map(b => [b.id, b.label])
);
export const BODY_GENDER: Record<string, '1' | '2'> = Object.fromEntries(
    BODY_OPTIONS.map(b => [b.id, b.gender])
);

// ─── Unified option lists for the category selector ──────────────────────────
export const AVATAR_OPTIONS: Record<Category, string[]> = {
    skin_tone: [
        '16764057', '15838344', '16691590', '11170379', '13280865',
        '9657655', '11897407', '9655597', '5451546', '4732712',
    ],
    hair: HAIR_OPTIONS.map(h => h.id),
    hair_tone: [
        '2039326', '2566954', '3613466', '4795690', '5587258',
        '7164990', '8672042', '10513945', '14133857', '16777164',
    ],

    // Eyes — shape variants; labels in READABLE_LABELS
    eye: ['1610', '1616', '1622', '1613', '1619', '1625', '1611', '1617', '1623'],

    pupil_tone: ['5977116', '8404014', '11174994', '3763125', '6064564', '2384950'],

    // Brows — male set 1537–1544, female set 1573–1580
    brow: [
        '1537', '1538', '1539', '1540', '1541', '1542', '1543', '1544',
        '1573', '1574', '1575', '1576', '1577', '1578', '1579', '1580',
    ],

    // Noses — male set 1435–1441+1646, female set 1490–1496+1647
    nose: [
        '1435', '1436', '1437', '1438', '1439', '1440', '1646', '1441',
        '1490', '1491', '1492', '1493', '1494', '1495', '1647', '1496',
    ],

    // Mouths — what actually varies is LIP THICKNESS, not expression.
    // 2337/38/39 = male lip thickness variants
    // 2340/41/42 = female lip thickness variants
    mouth: ['2337', '2338', '2339', '2340', '2341', '2342'],

    // Beards — re-verified from screenshots:
    //   -1   = nenhum
    //   1343 = cavanhaque (chin goatee)
    //   1344 = bigode fino (thin mustache only)
    //   1345 = barba cheia (full beard)
    //   1628 = âncora (chin + connected mustache)
    //   1629 = barba média (medium beard)
    //   1630 = ponto no queixo (soul patch — tiny dot)
    //   2276 = barba curta (short stubble)
    beard: ['-1', '1343', '1344', '1345', '1628', '1629', '1630'],

    body: BODY_OPTIONS.map(b => b.id),

    // Outfits — base 8 verified + 16 additional (test in your app; remove any that return 404)
    outfit: [
        '1018544', '1018545', '1018548', '1018549',
        '1018550', '1018552', '1018553', '1018554',
        '1018555', '1018556', '1018557', '1018558',
        '1018559', '1018560', '1018561', '1018562',
        '1018563', '1018564', '1018565', '1018566',
        '1018567', '1018568', '1018569', '1018570',
    ],

    backgroundColor: [
        'dbeafe', 'dcfce7', 'fef9c3', 'fce7f3', 'ede9fe',
        'ffedd5', 'e0f2fe', 'fdf4ff', 'f8f9fa', 'ffffff', '1e293b',
    ],
};

// ─── Readable labels ──────────────────────────────────────────────────────────
export const READABLE_LABELS: Record<string, Record<string, string>> = {
    gender: { '1': 'Masculino', '2': 'Feminino' },

    body: BODY_LABEL,

    hair: HAIR_LABEL,

    // Corrected beard labels based on visual observation
    beard: {
        '-1': 'Nenhum',
        '1343': 'Barba cerrada',
        '1344': 'Bigode',
        '1345': 'Cavanhaque',
        '1628': 'Barba Média',
        '1629': 'Barba Cheia',
        '1630': 'Ponto no Queixo',
        '2276': 'Barba Curta',
    },

    // Corrected mouth labels — variation is lip thickness, not smile
    mouth: {
        '2337': 'Lábios Finos',
        '2338': 'Lábios Médios',
        '2339': 'Lábios Cheios',
        '2340': 'Lábios Finos F',
        '2341': 'Lábios Médios F',
        '2342': 'Lábios Cheios F',
    },

    outfit: {
        '1018544': 'Casual Clássico',
        '1018545': 'Social',
        '1018548': 'Inverno',
        '1018549': 'Básico',
        '1018550': 'Esportivo',
        '1018552': 'Despojado',
        '1018553': 'Urbano',
        '1018554': 'Streetwear',
        '1018555': 'Jeans e Camiseta',
        '1018556': 'Moletom',
        '1018557': 'Camisa Xadrez',
        '1018558': 'Regata',
        '1018559': 'Terno',
        '1018560': 'Colete',
        '1018561': 'Polo',
        '1018562': 'Agasalho',
        '1018563': 'Vestido Casual',
        '1018564': 'Blusa Floral',
        '1018565': 'Conjunto Esportivo F',
        '1018566': 'Camiseta e Saia',
        '1018567': 'Jaqueta F',
        '1018568': 'Macacão',
        '1018569': 'Suéter F',
        '1018570': 'Conjunto Social F',
    },

    eye: {
        '1610': 'Amendoado',
        '1616': 'Redondo',
        '1622': 'Levantado',
        '1613': 'Inclinado',
        '1619': 'Largo',
        '1625': 'Profundo',
        '1611': 'Pequeno',
        '1617': 'Expressivo',
        '1623': 'Suave',
    },

    brow: {
        '1537': 'Reto',
        '1538': 'Arqueado',
        '1539': 'Espesso',
        '1540': 'Natural',
        '1541': 'Baixo',
        '1542': 'Angulado',
        '1543': 'Fino',
        '1544': 'Curto',
        '1573': 'Suave F',
        '1574': 'Curvado F',
        '1575': 'Definido F',
        '1576': 'Levantado F',
        '1577': 'Reto F',
        '1578': 'Fino F',
        '1579': 'Arqueado F',
        '1580': 'Delicado F',
    },

    nose: {
        '1435': 'Padrão',
        '1436': 'Largo',
        '1437': 'Pontudo',
        '1438': 'Arrebitado',
        '1439': 'Romano',
        '1440': 'Pequeno',
        '1646': 'Achatado',
        '1441': 'Redondo',
        '1490': 'Natural F',
        '1491': 'Delicado F',
        '1492': 'Pontudo F',
        '1493': 'Arrebitado F',
        '1494': 'Fino F',
        '1495': 'Pequeno F',
        '1647': 'Achatado F',
        '1496': 'Suave F',
    },
};

// ─── Color swatches ───────────────────────────────────────────────────────────
export const COLOR_LABELS: Record<string, { hex: string; name: string }> = {
    '16764057': { hex: '#FFCB99', name: 'Muito Claro' },
    '15838344': { hex: '#F1B87C', name: 'Pêssego' },
    '16691590': { hex: '#FEC986', name: 'Claro' },
    '11170379': { hex: '#AA7850', name: 'Canela' },
    '13280865': { hex: '#CA9064', name: 'Médio' },
    '9657655': { hex: '#935D37', name: 'Médio Escuro' },
    '11897407': { hex: '#B58B3F', name: 'Escuro' },
    '9655597': { hex: '#93554D', name: 'Muito Escuro' },
    '5451546': { hex: '#533626', name: 'Ebôneo' },
    '4732712': { hex: '#483728', name: 'Negro' },

    '2039326': { hex: '#1F1E1E', name: 'Preto' },
    '2566954': { hex: '#272B2A', name: 'Ébano' },
    '3613466': { hex: '#37231A', name: 'Castanho Escuro' },
    '4795690': { hex: '#4A3323', name: 'Castanho' },
    '5587258': { hex: '#5B4030', name: 'Avelã' },
    '7164990': { hex: '#6D5040', name: 'Caramelo' },
    '8672042': { hex: '#846050', name: 'Ruivo Escuro' },
    '10513945': { hex: '#A07860', name: 'Ruivo' },
    '14133857': { hex: '#D7A878', name: 'Loiro' },
    '16777164': { hex: '#FFFFEC', name: 'Platinado' },

    '5977116': { hex: '#5B3923', name: 'Castanho' },
    '8404014': { hex: '#80684D', name: 'Mel' },
    '11174994': { hex: '#779899', name: 'Azul Acinzentado' },
    '3763125': { hex: '#395F75', name: 'Azul' },
    '6064564': { hex: '#5C8A3C', name: 'Verde' },
    '2384950': { hex: '#243349', name: 'Azul Escuro' },

    'dbeafe': { hex: '#DBEAFE', name: 'Azul Claro' },
    'dcfce7': { hex: '#DCFCE7', name: 'Verde Menta' },
    'fef9c3': { hex: '#FEF9C3', name: 'Amarelo Pastel' },
    'fce7f3': { hex: '#FCE7F3', name: 'Rosa' },
    'ede9fe': { hex: '#EDE9FE', name: 'Lavanda' },
    'ffedd5': { hex: '#FFEDD5', name: 'Pêssego' },
    'e0f2fe': { hex: '#E0F2FE', name: 'Céu' },
    'fdf4ff': { hex: '#FDF4FF', name: 'Lilás' },
    'f8f9fa': { hex: '#F8F9FA', name: 'Cinza Suave' },
    'ffffff': { hex: '#FFFFFF', name: 'Branco' },
    '1e293b': { hex: '#1E293B', name: 'Noite' },
};

// ─── URL builder ──────────────────────────────────────────────────────────────
// Gender is resolved from the selected hair (priority) or body, never stored separately.
export function buildBitmojiUrl(config: Partial<AvatarConfig>): string {
    const baseUrl = 'https://preview.bitmoji.com/avatar-builder-v3/preview/body';
    const params = new URLSearchParams();

    const hairGender = config.hair ? HAIR_GENDER[config.hair] : undefined;
    const bodyGender = config.body ? BODY_GENDER[config.body] : undefined;
    const gender = hairGender ?? bodyGender ?? config.gender ?? '1';

    params.set('scale', '1');
    params.set('rotation', '0');
    params.set('gender', gender);
    params.set('style', '5');

    const traits = [
        'skin_tone', 'hair', 'hair_tone', 'eye', 'pupil_tone',
        'mouth', 'brow', 'nose', 'beard', 'body',
        'face_proportion', 'eye_spacing', 'eye_size',
    ];

    traits.forEach(trait => {
        const val = (config as any)[trait];
        if (val !== undefined && val !== null && val !== '') {
            params.set(trait, val);
        }
    });

    params.set('outfit', config.outfit || '1018544');

    return `${baseUrl}?${params.toString()}`;
}

export function serializeConfig(config: AvatarConfig): string {
    return JSON.stringify(config);
}

export function parseConfig(configStr: string | null): AvatarConfig {
    if (!configStr) return DEFAULT_AVATAR_CONFIG;
    try {
        return { ...DEFAULT_AVATAR_CONFIG, ...JSON.parse(configStr) };
    } catch {
        return DEFAULT_AVATAR_CONFIG;
    }
}

// ─── Default config ───────────────────────────────────────────────────────────
export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
    style: '5',
    gender: '1',
    skin_tone: '16764057',
    hair: '1305',
    hair_tone: '2566954',
    eye: '1610',
    pupil_tone: '5977116',
    mouth: '2337',
    brow: '1538',
    nose: '1436',
    beard: '-1',
    body: '0',
    face_proportion: '1',
    eye_spacing: '1',
    eye_size: '1',
    outfit: '1018544',
    backgroundColor: 'dbeafe',
};