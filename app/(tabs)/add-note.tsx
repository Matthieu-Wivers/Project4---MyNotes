import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { PRIORITIES } from '../constants/priority';

// Wrapper localStorage "AsyncStorage-like"
const storage = {
  getItem: async (key: string) => {
    return Promise.resolve(localStorage.getItem(key));
  },
  setItem: async (key: string, value: string) => {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: async (key: string) => {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
};

export default function AddNoteScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');

  const handleSave = async () => {
    const newNote = {
      id: uuidv4(),
      title,
      content,
      createdAt: new Date().toISOString(),
      priority,
    };

    const data = await storage.getItem('notes');
    const notes = data ? JSON.parse(data) : [];
    notes.push(newNote);
    await storage.setItem('notes', JSON.stringify(notes));
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter title"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Content</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Enter content"
        value={content}
        onChangeText={setContent}
        multiline
      />

      <Text style={styles.label}>Priority</Text>
      <View style={styles.pickerWrapper}>
        {Platform.OS === 'web' ? (
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={styles.webSelect}
          >
            {Object.entries(PRIORITIES).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        ) : (
          <Text style={styles.mobileFallback}>Mobile Picker Not Available</Text>
        )}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>SAVE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { marginTop: 12, fontSize: 16, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginTop: 4,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginTop: 4,
    overflow: 'hidden',
  },
  webSelect: {
    width: '100%',
    height: 40,
    fontSize: 16,
    paddingLeft: 10,
    border: 'none',
    outline: 'none',
    appearance: 'none',
  },
  mobileFallback: {
    padding: 10,
    fontStyle: 'italic',
    color: '#888',
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: '#28a745',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
