/**
 * Gestionnaire de permissions
 */

import { useState } from 'react';
import { FiRefreshCw, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import api from '../../services/api';

export default function PermissionsManager({ onPermissionsSeeded }) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSeedPermissions = async () => {
    if (!confirm('Voulez-vous initialiser les permissions par défaut ? Cela créera les rôles admin et user avec leurs permissions.')) {
      return;
    }

    try {
      setIsSeeding(true);
      setError('');
      setResult(null);

      const response = await api.post('/admin/roles/permissions/seed');
      setResult(response.data.data);

      if (onPermissionsSeeded) {
        onPermissionsSeeded();
      }
    } catch (error) {
      console.error('Erreur seeding:', error);
      setError(error.response?.data?.message || 'Erreur lors de l\'initialisation');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="">
    </div>
  );
}
