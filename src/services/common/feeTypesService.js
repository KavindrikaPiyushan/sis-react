import { apiClient } from '../api';

const PUBLIC_FEE_TYPES_BASE = '/fee-types';

const listPublicFeeTypes = async (params = {}) => {
  try {
    const res = await apiClient.get(PUBLIC_FEE_TYPES_BASE, { params });
    return res;
  } catch (err) {
    console.error('listPublicFeeTypes error', err);
    const msg = (err && err.data && err.data.message) ? err.data.message : (err && err.message) || 'Failed to list public fee types';
    return { success: false, message: msg, status: err && err.status };
  }
};

export default {
  listPublicFeeTypes,
};

export { listPublicFeeTypes };
