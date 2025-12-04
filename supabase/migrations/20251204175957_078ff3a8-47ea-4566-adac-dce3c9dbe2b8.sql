-- Enable realtime for learning_sessions table
ALTER TABLE public.learning_sessions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_sessions;