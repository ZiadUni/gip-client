export const formatTimestamp = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short'
  });
};
