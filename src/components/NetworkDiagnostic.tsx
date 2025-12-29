import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import API_CONFIG from '../config/api.config';
import API_ENDPOINTS from '../helpers/api';

/**
 * Composant de diagnostic réseau détaillé
 * À utiliser pour déboguer les problèmes de connexion
 */
export const NetworkDiagnostic = () => {
  const [tests, setTests] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTest = (name: string, status: 'running' | 'success' | 'error', details: string) => {
    setTests(prev => [...prev, { name, status, details, timestamp: new Date().toISOString() }]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setTests([]);

    // Test 1: Configuration API
    addTest('Configuration API', 'running', 'Vérification...');
    await new Promise(resolve => setTimeout(resolve, 500));
    addTest('Configuration API', 'success', 
      `BASE_URL: ${API_CONFIG.BASE_URL}\nTIMEOUT: ${API_CONFIG.TIMEOUT}ms`
    );

    // Test 2: Endpoint de santé
    addTest('Test de santé (/api/buyandsale)', 'running', 'Connexion...');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const startTime = Date.now();
      const response = await fetch(API_CONFIG.BASE_URL, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        addTest('Test de santé', 'success', 
          `Status: ${response.status}\nTemps: ${responseTime}ms\nRéponse: ${JSON.stringify(data)}`
        );
      } else {
        addTest('Test de santé', 'error', 
          `Status: ${response.status}\nErreur: ${response.statusText}`
        );
      }
    } catch (error: any) {
      addTest('Test de santé', 'error', 
        `Erreur: ${error.message}\nType: ${error.name}`
      );
    }

    // Test 3: Endpoint de login (sans credentials)
    addTest('Test endpoint login', 'running', 'Vérification...');
    try {
      const loginUrl = `${API_CONFIG.BASE_URL}/${API_ENDPOINTS.USER_LOGIN}`;
      console.log('🧪 Test URL login:', loginUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // On envoie une requête vide pour voir si l'endpoint répond
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      // On s'attend à une erreur 400 (champs manquants), pas à une erreur réseau
      if (response.status === 400 || response.status === 422) {
        addTest('Test endpoint login', 'success', 
          `Endpoint accessible !\nURL: ${loginUrl}\nStatus: ${response.status} (normal, données manquantes)`
        );
      } else if (response.status === 404) {
        addTest('Test endpoint login', 'error', 
          `Endpoint non trouvé (404)\nURL: ${loginUrl}\nVérifiez que le serveur est démarré`
        );
      } else {
        const text = await response.text();
        addTest('Test endpoint login', 'success', 
          `Endpoint accessible\nStatus: ${response.status}\nRéponse: ${text.substring(0, 100)}`
        );
      }
    } catch (error: any) {
      addTest('Test endpoint login', 'error', 
        `Impossible d'atteindre l'endpoint\nURL: ${API_CONFIG.BASE_URL}/${API_ENDPOINTS.USER_LOGIN}\nErreur: ${error.message}`
      );
    }

    // Test 4: DNS Resolution (simulation)
    addTest('Résolution DNS', 'running', 'Vérification...');
    await new Promise(resolve => setTimeout(resolve, 300));
    const ip = API_CONFIG.BASE_URL.match(/(\d+\.\d+\.\d+\.\d+)/)?.[0];
    if (ip) {
      addTest('Résolution DNS', 'success', `IP détectée: ${ip}\nPas de résolution DNS nécessaire`);
    } else {
      addTest('Résolution DNS', 'success', 'Utilisation d\'un nom de domaine');
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return '#FFA500';
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      default: return '#999';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⚪';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Diagnostic Réseau</Text>
        <TouchableOpacity 
          style={[styles.button, isRunning && styles.buttonDisabled]} 
          onPress={runDiagnostics}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? 'Test en cours...' : 'Relancer les tests'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.configBox}>
        <Text style={styles.configTitle}>📋 Configuration</Text>
        <Text style={styles.configText}>URL: {API_CONFIG.BASE_URL}</Text>
        <Text style={styles.configText}>Timeout: {API_CONFIG.TIMEOUT}ms</Text>
      </View>

      <View style={styles.testsContainer}>
        {tests.map((test, index) => (
          <View key={index} style={[styles.testCard, { borderLeftColor: getStatusColor(test.status) }]}>
            <View style={styles.testHeader}>
              <Text style={styles.testIcon}>{getStatusIcon(test.status)}</Text>
              <Text style={styles.testName}>{test.name}</Text>
            </View>
            <Text style={styles.testDetails}>{test.details}</Text>
            <Text style={styles.testTime}>{new Date(test.timestamp).toLocaleTimeString()}</Text>
          </View>
        ))}
      </View>

      {!isRunning && tests.length > 0 && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>📊 Résumé</Text>
          <Text style={styles.summaryText}>
            Tests réussis: {tests.filter(t => t.status === 'success').length}
          </Text>
          <Text style={styles.summaryText}>
            Tests échoués: {tests.filter(t => t.status === 'error').length}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  configBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  configTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  configText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  testsContainer: {
    marginBottom: 20,
  },
  testCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  testIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  testDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  testTime: {
    fontSize: 10,
    color: '#999',
    textAlign: 'right',
  },
  summaryBox: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

export default NetworkDiagnostic;
