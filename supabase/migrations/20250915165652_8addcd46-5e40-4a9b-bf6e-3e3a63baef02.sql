-- Adicionar role de educator se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
    END IF;
    
    -- Adicionar educator se não existir no enum
    BEGIN
        ALTER TYPE public.app_role ADD VALUE 'educator';
    EXCEPTION 
        WHEN duplicate_object THEN null;
    END;
END $$;