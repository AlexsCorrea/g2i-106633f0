const ERROR_MESSAGES: Record<string, string> = {
  'duplicate key': 'Este registro já existe no sistema.',
  'foreign key': 'Operação inválida devido a dependências.',
  'not-null': 'Campos obrigatórios não preenchidos.',
  'check constraint': 'Valor fornecido é inválido.',
  'permission denied': 'Você não tem permissão para esta ação.',
  'row-level security': 'Você não tem permissão para esta ação.',
  'jwt expired': 'Sua sessão expirou. Faça login novamente.',
  'invalid input syntax': 'Formato de dados inválido.',
  'value too long': 'Texto excede o tamanho máximo permitido.',
  'unique constraint': 'Este registro já existe no sistema.',
};

export function getUserFriendlyError(error: unknown): string {
  const message = (error as any)?.message?.toLowerCase() || '';

  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(key)) return value;
  }

  console.error('Database error:', error);
  return 'Ocorreu um erro ao processar sua solicitação. Tente novamente.';
}
