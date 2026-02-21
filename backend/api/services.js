const apiClient = require('./client');

class APIService {
  async fetchData(id) {
    return await apiClient.get(`/data/${id}`);
  }

  async createRecord(data) {
    return await apiClient.post('/records', data);
  }

  async updateRecord(id, data) {
    return await apiClient.put(`/records/${id}`, data);
  }

  async deleteRecord(id) {
    return await apiClient.delete(`/records/${id}`);
  }

  async listRecords(filters = {}) {
    return await apiClient.get('/records', filters);
  }
}

module.exports = new APIService();
