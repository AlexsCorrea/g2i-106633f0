ALTER TABLE public.lab_external_results ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.lab_external_orders(id);

-- Link existing results to orders via external_protocol
UPDATE public.lab_external_results r
SET order_id = o.id
FROM public.lab_external_orders o
WHERE r.order_id IS NULL
  AND r.external_protocol IS NOT NULL
  AND o.external_protocol IS NOT NULL
  AND (r.external_protocol LIKE '%' || SPLIT_PART(o.external_protocol, '-', 2) || '%'
       OR r.external_protocol = o.external_protocol);

CREATE INDEX IF NOT EXISTS idx_lab_external_results_order_id ON public.lab_external_results(order_id);