import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Alert,
  Dimensions 
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Ionicons } from '@expo/vector-icons';
import { useSimpleTheme } from '../context/SimpleTheme';

interface BarcodeScannerProps {
  isVisible: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
}

const { width, height } = Dimensions.get('window');

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  isVisible,
  onClose,
  onScanSuccess
}) => {
  const { colors } = useSimpleTheme();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (isVisible) {
      (async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    }
  }, [isVisible]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    console.log(`Code-barres scanné ! Type: ${type}, Data: ${data}`);
    
    // Simuler une recherche d'informations manga basée sur le code-barres
    setTimeout(() => {
      onScanSuccess(data);
      onClose();
      setScanned(false);
    }, 500);
  };

  if (hasPermission === null) {
    return (
      <Modal visible={isVisible} transparent={true}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.text, { color: colors.text }]}>
            Demande d'autorisation pour utiliser la caméra...
          </Text>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={isVisible} transparent={true}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.permissionContent}>
            <Ionicons name="camera-off" size={64} color={colors.textLight} />
            <Text style={[styles.permissionTitle, { color: colors.text }]}>
              Autorisation requise
            </Text>
            <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
              L'accès à la caméra est nécessaire pour scanner les codes-barres des mangas.
            </Text>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    camera: {
      width: width,
      height: height,
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    scanArea: {
      position: 'absolute',
      top: height * 0.25,
      left: width * 0.1,
      width: width * 0.8,
      height: width * 0.8,
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: 'transparent',
    },
    scanCorner: {
      position: 'absolute',
      width: 30,
      height: 30,
      borderColor: colors.primary,
    },
    topLeft: {
      top: -2,
      left: -2,
      borderTopWidth: 4,
      borderLeftWidth: 4,
    },
    topRight: {
      top: -2,
      right: -2,
      borderTopWidth: 4,
      borderRightWidth: 4,
    },
    bottomLeft: {
      bottom: -2,
      left: -2,
      borderBottomWidth: 4,
      borderLeftWidth: 4,
    },
    bottomRight: {
      bottom: -2,
      right: -2,
      borderBottomWidth: 4,
      borderRightWidth: 4,
    },
    header: {
      position: 'absolute',
      top: 60,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      zIndex: 1,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#FFFFFF',
      textAlign: 'center',
      flex: 1,
    },
    closeButton: {
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    instructions: {
      position: 'absolute',
      bottom: 100,
      left: 20,
      right: 20,
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    instructionText: {
      color: '#FFFFFF',
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 24,
    },
    text: {
      fontSize: 16,
      textAlign: 'center',
    },
    permissionContent: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      marginHorizontal: 32,
    },
    permissionTitle: {
      fontSize: 20,
      fontWeight: '600',
      marginTop: 16,
      marginBottom: 8,
      textAlign: 'center',
    },
    permissionText: {
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 20,
    },
    button: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <Modal visible={isVisible} transparent={false}>
      <View style={styles.container}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.camera}
        />
        
        <View style={styles.overlay} />
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scanner le code-barres</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.scanArea}>
          <View style={[styles.scanCorner, styles.topLeft]} />
          <View style={[styles.scanCorner, styles.topRight]} />
          <View style={[styles.scanCorner, styles.bottomLeft]} />
          <View style={[styles.scanCorner, styles.bottomRight]} />
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            📖 Pointez la caméra vers le code-barres{'\n'}
            au dos de votre manga pour l'identifier automatiquement
          </Text>
        </View>

        {scanned && (
          <View style={[styles.instructions, { backgroundColor: colors.success }]}>
            <Text style={styles.instructionText}>
              ✅ Code-barres scanné ! Recherche en cours...
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default BarcodeScanner;