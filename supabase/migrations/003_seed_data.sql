-- ============================================================
-- WayMeet — Migration 003: Seed Data
-- Categorias, comunidades e eventos de exemplo (Londrina-PR)
-- Usa o primeiro usuário disponível como creator (seed seguro)
-- ============================================================

-- ────────────────────────────────────────────────────────
-- 1. Categorias
-- ────────────────────────────────────────────────────────
INSERT INTO public.categories (id, name, icon_name, color) VALUES
    ('cafe',        'Café',         'cafe-outline',           '#92400E'),
    ('esporte',     'Esporte',      'fitness-outline',        '#1D4ED8'),
    ('musica',      'Música',       'musical-notes-outline',  '#7C3AED'),
    ('cultura',     'Cultural',     'library-outline',        '#B45309'),
    ('gastronomia', 'Gastronomia',  'restaurant-outline',     '#DC2626'),
    ('natureza',    'Natureza',     'leaf-outline',           '#059669'),
    ('tech',        'Tecnologia',   'laptop-outline',         '#0891B2'),
    ('social',      'Social',       'people-outline',         '#DB2777'),
    ('arte',        'Arte',         'color-palette-outline',  '#D97706'),
    ('aventura',    'Aventura',     'compass-outline',        '#16A34A')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────
-- 2. Eventos e Comunidades — usa primeiro usuário disponível
-- ────────────────────────────────────────────────────────
DO $$
DECLARE
    v_creator uuid;
BEGIN
    -- Pega o primeiro profile disponível como creator do seed
    SELECT id INTO v_creator FROM public.profiles LIMIT 1;

    -- Só continua se houver ao menos 1 usuário cadastrado
    IF v_creator IS NULL THEN
        RAISE NOTICE 'Nenhum usuário encontrado — pulando seed de eventos e comunidades.';
        RETURN;
    END IF;

    -- ── Eventos em Londrina-PR ──────────────────────────

    INSERT INTO public.events
        (title, description, image_url, category, date, start_time,
         latitude, longitude, location_name, creator_id,
         max_participants, price, is_public)
    VALUES
        ('Happy Hour no Igapó',
         'Drinks e boa música às margens do Lago Igapó. Traga seus amigos!',
         'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600',
         'social', CURRENT_DATE + 2, '18:30',
         -23.3160, -51.1760, 'Lago Igapó — Londrina, PR',
         v_creator, 30, 0, true),

        ('Corrida no Parque Arthur Thomas',
         'Treino coletivo de 5km no parque. Todos os níveis são bem-vindos!',
         'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600',
         'esporte', CURRENT_DATE + 1, '07:00',
         -23.3282, -51.1729, 'Parque Arthur Thomas — Londrina, PR',
         v_creator, 20, 0, true),

        ('Jam Session Jazz',
         'Noite de jazz ao vivo no Calçadão. Entrada gratuita.',
         'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600',
         'musica', CURRENT_DATE + 3, '20:00',
         -23.3093, -51.1626, 'Calçadão de Londrina — Centro',
         v_creator, 50, 10, true),

        ('Workshop React Native',
         'Aprenda a criar apps mobile com React Native e Expo do zero.',
         'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=600',
         'tech', CURRENT_DATE + 5, '14:00',
         -23.3045, -51.1696, 'UEL — Universidade Estadual de Londrina',
         v_creator, 40, 0, true),

        ('Brunch Gastronômico',
         'Brunch especial com produtos locais, queijos artesanais e música ao vivo.',
         'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600',
         'gastronomia', CURRENT_DATE + 4, '10:00',
         -23.3201, -51.1843, 'Bairro Gleba Palhano — Londrina, PR',
         v_creator, 25, 45, true),

        ('Trilha Mata dos Godoy',
         'Trilha de nível intermediário na reserva. Duração aproximada: 3h.',
         'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600',
         'aventura', CURRENT_DATE + 6, '08:00',
         -23.5180, -51.2040, 'Mata dos Godoy — Londrina, PR',
         v_creator, 15, 0, true),

        ('Noite de Arte no Museu',
         'Visita guiada noturna com coquetel e apresentação de artistas locais.',
         'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600',
         'arte', CURRENT_DATE + 7, '19:00',
         -23.3098, -51.1634, 'Museu de Arte de Londrina — MuA',
         v_creator, 35, 20, true),

        ('Meetup Nômades Digitais',
         'Encontro mensal de profissionais remotos. Traga seu notebook!',
         'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600',
         'tech', CURRENT_DATE + 8, '16:00',
         -23.3150, -51.1820, 'Coworking Gleba — Londrina, PR',
         v_creator, 50, 0, true)
    ON CONFLICT DO NOTHING;

    -- ── Comunidades ────────────────────────────────────

    INSERT INTO public.communities (name, description, image_url, creator_id)
    VALUES
        ('Nômades Digitais Londrina',
         'Comunidade de profissionais remotos — coworkings, meetups e networking.',
         'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
         v_creator),

        ('Esportes & Saúde LDA',
         'Grupo de corrida, ciclismo e esportes coletivos em Londrina.',
         'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
         v_creator),

        ('Foodies Londrina',
         'Apaixonados por gastronomia, novos restaurantes e experiências culinárias.',
         'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
         v_creator),

        ('Tech Community LDA',
         'Desenvolvedores, designers e entusiastas de tecnologia do norte do Paraná.',
         'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400',
         v_creator),

        ('Trilheiros do PR',
         'Trilhas, ecoturismo e aventura pelo Paraná e arredores.',
         'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
         v_creator)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Seed concluído — eventos e comunidades criados com creator: %', v_creator;
END;
$$;
