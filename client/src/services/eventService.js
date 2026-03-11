import API from './api';

export const getEvents = async (params = {}) => {
  const res = await API.get('/events', { params });
  return res.data;
};

export const getEventById = async (id) => {
  const res = await API.get(`/events/${id}`);
  return res.data;
};

export const registerForEvent = async (id) => {
  const res = await API.post(`/events/${id}/register`);
  return res.data;
};

export const getTrendingEvents = async () => {
  const res = await API.get('/events/trending');
  return res.data;
};

export const getRecommendations = async () => {
  const res = await API.get('/events/recommendations');
  return res.data;
};
