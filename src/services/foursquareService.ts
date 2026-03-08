import { Place } from '../types';

// O Foursquare V2 usa Client ID e Client Secret na query string
// https://developer.foursquare.com/docs/places-api/authentication/#userless-auth
const CLIENT_ID = process.env.EXPO_PUBLIC_FOURSQUARE_CLIENT_ID || process.env.client_id || 'HIZLAFYEBHVCJHGRT1F0M0GGJB4T2QPDEG4RWPAMS41V2RMA';
const CLIENT_SECRET = process.env.EXPO_PUBLIC_FOURSQUARE_CLIENT_SECRET || process.env.client_secret || 'KGTQ5MY1WLO22OOOAE045VIZ2ZB02AAX0B2OAHF0YDSRYI5J';
const VERSION_DATE = '20231010'; // Formato YYYYMMDD exigido pela v2
const BASE_URL = 'https://api.foursquare.com/v2/venues';

interface FoursquareVenue {
    id: string;
    name: string;
    location: {
        address?: string;
        city?: string;
        lat: number;
        lng: number;
    };
    categories: Array<{
        name: string;
        icon: {
            prefix: string;
            suffix: string;
        };
    }>;
    rating?: number;
    url?: string;
    contact?: {
        phone?: string;
        formattedPhone?: string;
        twitter?: string;
        instagram?: string;
        facebook?: string;
    };
    price?: {
        tier: number;
        message: string;
        currency: string;
    };
    hours?: {
        status?: string;
        isOpen?: boolean;
    };
    popular?: {
        status?: string;
    };
    menu?: {
        url?: string;
    };
    photos?: {
        groups?: Array<{
            items: Array<{
                prefix: string;
                suffix: string;
            }>
        }>
    };
}

export const foursquareService = {
    /**
     * Busca locais ao redor de uma coordenada usando Foursquare v2 (explore)
     */
    async getPlacesNearby(latitude: number, longitude: number, radius = 2000): Promise<Place[]> {
        try {
            const params = new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                v: VERSION_DATE,
                ll: `${latitude},${longitude}`,
                radius: radius.toString(),
                limit: '20',
                venuePhotos: '1',
            });

            const response = await fetch(`${BASE_URL}/explore?${params.toString()}`);
            if (!response.ok) {
                console.error('Erro na resposta do Foursquare explore:', response.status);
                return [];
            }

            const data = await response.json();
            const items = data.response?.groups?.[0]?.items || [];

            return items.map((item: any) => {
                const venue: FoursquareVenue = item.venue;
                const primaryCategory = venue.categories?.[0];

                // Constrói a URL do ícone se a categoria existir
                let categoryIcon = '📍';
                let categoryName = 'Local';

                if (primaryCategory) {
                    categoryName = primaryCategory.name;
                    // Foursquare ícones: prefix + bg_64 + suffix
                    // Neste mock simplificado, estamos mapeando apenas os que temos de emoji pros mocks,
                    // mas o Place type do WayMeet aceita URL de imagem em imageUrl.
                    categoryIcon = '📍';
                }

                // Extract photos if available in V2 explore
                const venuePhotos: string[] = [];
                // Algumas respostas trazem a foto principal direto no item.photo
                if (item.photo && item.photo.prefix && item.photo.suffix) {
                    venuePhotos.push(`${item.photo.prefix}original${item.photo.suffix}`);
                }

                // Outras podem trazer em venue.photos.groups
                if (venue.photos?.groups && venue.photos.groups.length > 0) {
                    venue.photos.groups.forEach(g => {
                        g.items?.forEach(photo => {
                            const photoUrl = `${photo.prefix}original${photo.suffix}`;
                            if (!venuePhotos.includes(photoUrl)) {
                                venuePhotos.push(photoUrl);
                            }
                        });
                    });
                }

                return {
                    id: venue.id,
                    name: venue.name,
                    description: categoryName,
                    imageUrl: venuePhotos.length > 0 ? venuePhotos[0] : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop', // Fallback
                    rating: venue.rating || 4.5,
                    address: venue.location.address || 'Endereço não informado',
                    city: venue.location.city || 'Cidade não informada',
                    category: categoryName,
                    categoryIcons: [categoryIcon],
                    latitude: venue.location.lat,
                    longitude: venue.location.lng,
                    website: venue.url,
                    instagram: venue.contact?.instagram,
                    phone: venue.contact?.formattedPhone || venue.contact?.phone,
                    menuUrl: venue.menu?.url,
                    hours: venue.hours?.status,
                    popularHours: venue.popular?.status,
                    priceTier: venue.price?.tier,
                    photos: venuePhotos.length > 0 ? venuePhotos : undefined,
                } as Place;
            });
        } catch (error) {
            console.error('Erro ao buscar locais no Foursquare:', error);
            return [];
        }
    },

    /**
     * Busca sugestões de lugares por texto usando Foursquare v2 (suggestcompletion)
     */
    async searchPlacesAutocomplete(query: string, latitude: number, longitude: number): Promise<Place[]> {
        if (!query || query.length < 3) return [];

        try {
            const params = new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                v: VERSION_DATE,
                ll: `${latitude},${longitude}`,
                query: query,
                limit: '5',
            });

            const response = await fetch(`${BASE_URL}/suggestcompletion?${params.toString()}`);
            if (!response.ok) {
                console.error('Erro na resposta do Foursquare suggest:', response.status);
                return [];
            }

            const data = await response.json();
            const venues: FoursquareVenue[] = data.response?.minivenues || [];

            return venues.map((venue) => {
                const primaryCategory = venue.categories?.[0];
                const categoryName = primaryCategory?.name || 'Local';

                return {
                    id: venue.id,
                    name: venue.name,
                    description: categoryName,
                    imageUrl: '',
                    rating: 0,
                    address: venue.location.address || '',
                    city: venue.location.city || '',
                    category: categoryName,
                    categoryIcons: ['📍'],
                    latitude: venue.location.lat,
                    longitude: venue.location.lng,
                    website: venue.url,
                    instagram: venue.contact?.instagram,
                    phone: venue.contact?.formattedPhone || venue.contact?.phone,
                    menuUrl: venue.menu?.url,
                    hours: venue.hours?.status,
                    popularHours: venue.popular?.status,
                    priceTier: venue.price?.tier,
                } as Place;
            });
        } catch (error) {
            console.error('Erro ao buscar autocomplete no Foursquare:', error);
            return [];
        }
    }
};
