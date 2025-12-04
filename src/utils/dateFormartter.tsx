// athena-chat/src/utils/dateFormartter.tsx
export const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });
};

export const formatMessageDate = (dateString: string): string => {
  const date = new Date(dateString);

  // Obter a data de hoje no timezone de São Paulo
  const today = new Date();
  const todayInBrazil = new Date(today.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));

  const yesterday = new Date(todayInBrazil);
  yesterday.setDate(yesterday.getDate() - 1);

  // Converter a data da mensagem para o timezone de São Paulo para comparação
  const dateInBrazil = new Date(date.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));

  if (dateInBrazil.toDateString() === todayInBrazil.toDateString()) {
    return 'Hoje';
  } else if (dateInBrazil.toDateString() === yesterday.toDateString()) {
    return 'Ontem';
  } else {
    return date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  }
};