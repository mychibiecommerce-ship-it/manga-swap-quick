import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSimpleTheme } from '../context/SimpleTheme';

interface EditProfilePageProps {
  onBack: () => void;
}

const EditProfilePage: React.FC<EditProfilePageProps> = ({ onBack }) => {
  const { colors } = useSimpleTheme();
  const [profileData, setProfileData] = useState({
    name: 'Marie Dubois',
    username: 'MangaFan92',
    email: 'marie.dubois@email.com',
    phone: '+33 6 12 34 56 78',
    city: 'Paris',
    bio: 'Passionnée de manga depuis 10 ans ! Je collectionne principalement les shonen et josei. Toujours à la recherche de nouveaux titres à découvrir 📚✨',
    avatar: 'https://picsum.photos/150/150?random=1',
    interests: ['Shonen', 'Josei', 'Romance', 'Action']
  });

  const pickImageFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileData({
        ...profileData,
        avatar: result.assets[0].uri
      });
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileData({
        ...profileData,
        avatar: result.assets[0].uri
      });
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      'Choisir une photo',
      'Sélectionnez la source de votre image',
      [
        {
          text: 'Galerie',
          onPress: pickImageFromLibrary,
        },
        {
          text: 'Appareil photo',
          onPress: takePhoto,
        },
        {
          text: 'Annuler',
          style: 'cancel',
        },
      ]
    );
  };

  const handleSave = () => {
    Alert.alert(
      'Profil sauvegardé',
      'Vos modifications ont été enregistrées avec succès !',
      [{ text: 'OK', onPress: onBack }]
    );
  };

  const addInterest = () => {
    Alert.prompt(
      'Ajouter un centre d\'intérêt',
      'Entrez un nouveau centre d\'intérêt manga',
      (text) => {
        if (text && text.trim()) {
          setProfileData({
            ...profileData,
            interests: [...profileData.interests, text.trim()]
          });
        }
      }
    );
  };

  const removeInterest = (index: number) => {
    const newInterests = profileData.interests.filter((_, i) => i !== index);
    setProfileData({
      ...profileData,
      interests: newInterests
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      marginRight: 15,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    saveButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
    },
    saveButtonText: {
      color: colors.surface,
      fontSize: 14,
      fontWeight: '600',
    },
    scrollContainer: {
      flex: 1,
    },
    section: {
      backgroundColor: colors.surface,
      marginVertical: 5,
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 15,
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: 20,
    },
    avatarContainer: {
      position: 'relative',
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      borderColor: colors.primary,
    },
    editAvatarButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      borderRadius: 20,
      padding: 8,
      borderWidth: 3,
      borderColor: colors.surface,
    },
    formField: {
      marginBottom: 15,
    },
    fieldLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    textInput: {
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingHorizontal: 15,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    interestsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    interestChip: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      flexDirection: 'row',
      alignItems: 'center',
    },
    interestText: {
      color: colors.surface,
      fontSize: 12,
      fontWeight: '600',
      marginRight: 5,
    },
    removeInterestButton: {
      marginLeft: 5,
    },
    addInterestButton: {
      backgroundColor: colors.background,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    addInterestText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 5,
    },
    bottomSpacer: {
      height: 50,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier le profil</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Sauvegarder</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Section Avatar */}
        <Animatable.View style={styles.section} animation="fadeInUp" duration={600}>
          <Text style={styles.sectionTitle}>📸 Photo de profil</Text>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: profileData.avatar }} style={styles.avatar} />
              <TouchableOpacity style={styles.editAvatarButton} onPress={showImagePicker}>
                <Ionicons name="pencil" size={20} color={colors.surface} />
              </TouchableOpacity>
            </View>
          </View>
        </Animatable.View>

        {/* Section Informations personnelles */}
        <Animatable.View style={styles.section} animation="fadeInUp" delay={100} duration={600}>
          <Text style={styles.sectionTitle}>👤 Informations personnelles</Text>
          
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Nom complet</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.name}
              onChangeText={(text) => setProfileData({...profileData, name: text})}
              placeholder="Votre nom complet"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Nom d'utilisateur</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.username}
              onChangeText={(text) => setProfileData({...profileData, username: text})}
              placeholder="@votre_username"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Ville</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.city}
              onChangeText={(text) => setProfileData({...profileData, city: text})}
              placeholder="Votre ville"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </Animatable.View>

        {/* Section Contact */}
        <Animatable.View style={styles.section} animation="fadeInUp" delay={200} duration={600}>
          <Text style={styles.sectionTitle}>📧 Contact</Text>
          
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.email}
              onChangeText={(text) => setProfileData({...profileData, email: text})}
              placeholder="votre@email.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Téléphone</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.phone}
              onChangeText={(text) => setProfileData({...profileData, phone: text})}
              placeholder="+33 6 12 34 56 78"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>
        </Animatable.View>

        {/* Section Bio */}
        <Animatable.View style={styles.section} animation="fadeInUp" delay={300} duration={600}>
          <Text style={styles.sectionTitle}>📝 Biographie</Text>
          
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>À propos de vous</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={profileData.bio}
              onChangeText={(text) => setProfileData({...profileData, bio: text})}
              placeholder="Parlez-nous de votre passion pour les mangas..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>
        </Animatable.View>

        {/* Section Centres d'intérêt */}
        <Animatable.View style={styles.section} animation="fadeInUp" delay={400} duration={600}>
          <Text style={styles.sectionTitle}>🎯 Centres d'intérêt manga</Text>
          
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Genres préférés</Text>
            <View style={styles.interestsContainer}>
              {profileData.interests.map((interest, index) => (
                <View key={index} style={styles.interestChip}>
                  <Text style={styles.interestText}>{interest}</Text>
                  <TouchableOpacity 
                    style={styles.removeInterestButton}
                    onPress={() => removeInterest(index)}
                  >
                    <Ionicons name="close" size={14} color={colors.surface} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addInterestButton} onPress={addInterest}>
                <Ionicons name="add" size={14} color={colors.textSecondary} />
                <Text style={styles.addInterestText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animatable.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

export default EditProfilePage;