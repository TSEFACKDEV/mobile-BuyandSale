import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import API_CONFIG from '../config/api.config';
import API_ENDPOINTS from '../helpers/api';

interface TestResult {
  name: string;
  status: 'running' | 'success' | 'error' | 'warning';
  details: string;
  timestamp: string;
}

/**
 * 🔍 Composant de diagnostic réseau avancé
 * Permet de déboguer les problèmes de connexion API
 */
export const NetworkDiagnostic = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTest = (name: string, status: 'running' | 'success' | 'error' | 'warning', details: string) => {
    setTests(prev => [...prev, { name, status, details, timestamp: new Date().toISOString() }]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setTests([]);

    // Test 1: Configuration API
    addTest('Configuration API', 'running', 'Vérification...');
    await new Promise(resolve => setTimeout(resolve, 300));
    const configDetails = 
      `BASE_URL: ${API_CONFIG.BASE_URL}\n` +
      `TIMEOUT: ${API_CONFIG.TIMEOUT}ms\n` +
      `Platform: ${Platform.OS} ${Platform.Version}`;
    addTest('Configuration API', 'success', configDetails);

    // Test 2: Endpoint racine de santé
    addTest('Endpoint racine (/api/buyandsale)', 'running', 'Connexion...');
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
        addTest('Endpoint racine', 'success', 
          `✅ Serveur accessible!\n` +
          `Status: ${response.status}\n` +
          `Temps: ${responseTime}ms\n` +
          `Données: ${JSON.stringify(data, null, 2)}`
        );
      } else {
        addTest('Endpoint racine', 'error', 
          `Status: ${response.status}\n` +
          `Erreur: ${response.statusText}`
        );
      }
    } catch (error: any) {
      addTest('Endpoint racine', 'error', 
        `❌ Impossible de se connecter au serveur!\n` +
        `Erreur: ${error.message}\n` +
        `Type: ${error.name}\n\n` +
        `💡 Solutions possibles:\n` +
        `1. Vérifiez que le serveur tourne (npm run dev)\n` +
        `2. PC et mobile sur le MÊME Wi-Fi\n` +
        `3. Pare-feu Windows autorise le port 3001\n` +
        `4. IP correcte: ${API_CONFIG.BASE_URL}`
      );
    }

    // Test 3: Endpoint de test ping
    addTest('Endpoint /test/ping', 'running', 'Test...');
    try {
      const pingUrl = `${API_CONFIG.BASE_URL}/test/ping`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const startTime = Date.now();
      const response = await fetch(pingUrl, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        addTest('Endpoint /test/ping', 'success', 
          `✅ Endpoint de test OK!\n` +
          `Temps: ${responseTime}ms\n` +
          `Serveur: ${data.server?.hostname || 'N/A'}\n` +
          `IP serveur: ${data.server?.localIPs?.join(', ') || 'N/A'}\n` +
          `Votre IP: ${data.connection?.from || 'N/A'}`
        );
      } else {
        addTest('Endpoint /test/ping', 'warning', 
          `Endpoint pas disponible (${response.status})\n` +
          `Le serveur doit être redémarré pour activer les routes de test.`
        );
      }
    } catch (error: any) {
      addTest('Endpoint /test/ping', 'warning', 
        `Endpoint de test non accessible: ${error.message}`
      );
    }

    // Test 4: Endpoint de login (sans credentials)
    addTest('Endpoint auth/login', 'running', 'Vérification...');
    try {
      const loginUrl = `${API_CONFIG.BASE_URL}/${API_ENDPOINTS.USER_LOGIN}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      // On s'attend à une erreur 400/422 (validation), pas à une erreur réseau
      if (response.status === 400 || response.status === 422) {
        addTest('Endpoint auth/login', 'success', 
          `✅ Endpoint fonctionnel!\n` +
          `URL: ${loginUrl}\n` +
          `Status: ${response.status} (erreur de validation normale)\n` +
          `Le serveur répond correctement.`
        );
      } else if (response.status === 404) {
        addTest('Endpoint auth/login', 'error', 
          `❌ Route non trouvée (404)\n` +
          `URL: ${loginUrl}\n` +
          `Vérifiez que le serveur est bien démarré.`
        );
      } else {
        const text = await response.text();
        addTest('Endpoint auth/login', 'success', 
          `Endpoint accessible\n` +
          `Status: ${response.status}\n` +
          `Réponse: ${text.substring(0, 100)}...`
        );
      }
    } catch (error: any) {
      addTest('Endpoint auth/login', 'error', 
        `❌ Endpoint inaccessible\n` +
        `URL: ${API_CONFIG.BASE_URL}/${API_ENDPOINTS.USER_LOGIN}\n` +
        `Erreur: ${error.message}`
      );
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
      case 'warning': return '#FF9800';
      default: return '#999';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '⚪';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Diagnostic Réseau Avancé</Text>
        <TouchableOpacity 
          style={[styles.button, isRunning && styles.buttonDisabled]} 
          onPress={runDiagnostics}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? 'Test en cours...' : '🔄 Relancer les tests'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.configBox}>
        <Text style={styles.configTitle}>📋 Configuration Actuelle</Text>
        <Text style={styles.configText}>URL: {API_CONFIG.BASE_URL}</Text>
        <Text style={styles.configText}>Timeout: {API_CONFIG.TIMEOUT}ms</Text>
        <Text style={styles.configText}>Platform: {Platform.OS} v{Platform.Version}</Text>
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
          <Text style={styles.summaryTitle}>📊 Résumé Final</Text>
          <Text style={[styles.summaryText, { color: '#4CAF50' }]}>
            ✅ Réussis: {tests.filter(t => t.status === 'success').length}
          </Text>
          <Text style={[styles.summaryText, { color: '#FF9800' }]}>
            ⚠️ Avertissements: {tests.filter(t => t.status === 'warning').length}
          </Text>
          <Text style={[styles.summaryText, { color: '#F44336' }]}>
            ❌ Échecs: {tests.filter(t => t.status === 'error').length}
          </Text>
          
          {tests.some(t => t.status === 'error') && (
            <View style={styles.troubleshootBox}>
              <Text style={styles.troubleshootTitle}>💡 Guide de dépannage:</Text>
              <Text style={styles.troubleshootText}>
                1. Vérifiez que le serveur tourne:{'\n'}
                   → cd server && npm run dev
              </Text>
              <Text style={styles.troubleshootText}>
                2. Vérifiez votre IP PC:{'\n'}
                   → Ouvrez CMD et tapez: ipconfig{'\n'}
                   → Trouvez "Adresse IPv4"
              </Text>
              <Text style={styles.troubleshootText}>
                3. Mettez à jour l'IP dans .env:{'\n'}
                   → API_URL=http://VOTRE_IP:3001/api/buyandsale
              </Text>
              <Text style={styles.troubleshootText}>
                4. Configurez le pare-feu:{'\n'}
                   → Exécutez setup-firewall.ps1 (en admin)
              </Text>
              <Text style={styles.troubleshootText}>
                5. Même réseau WiFi:{'\n'}
                   → PC et mobile sur le MÊME réseau
              </Text>
            </View>
          )}
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
    fontSize: 20,
    marginRight: 10,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
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
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '600',
  },
  troubleshootBox: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  troubleshootTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#E65100',
  },
  troubleshootText: {
    fontSize: 12,
    color: '#5D4037',
    marginBottom: 8,
    lineHeight: 18,
  },
});

export default NetworkDiagnostic;
