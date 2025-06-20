import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
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

export default function EditNoteScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [note, setNote] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');

  useEffect(() => {
    const loadNote = async () => {
      const data = await storage.getItem('notes');
      const notes = data ? JSON.parse(data) : [];
      const found = notes.find((n: any) => n.id === id);
      if (found) {
        setNote(found);
        setTitle(found.title);
        setContent(found.content);
        setPriority(found.priority);
      }
    };
    loadNote();
  }, [id]);

  const handleUpdate = async () => {
    const updatedNote = {
      ...note,
      title,
      content,
      priority,
    };

    const data = await storage.getItem('notes');
    let notes = data ? JSON.parse(data) : [];
    notes = notes.map((n: any) => (n.id === note.id ? updatedNote : n));
    await storage.setItem('notes', JSON.stringify(notes));
    router.replace('/');
  };

  const handleDelete = () => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const data = await storage.getItem('notes');
          let notes = data ? JSON.parse(data) : [];
          notes = notes.filter((n: any) => n.id !== note.id);
          await storage.setItem('notes', JSON.stringify(notes));
          router.replace('/');
        },
      },
    ]);
  };

  if (!note) return <Text style={{ padding: 16 }}>Loading...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Content</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
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
            style={{
              width: '100%',
              height: 40,
              fontSize: 16,
              paddingLeft: 10,
              borderRadius: 6,
              border: '1px solid #ccc',
              marginTop: 4,
            }}
          >
            {Object.entries(PRIORITIES).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        ) : (
          <Text style={{ padding: 10, fontStyle: 'italic', color: '#888' }}>
            Mobile Picker Not Available
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
        <Text style={styles.saveText}>UPDATE</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.saveText}>DELETE</Text>
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
    marginTop: 4,
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: '#007bff',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
  },
  deleteButton: {
    marginTop: 12,
    backgroundColor: '#dc3545',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
