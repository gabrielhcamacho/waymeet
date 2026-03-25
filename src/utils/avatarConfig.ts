// Bitmoji Deluxe (style=5) - Full body avatars via libmoji / Bitmoji API
// This supports granular customizaton of tops, bottoms, shoes, etc.

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
};

// ─── Ordered categories (used for tabs) ──────────────────────────────────────
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

// ─── Icons for each category tab ─────────────────────────────────────────────
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

// ─── Human-readable category labels ─────────────────────────────────────────
export const CATEGORY_LABELS: Record<Category, string> = {
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
    outfit: 'Traje Completo',
    backgroundColor: 'Fundo',
};

// ─── Categories that should render as color swatches ────────────────────────
export const COLOR_CATEGORIES = new Set([
    'skin_tone',
    'hair_tone',
    'pupil_tone',
    'backgroundColor',
]);

export const GENERIC_OPTIONS = {
    backgroundColor: ['dbeafe', 'dcfce7', 'fef9c3', 'fce7f3', 'ede9fe', 'ffedd5', 'e0f2fe', 'fdf4ff', 'f8f9fa', 'ffffff', '1e293b'],
    outfit: ['1018544', '1018545', '1018548', '1018549', '1018550', '1018552', '1018553', '1018554'],
};

// ─── Style 5 / CM Options (Gender Specific) ───────────────────────────────
export const AVATAR_OPTIONS_GENDERED: Record<string, Record<string, string[]>> = {
    '1': { // Male
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
    beard: {
        '-1': 'Nenhum',
        '1343': 'Barba Cerrada',
        '1344': 'Cavanhaque',
        '1345': 'Barba Cheia',
        '1628': 'Âncora',
        '1629': 'Barba Média',
        '1630': 'Bigode e Cavanhaque',
        '2276': 'Barba Curta'
    },
    mouth: {
        '2337': 'Sério',
        '2338': 'Sorrindo',
        '2339': 'Sorriso Aberto',
        '2340': 'Suave',
        '2341': 'Sorrindo Natural',
        '2342': 'Sorriso Alegre'
    },
    hair: {
        '1305': 'Curto Social',
        '1328': 'Topete Casual',
        '1302': 'Militar',
        '1330': 'Franja Lateral',
        '1346': 'Cacheado Curto',
        '1723': 'Moicano Suave',
        '1711': 'Degradê Fio',
        '1306': 'Arrepiado',
        '1721': 'Black Power',
        '1722': 'Tranças Curtas',
        '1314': 'Longo Liso',
        '1704': 'Ondulado Médio',
        '1304': 'Chanel',
        '1307': 'Rabo de Cavalo',
        '1313': 'Coque Alto',
        '1695': 'Black Redondo',
        '1706': 'Franja Reta',
        '1705': 'Volume Natural',
        '1683': 'Tranças Longas',
        '1694': 'Pixie Cut'
    },
    outfit: {
        '1018544': 'Clássico 1',
        '1018545': 'Clássico 2',
        '1018548': 'Inverno',
        '1018549': 'Básico Dia a Dia',
        '1018550': 'Casual',
        '1018552': 'Despojado',
        '1018553': 'Urbano',
        '1018554': 'Streetwear'
    }
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
    // Bitmoji V3 API for Style 5 uses full 'outfit' presets.
    const outfitId = config.outfit || '1018544'; 
    params.set('outfit', outfitId);

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
    outfit: '1018544',
    backgroundColor: 'dbeafe',
};