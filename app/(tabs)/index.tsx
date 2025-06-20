import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PRIORITIES } from '../constants/priority';


interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  priority: 'important' | 'normal' | 'memo';
}

// Wrapper localStorage en mode "AsyncStorage-like"
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

export default function DashboardScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const loadNotes = async () => {
        const data = await storage.getItem('notes');
        if (data) setNotes(JSON.parse(data));
        else setNotes([]);
      };
      loadNotes();
    }, [])
  );

  const renderNote = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={[styles.noteCard, { borderLeftColor: PRIORITIES[item.priority]?.color || 'gray' }]}
      onPress={() => router.push({ pathname: '/edit-note', params: { id: item.id } })}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      <Text numberOfLines={2} style={styles.content}>{item.content}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {notes.length === 0 ? (
        <Text style={styles.emptyText}>No notes yet</Text>
      ) : (
        <FlatList<Note>
          data={notes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/add-note')}
      >
        <Text style={styles.addText}>ADD</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 6,
  },
  title: { fontWeight: 'bold', fontSize: 18 },
  date: { fontSize: 12, color: '#888', marginBottom: 4 },
  content: { fontSize: 14, color: '#444' },
  emptyText: { fontSize: 16, textAlign: 'center', marginTop: 20, color: '#666' },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#007bff',
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 50,
  },
  addText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
