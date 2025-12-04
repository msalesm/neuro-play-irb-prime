-- Enable realtime for game_sessions table
ALTER TABLE public.game_sessions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;