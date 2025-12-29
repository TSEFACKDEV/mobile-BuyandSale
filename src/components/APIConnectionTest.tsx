import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { API_CONFIG } from '../config/api.config';

/**
 * Composant de test de connectivité API
 * À ajouter temporairement dans votre écran principal pour déboguer
 */
export const APIConnectionTest = () => {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const testConnection = async () => {
    setStatus('testing');
    setMessage('Test en cours...');
    setResponseTime(null);
    
    const startTime = Date.now();
    
    try {
      console.log('🧪 Test de connexion vers:', API_CONFIG.BASE_URL);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      
      const response = await fetch(API_CONFIG.BASE_URL, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      const time = endTime - startTime;
      setResponseTime(time);
      
      console.log('📡 Réponse HTTP:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Données reçues:', data);
      
      setStatus('success');
      setMessage(`Connexion réussie ! (${time}ms)`);
      
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error);
      
      setStatus('error');
      
      if (error.name === 'AbortError') {
        setMessage('Timeout - Le serveur ne répond pas');
      } else if (error.message.includes('Network request failed')) {
        setMessage('Erreur réseau - Vérifiez:\n• Serveur démarré\n• Même Wi-Fi\n• IP correcte');
      } else {
        setMessage(`Erreur: ${error.message}`);
      }
    }
  };

  // Test automatique au montage
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔌 Test de Connexion API</Text>
      <Text style={styles.url}>{API_CONFIG.BASE_URL}</Text>
      
      <View style={styles.statusContainer}>
        {status === 'testing' && <ActivityIndicator size="large" color="#007AFF" />}
        
        {status === 'success' && (
          <>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successText}>{message}</Text>
            {responseTime && (
              <Text style={styles.timeText}>Temps de réponse: {responseTime}ms</Text>
            )}
          </>
        )}
        
        {status === 'error' && (
          <>
            <Text style={styles.errorIcon}>❌</Text>
            <Text style={styles.errorText}>{message}</Text>
          </>
        )}
      </View>
      
      <TouchableOpacity 
        style={[styles.button, status === 'testing' && styles.buttonDisabled]} 
        onPress={testConnection}
        disabled={status === 'testing'}
      >
        <Text style={styles.buttonText}>
          {status === 'testing' ? 'Test en cours...' : 'Retester'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💡 Checklist de dépannage:</Text>
        <Text style={styles.infoText}>1. Serveur démarré (npm run dev)</Text>
        <Text style={styles.infoText}>2. PC et téléphone sur le MÊME Wi-Fi</Text>
        <Text style={styles.infoText}>3. IP correcte: 192.168.4.55</Text>
        <Text style={styles.infoText}>4. Pare-feu autorise le port 3001</Text>
        <Text style={styles.infoText}>5. Pas de VPN actif</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  url: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  statusContainer: {
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  successText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  errorIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
});

export default APIConnectionTest;
