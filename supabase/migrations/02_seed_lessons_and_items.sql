-- Migration 02: Seed lessons and lesson_items automatically from existing content tables

DO $$
DECLARE
    v_vocab_chunk RECORD;
    v_kanji_chunk RECORD;
    v_grammar_chunk RECORD;
    v_lesson_id BIGINT;
    v_idx INTEGER;
BEGIN
    -- Check if lessons already exist
    IF EXISTS (SELECT 1 FROM public.lesson LIMIT 1) THEN
        RAISE NOTICE 'Lessons table already contains data. Skipping PL/pgSQL seed.';
        RETURN;
    END IF;

    RAISE NOTICE 'Seeding lessons and lesson_items from vocabulary, kanji, and grammar_point tables...';

    -- 1. Vocabulary Lessons (15 items per lesson)
    FOR v_vocab_chunk IN (
        SELECT jlpt_level, array_agg(id ORDER BY id) as ids
        FROM public.vocabulary
        GROUP BY jlpt_level
    ) LOOP
        FOR i IN 1..CEIL(ARRAY_LENGTH(v_vocab_chunk.ids, 1)::NUMERIC / 15) LOOP
            INSERT INTO public.lesson (title, description, jlpt_level, content_type, order_index, item_count, published)
            VALUES (
                UPPER(v_vocab_chunk.jlpt_level) || ' Từ Vựng - Bài ' || i,
                'Luyện tập từ vựng JLPT ' || UPPER(v_vocab_chunk.jlpt_level) || ' - Bài ' || i,
                UPPER(v_vocab_chunk.jlpt_level),
                'VOCABULARY',
                i,
                LEAST(15, ARRAY_LENGTH(v_vocab_chunk.ids, 1) - (i-1)*15),
                TRUE
            )
            RETURNING id INTO v_lesson_id;

            FOR j IN 1..LEAST(15, ARRAY_LENGTH(v_vocab_chunk.ids, 1) - (i-1)*15) LOOP
                INSERT INTO public.lesson_item (lesson_id, entity_id, entity_type, order_index)
                VALUES (
                    v_lesson_id,
                    v_vocab_chunk.ids[(i-1)*15 + j],
                    'VOCABULARY',
                    j
                );
            END LOOP;
        END LOOP;
    END LOOP;

    -- 2. Kanji Lessons (12 items per lesson)
    FOR v_kanji_chunk IN (
        SELECT jlpt_level, array_agg(id ORDER BY id) as ids
        FROM public.kanji
        GROUP BY jlpt_level
    ) LOOP
        FOR i IN 1..CEIL(ARRAY_LENGTH(v_kanji_chunk.ids, 1)::NUMERIC / 12) LOOP
            INSERT INTO public.lesson (title, description, jlpt_level, content_type, order_index, item_count, published)
            VALUES (
                UPPER(v_kanji_chunk.jlpt_level) || ' Kanji - Bài ' || i,
                'Học chữ Hán JLPT ' || UPPER(v_kanji_chunk.jlpt_level) || ' - Bài ' || i,
                UPPER(v_kanji_chunk.jlpt_level),
                'KANJI',
                i,
                LEAST(12, ARRAY_LENGTH(v_kanji_chunk.ids, 1) - (i-1)*12),
                TRUE
            )
            RETURNING id INTO v_lesson_id;

            FOR j IN 1..LEAST(12, ARRAY_LENGTH(v_kanji_chunk.ids, 1) - (i-1)*12) LOOP
                INSERT INTO public.lesson_item (lesson_id, entity_id, entity_type, order_index)
                VALUES (
                    v_lesson_id,
                    v_kanji_chunk.ids[(i-1)*12 + j],
                    'KANJI',
                    j
                );
            END LOOP;
        END LOOP;
    END LOOP;

    -- 3. Grammar Lessons (10 items per lesson)
    FOR v_grammar_chunk IN (
        SELECT jlpt_level, array_agg(id ORDER BY id) as ids
        FROM public.grammar_point
        GROUP BY jlpt_level
    ) LOOP
        FOR i IN 1..CEIL(ARRAY_LENGTH(v_grammar_chunk.ids, 1)::NUMERIC / 10) LOOP
            INSERT INTO public.lesson (title, description, jlpt_level, content_type, order_index, item_count, published)
            VALUES (
                UPPER(v_grammar_chunk.jlpt_level) || ' Ngữ Pháp - Bài ' || i,
                'Cấu trúc ngữ pháp JLPT ' || UPPER(v_grammar_chunk.jlpt_level) || ' - Bài ' || i,
                UPPER(v_grammar_chunk.jlpt_level),
                'GRAMMAR',
                i,
                LEAST(10, ARRAY_LENGTH(v_grammar_chunk.ids, 1) - (i-1)*10),
                TRUE
            )
            RETURNING id INTO v_lesson_id;

            FOR j IN 1..LEAST(10, ARRAY_LENGTH(v_grammar_chunk.ids, 1) - (i-1)*10) LOOP
                INSERT INTO public.lesson_item (lesson_id, entity_id, entity_type, order_index)
                VALUES (
                    v_lesson_id,
                    v_grammar_chunk.ids[(i-1)*10 + j],
                    'GRAMMAR',
                    j
                );
            END LOOP;
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Seeding completed successfully!';
END $$;
