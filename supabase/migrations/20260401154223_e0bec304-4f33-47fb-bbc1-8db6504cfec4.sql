
UPDATE public.profiles SET avatar_url = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face', specialty = 'Clínica Geral' WHERE id = '06da62db-a52d-4f43-a0b1-3c5087ed35c5';
UPDATE public.profiles SET avatar_url = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face', specialty = 'Cardiologia' WHERE id = '49af7c39-1a98-431d-a68b-d7c0bf304712';
UPDATE public.profiles SET specialty = 'Oftalmologia' WHERE id = '5b68da6e-7f3a-4144-8a88-40c90c2b607f';
UPDATE public.schedule_agendas SET professional_id = '06da62db-a52d-4f43-a0b1-3c5087ed35c5' WHERE id = '14c5ff05-87d0-4b3d-87fd-a5ff31e51a6d';
UPDATE public.schedule_agendas SET professional_id = '49af7c39-1a98-431d-a68b-d7c0bf304712' WHERE id = '440746e6-1178-491a-8826-ddf0e9a07d0a';
UPDATE public.schedule_agendas SET professional_id = '5b68da6e-7f3a-4144-8a88-40c90c2b607f' WHERE id = 'f35958cb-a29d-47f0-a24c-365b70f870c4';
