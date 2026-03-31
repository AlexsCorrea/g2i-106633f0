CREATE TABLE "public"."schedule_audit_logs" (
    "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "agenda_id" uuid,
    "user_id" uuid,
    "action_type" text NOT NULL,
    "entity_type" text NOT NULL,
    "entity_id" uuid,
    "old_values" jsonb,
    "new_values" jsonb,
    "origin" text,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("agenda_id") REFERENCES "public"."schedule_agendas"("id") ON DELETE SET NULL,
    FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL
);

ALTER TABLE "public"."schedule_audit_logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs if they have admin role" ON "public"."schedule_audit_logs"
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'coordenador', 'ti')
      )
    );

CREATE POLICY "System can insert audit logs" ON "public"."schedule_audit_logs"
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);
