// Bitmoji Deluxe (style=5) - Full body avatars via libmoji / Bitmoji API
// This supports granular customizaton of tops, bottoms, shoes, etc.

export type AvatarConfig = Record<string, string> & { 
    gender: string;
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
    top: string;
    bottom: string;
    footwear: string;
    backgroundColor: string;
    face_proportion: string;
    eye_spacing: string;
    eye_size: string;
};

// ─── Ordered categories (used for tabs) ──────────────────────────────────────
export const AVATAR_CATEGORY_ORDER = [
    'gender',
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
    'top',
    'bottom',
    'footwear',
    'backgroundColor',
] as const;

export type Category = (typeof AVATAR_CATEGORY_ORDER)[number];

// ─── Icons for each category tab ─────────────────────────────────────────────
export const AVATAR_CATEGORY_ICONS: Record<Category, string> = {
    gender: 'person-outline',
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
    top: 'shirt-outline',
    bottom: 'footsteps-outline',
    footwear: 'walk-outline',
    backgroundColor: 'image-outline',
};

// ─── Human-readable category labels ─────────────────────────────────────────
export const CATEGORY_LABELS: Record<Category, string> = {
    gender: 'Gênero',
    skin_tone: 'Pele',
    hair: 'Cabelo',
    hair_tone: 'Cor do Cabelo',
    eye: 'Olhos',
    pupil_tone: 'Cor dos Olhos',
    brow: 'Sobrancelha',
    nose: 'Nariz',
    mouth: 'Boca',
    beard: 'Barba',
    body: 'Corpo',
    top: 'Camisa',
    bottom: 'Calça',
    footwear: 'Sapato',
    backgroundColor: 'Fundo',
};

// ─── Categories that should render as color swatches ────────────────────────
export const COLOR_CATEGORIES = new Set([
    'skin_tone',
    'hair_tone',
    'pupil_tone',
    'backgroundColor',
]);

// ─── Generic Options (Background) ──────────────────────────────────────────
export const GENERIC_OPTIONS = {
    backgroundColor: ['dbeafe', 'dcfce7', 'fef9c3', 'fce7f3', 'ede9fe', 'ffedd5', 'e0f2fe', 'fdf4ff', 'f8f9fa', 'ffffff', '1e293b'],
    top: ['138', '140', '143', '146', '148', '153', '155', '157', '159', '1018506', '1018392', '1018507', '1018508', '1018509', '1018510'],
    bottom: ['113', '114', '115', '116', '117', '118', '119', '120', '121', '122'],
    footwear: ['348', '297', '344', '321', '274', '238', '253'],
};

// ─── Style 5 / CM Options (Gender Specific) ───────────────────────────────
export const AVATAR_OPTIONS_GENDERED: Record<string, Record<string, string[]>> = {
    '1': { // Male
        gender: ['1'],
        skin_tone: ['9655597', '16764057', '11897407', '4732712', '9657655', '16691590', '13280865', '5451546', '11170379', '15838344'],
        hair: ['1305', '1328', '1302', '1330', '1346', '1723', '1711', '1306', '1721', '1722'],
        hair_tone: ['2039326', '2566954', '3613466', '4795690', '5587258', '7164990', '8672042', '10513945', '14133857', '16777164'],
        eye: ['1610', '1616', '1622', '1613', '1619', '1625', '1611', '1617', '1623'],
        pupil_tone: ['5977116', '8404014', '11174994', '3763125', '6064564', '2384950'],
        brow: ['1537', '1538', '1539', '1540', '1541', '1542', '1543', '1544'],
        nose: ['1435', '1436', '1437', '1438', '1439', '1440', '1646', '1441'],
        mouth: ['2337', '2338', '2339'],
        beard: ['-1', '1343', '1344', '1345', '1628', '1629', '1630', '2276'],
        body: ['0', '1', '2', '3', '4'],
    },
    '2': { // Female
        gender: ['2'],
        skin_tone: ['9655597', '16764057', '11897407', '4732712', '9657655', '16691590', '13280865', '5451546', '11170379', '15838344'],
        hair: ['1314', '1704', '1304', '1307', '1313', '1695', '1706', '1705', '1683', '1694'],
        hair_tone: ['2039326', '2566954', '3613466', '4795690', '5587258', '7164990', '8672042', '10513945', '14133857', '16777164'],
        eye: ['1610', '1616', '1622', '1613', '1619', '1625', '1611', '1617', '1623'],
        pupil_tone: ['5977116', '8404014', '11174994', '3763125', '6064564', '2384950'],
        brow: ['1573', '1574', '1575', '1576', '1577', '1578', '1579', '1580'],
        nose: ['1490', '1491', '1492', '1493', '1494', '1495', '1647', '1496'],
        mouth: ['2340', '2341', '2342'],
        beard: ['-1'],
        body: ['7', '8', '9', '10', '2'],
    }
};

