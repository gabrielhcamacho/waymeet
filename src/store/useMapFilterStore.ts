import { create } from 'zustand';

interface MapFilterState {
    distanceKm: number;
    encontros: {
        interesses: string[];
        quando: 'hoje' | 'semana' | 'fds' | null;
        acesso: ('gratis' | 'pago')[];
    };
    pessoas: {
        idadeMin: number;
        idadeMax: number;
        moradores: boolean;
        turistas: boolean;
        soComFoto: boolean;
        soComBio: boolean;
        interessesEmComum: string[];
    };
    lugares: {
        tipos: string[];
        vibes: string[];
        faixaPreco: (1 | 2 | 3)[];
    };
    // Actions
    setDistance: (distanceKm: number) => void;
    setEncontrosFilters: (filters: Partial<MapFilterState['encontros']>) => void;
    setPessoasFilters: (filters: Partial<MapFilterState['pessoas']>) => void;
    setLugaresFilters: (filters: Partial<MapFilterState['lugares']>) => void;
    resetFilters: () => void;
}

const DEFAULT_STATE = {
    distanceKm: 5,
    encontros: {
        interesses: [],
        quando: null as 'hoje' | 'semana' | 'fds' | null,
        acesso: [],
    },
    pessoas: {
        idadeMin: 18,
        idadeMax: 99,
        moradores: true,
        turistas: true,
        soComFoto: false,
        soComBio: false,
        interessesEmComum: [],
    },
    lugares: {
        tipos: [],
        vibes: [],
        faixaPreco: [],
    }
};

export const useMapFilterStore = create<MapFilterState>()((set) => ({
    ...DEFAULT_STATE,

    setDistance: (distanceKm) => set({ distanceKm }),

    setEncontrosFilters: (filters) => set((state) => ({
        encontros: { ...state.encontros, ...filters }
    })),

    setPessoasFilters: (filters) => set((state) => ({
        pessoas: { ...state.pessoas, ...filters }
    })),

    setLugaresFilters: (filters) => set((state) => ({
        lugares: { ...state.lugares, ...filters }
    })),

    resetFilters: () => set(DEFAULT_STATE)
}));

// Helper selector to compute total active non-default filters
export const selectTotalActiveFilters = (state: MapFilterState): number => {
    let count = 0;

    if (state.distanceKm !== DEFAULT_STATE.distanceKm) count++;

    // Encontros
    count += state.encontros.interesses.length;
    if (state.encontros.quando !== null) count++;
    count += state.encontros.acesso.length;

    // Pessoas
    if (state.pessoas.idadeMin !== DEFAULT_STATE.pessoas.idadeMin) count++;
    if (state.pessoas.idadeMax !== DEFAULT_STATE.pessoas.idadeMax) count++;
    if (state.pessoas.moradores !== DEFAULT_STATE.pessoas.moradores) count++;
    if (state.pessoas.turistas !== DEFAULT_STATE.pessoas.turistas) count++;
    if (state.pessoas.soComFoto !== DEFAULT_STATE.pessoas.soComFoto) count++;
    if (state.pessoas.soComBio !== DEFAULT_STATE.pessoas.soComBio) count++;
    count += state.pessoas.interessesEmComum.length;

    // Lugares
    count += state.lugares.tipos.length;
    count += state.lugares.vibes.length;
    count += state.lugares.faixaPreco.length;

    return count;
};
