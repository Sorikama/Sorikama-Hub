import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SecurityStatus from '../components/SecurityStatus';
import api from '../services/api';

const Services = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Utiliser la route publique pour récupérer les services
        const response = await fetch('http://localhost:7000/api/v1/system/services/public');
        const data = await response.json();
        
        if (data.success && data.data.services) {
          // Mapper les services avec des icônes par défaut
          const mappedServices = data.data.services.map(service => ({
            name: service.name,
            description: service.description || 'Service externe',
            icon: '🔗',
            url: service.url,
            slug: service.slug,
            status: 'active'
          }));
          setServices(mappedServices);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des services:', error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleServiceClick = (service) => {
    if (service.status !== 'active') return;
    
    // Redirection avec token JWT et API Key utilisateur
    const params = new URLSearchParams({
      token: user.token,
      userId: user.id || user._id,
      redirect: window.location.origin
    });
    
    const ssoUrl = `${service.url}/sso/auth?${params.toString()}`;
    window.open(ssoUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement des services...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <SecurityStatus />
        
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Mes Services</h1>
          <p className="text-muted-foreground">
            Bienvenue {user?.firstName} ! Accédez à tous vos services Sorikama.
          </p>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold mb-2">Aucun service disponible</h3>
            <p className="text-muted-foreground">Les services seront affichés ici une fois configurés.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
            <div
              key={index}
              onClick={() => handleServiceClick(service)}
              className={`p-6 bg-card border border-border rounded-lg transition-all ${
                service.status === 'active'
                  ? 'hover:shadow-lg cursor-pointer hover:border-primary/50'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
              <p className="text-muted-foreground mb-4">{service.description}</p>
              
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    service.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}
                >
                  {service.status === 'active' ? 'Disponible' : 'Maintenance'}
                </span>
                
                {service.status === 'active' && (
                  <span className="text-primary text-sm">Accéder →</span>
                )}
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;