// ─── Readability labels for non-color options ────────────────────────────
export const READABLE_LABELS: Record<string, Record<string, string>> = {
    gender: { '1': 'Masculino', '2': 'Feminino' },
    body: {
        '0': 'Normal', '1': 'Atlético', '2': 'Forte', '3': 'Magro', '4': 'Grande',
        '7': 'Feminino 1', '8': 'Feminino 2', '9': 'Feminino 3', '10': 'Feminino 4'
    },
};

// ─── Hex + name for mapping ──────────────────────────────────────────────────
export const COLOR_LABELS: Record<string, { hex: string; name: string }> = {
    // skin_tone
    '9655597': { hex: '#93554D', name: 'Muito Escuro' },
    '16764057': { hex: '#FFCB99', name: 'Muito Claro' },
    '11897407': { hex: '#B58B3F', name: 'Escuro' },
    '4732712': { hex: '#483728', name: 'Negro' },
    '9657655': { hex: '#935D37', name: 'Médio' },
    '16691590': { hex: '#FEC986', name: 'Claro' },
    // hair_tone
    '2039326': { hex: '#1F1E1E', name: 'Preto' },
    '2566954': { hex: '#272B2A', name: 'Ebony' },
    '3613466': { hex: '#37231A', name: 'Castanho' },
    '16777164': { hex: '#FFFFEC', name: 'Platinado' },
    // pupil_tone
    '5977116': { hex: '#5B3923', name: 'Castanho' },
    '8404014': { hex: '#80684D', name: 'Mel' },
    '11174994': { hex: '#779899', name: 'Azul' },
    // background
    'dbeafe': { hex: '#DBEAFE', name: 'Azul' },
    'dcfce7': { hex: '#DCFCE7', name: 'Verde' },
    'fef9c3': { hex: '#FEF9C3', name: 'Amarelo' },
    'fce7f3': { hex: '#FCE7F3', name: 'Rosa' },
    'ede9fe': { hex: '#EDE9FE', name: 'Roxo' },
    'ffffff': { hex: '#FFFFFF', name: 'Branco' },
    '1e293b': { hex: '#1E293B', name: 'Noite' },
};

// ─── URL builder ─────────────────────────────────────────────────────────────
export function buildBitmojiUrl(config: Partial<AvatarConfig>): string {
    const baseUrl = 'https://preview.bitmoji.com/avatar-builder-v3/preview/body';
    const params = new URLSearchParams();

    // Required basic params
    params.set('scale', '1');
    params.set('rotation', '0');
    params.set('gender', config.gender || '1');
    params.set('style', '5'); // CM / Deluxe

    // Traits
    const traits = [
        'skin_tone', 'hair', 'hair_tone', 'eye', 'pupil_tone', 
        'mouth', 'brow', 'nose', 'beard', 'body', 
        'face_proportion', 'eye_spacing', 'eye_size'
    ];

    traits.forEach(trait => {
        const val = (config as any)[trait];
        if (val !== undefined && val !== null && val !== '') {
            params.set(trait, val);
        }
    });

    // Clothing
    if (config.top) params.set('top', config.top);
    if (config.bottom) params.set('bottom', config.bottom);
    if (config.footwear) params.set('footwear', config.footwear);

    return `${baseUrl}?${params.toString()}`;
}

export function serializeConfig(config: AvatarConfig): string {
    return JSON.stringify(config);
}

export function parseConfig(configStr: string | null): AvatarConfig {
    if (!configStr) return DEFAULT_AVATAR_CONFIG;
    try {
        const parsed = JSON.parse(configStr);
        return { ...DEFAULT_AVATAR_CONFIG, ...parsed };
    } catch {
        return DEFAULT_AVATAR_CONFIG;
    }
}

// ─── Default starting config ──────────────────────────────────────────────────
export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
    gender: '1',
    style: '5',
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
    top: '138',
    bottom: '113',
    footwear: '348',
    backgroundColor: 'dbeafe',
};