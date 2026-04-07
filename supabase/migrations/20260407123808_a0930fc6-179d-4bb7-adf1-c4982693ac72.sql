
-- Add columns to doc_protocol_sectors for transit rules
ALTER TABLE public.doc_protocol_sectors ADD COLUMN IF NOT EXISTS allowed_destinations uuid[] DEFAULT '{}';

-- Add columns to doc_protocols for partial accept/return tracking
ALTER TABLE public.doc_protocols ADD COLUMN IF NOT EXISTS accepted_items integer DEFAULT 0;
ALTER TABLE public.doc_protocols ADD COLUMN IF NOT EXISTS returned_items integer DEFAULT 0;

-- Add item_status to doc_protocol_items for partial operations
ALTER TABLE public.doc_protocol_items ADD COLUMN IF NOT EXISTS item_status text NOT NULL DEFAULT 'pendente';
ALTER TABLE public.doc_protocol_items ADD COLUMN IF NOT EXISTS return_reason text;
ALTER TABLE public.doc_protocol_items ADD COLUMN IF NOT EXISTS accepted_at timestamp with time zone;
ALTER TABLE public.doc_protocol_items ADD COLUMN IF NOT EXISTS returned_at timestamp with time zone;
