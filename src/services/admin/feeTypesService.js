import { apiClient } from '../api';

const ADMIN_FEE_TYPES_BASE = '/admin/fee-types';

const listFeeTypes = async (params = {}) => {
	try {
		const res = await apiClient.get(ADMIN_FEE_TYPES_BASE, { params });
		return res;
	} catch (err) {
		console.error('listFeeTypes error', err);
		const msg = (err && err.data && err.data.message) ? err.data.message : (err && err.message) || 'Failed to list fee types';
		return { success: false, message: msg, status: err && err.status };
	}
};

const createFeeType = async (payload) => {
	try {
		const res = await apiClient.post(ADMIN_FEE_TYPES_BASE, payload);
		return res;
	} catch (err) {
		console.error('createFeeType error', err);
		const msg = (err && err.data && err.data.message) ? err.data.message : (err && err.message) || 'Failed to create fee type';
		return { success: false, message: msg, status: err && err.status };
	}
};

const deleteFeeType = async (feeTypeId) => {
	try {
		const res = await apiClient.delete(`${ADMIN_FEE_TYPES_BASE}/${feeTypeId}`);
		return res;
	} catch (err) {
		console.error('deleteFeeType error', err);
		const msg = (err && err.data && err.data.message) ? err.data.message : (err && err.message) || 'Failed to delete fee type';
		return { success: false, message: msg, status: err && err.status };
	}
};

// Hard delete (permanent) - endpoint: DELETE /admin/fee-types/:id/hard
const hardDeleteFeeType = async (feeTypeId) => {
	try {
		const res = await apiClient.delete(`${ADMIN_FEE_TYPES_BASE}/${feeTypeId}/hard`);
		return res;
	} catch (err) {
		console.error('hardDeleteFeeType error', err);
		const msg = (err && err.data && err.data.message) ? err.data.message : (err && err.message) || 'Failed to hard delete fee type';
		return { success: false, message: msg, status: err && err.status };
	}
};

const updateFeeType = async (feeTypeId, payload) => {
	try {
		const res = await apiClient.put(`${ADMIN_FEE_TYPES_BASE}/${feeTypeId}`, payload);
		return res;
	} catch (err) {
		console.error('updateFeeType error', err);
		const msg = (err && err.data && err.data.message) ? err.data.message : (err && err.message) || 'Failed to update fee type';
		return { success: false, message: msg, status: err && err.status };
	}
};

export default {
	listFeeTypes,
	createFeeType,
	deleteFeeType,
  updateFeeType,
  hardDeleteFeeType,
};

// Named exports for environments that don't resolve default exports reliably
export { listFeeTypes, createFeeType, deleteFeeType, updateFeeType, hardDeleteFeeType };

