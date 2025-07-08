import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/image.png'; // Assuming you renamed the loader to actual logo image
import deleteIcon from '../assets/del.png'; // Adjust path if needed

const Welcome: React.FC = () => {
  const [notes, setNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null); // New state for name
  const navigate = useNavigate();


  const url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        console.log('Fetching notes...');
        // 1
        const response = await fetch(`${url}/api/notes`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        console.log('Fetch response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetch response data:', data);
        setNotes(data.notes || []);
        setEmail(data.email || null);
        setName(data.name || 'User'); // Set name from response
      } catch (err) {
        console.error('Fetch notes error:', err);
        setError('Failed to fetch notes or unauthorized');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [navigate]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) {
      setError('Note content cannot be empty');
      return;
    }

    try {
      // 2
      const response = await fetch(`${url}/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content: newNote }),
      });
      if (!response.ok) throw new Error('Failed to add note');
      setNotes([...notes, newNote]);
      setNewNote('');
      setError(null);
    } catch (err) {
      // console.error('Add note error:', err);
      setError('Failed to add note');
    }
  };

  const handleDeleteNote = async (index: number) => {
    try {
      // 3
      const response = await fetch(`${url}/api/notes/${index}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete note');
      const updatedNotes = notes.filter((_, i) => i !== index);
      setNotes(updatedNotes);
      setError(null);
    } catch (err) {
      // console.error('Delete note error:', err);
      setError('Failed to delete note');
    }
  };

  const handleSignOut = async () => {
    try {
      // 4
      await fetch(`${url}/api/notes/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      navigate('/login');
    } catch (err) {
      // console.error('Sign out error:', err);
      setError('Failed to sign out');
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-8 w-8 mr-2" />
          <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
        </div>
        <button
          onClick={handleSignOut}
          className="text-blue-600 hover:underline text-sm"
        >
          Sign Out
        </button>
      </div>

      {/* Welcome Card */}
      <div className="w-full max-w-md bg-white p-4 rounded-xl shadow-md mb-4 text-center">
        <p className="text-lg font-semibold text-gray-800">
          Welcome, {name || 'User'} ! {/* Dynamic name */}
        </p>
        <p className="text-sm text-gray-600">
          Email: {email || 'xxxxxx@xxxx.com'}
        </p>
      </div>

      {/* Note creation field + button */}
      <form onSubmit={handleAddNote} className="w-full max-w-md mb-6">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Enter your note here..."
          className="w-full p-2 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
          disabled={!newNote.trim()}
        >
          Create Note
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="w-full max-w-md bg-red-100 text-red-700 text-sm p-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Notes List */}
      <div className="w-full max-w-md">
        <h2 className="text-md font-semibold text-gray-800 mb-2">Notes</h2>
        {loading ? (
          <p className="text-gray-600 text-sm">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="text-gray-600 text-sm">No notes yet. Add one above!</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((note, index) => (
              <li
                key={index}
                className="bg-white p-3 rounded-md shadow-sm flex justify-between items-center"
              >
                <span className="text-sm">{note}</span>
                <button
                  onClick={() => handleDeleteNote(index)}
                  className="p-1 hover:opacity-80 transition"
                >
                  <img src={deleteIcon} alt="Delete" className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Welcome;