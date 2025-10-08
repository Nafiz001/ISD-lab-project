import React, { useState, useEffect } from 'react';
import { db, storage } from '../utils/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import LoadingSpinner from '../components/LoadingSpinner';

const AboutAdmin = () => {
  const [aboutData, setAboutData] = useState({
    title: 'Our Story',
    description: ['', ''],
    image: '/about-story.jpg'
  });
  const [statistics, setStatistics] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch about data
      const aboutDoc = await getDoc(doc(db, 'pages', 'about'));
      if (aboutDoc.exists()) {
        const data = aboutDoc.data();
        setAboutData(data);
        setImagePreview(data.image || '');
      }

      // Fetch statistics
      const statsSnapshot = await getDocs(collection(db, 'about-statistics'));
      const statsData = statsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStatistics(statsData.sort((a, b) => (a.order || 0) - (b.order || 0)));

      // Fetch team members
      const teamSnapshot = await getDocs(collection(db, 'team-members'));
      const teamData = teamSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeamMembers(teamData.sort((a, b) => (a.order || 0) - (b.order || 0)));

    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveAboutData = async () => {
    try {
      setSaving(true);
      await setDoc(doc(db, 'pages', 'about'), aboutData);
      alert('About page data saved successfully!');
    } catch (error) {
      console.error('Error saving about data:', error);
      alert('Error saving data: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAboutImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      
      // Create a reference to the file in Firebase Storage
      const timestamp = Date.now();
      const fileName = `about/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update the about data with the new image URL
      setAboutData({...aboutData, image: downloadURL});
      setImagePreview(downloadURL);
      
      console.log('About image uploaded successfully:', downloadURL);
    } catch (error) {
      console.error('Error uploading about image:', error);
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAboutImageUrlChange = (e) => {
    const url = e.target.value;
    setAboutData({...aboutData, image: url});
    setImagePreview(url);
  };

  const saveStatistic = async (stat, isNew = false) => {
    try {
      setSaving(true);
      if (isNew) {
        const docRef = await addDoc(collection(db, 'about-statistics'), stat);
        setStatistics([...statistics, { id: docRef.id, ...stat }]);
      } else {
        await updateDoc(doc(db, 'about-statistics', stat.id), stat);
        setStatistics(statistics.map(s => s.id === stat.id ? stat : s));
      }
      alert('Statistic saved successfully!');
    } catch (error) {
      console.error('Error saving statistic:', error);
      alert('Error saving statistic: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteStatistic = async (id) => {
    if (window.confirm('Are you sure you want to delete this statistic?')) {
      try {
        setSaving(true);
        await deleteDoc(doc(db, 'about-statistics', id));
        setStatistics(statistics.filter(s => s.id !== id));
        alert('Statistic deleted successfully!');
      } catch (error) {
        console.error('Error deleting statistic:', error);
        alert('Error deleting statistic: ' + error.message);
      } finally {
        setSaving(false);
      }
    }
  };

  const saveTeamMember = async (member, isNew = false) => {
    try {
      setSaving(true);
      if (isNew) {
        const docRef = await addDoc(collection(db, 'team-members'), member);
        setTeamMembers([...teamMembers, { id: docRef.id, ...member }]);
      } else {
        await updateDoc(doc(db, 'team-members', member.id), member);
        setTeamMembers(teamMembers.map(m => m.id === member.id ? member : m));
      }
      alert('Team member saved successfully!');
    } catch (error) {
      console.error('Error saving team member:', error);
      alert('Error saving team member: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteTeamMember = async (id) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        setSaving(true);
        await deleteDoc(doc(db, 'team-members', id));
        setTeamMembers(teamMembers.filter(m => m.id !== id));
        alert('Team member deleted successfully!');
      } catch (error) {
        console.error('Error deleting team member:', error);
        alert('Error deleting team member: ' + error.message);
      } finally {
        setSaving(false);
      }
    }
  };

  const addNewStatistic = () => {
    const newStat = {
      icon: '📊',
      number: '0',
      label: 'New Statistic',
      order: statistics.length + 1
    };
    saveStatistic(newStat, true);
  };

  const addNewTeamMember = () => {
    const newMember = {
      name: 'New Team Member',
      role: 'Position',
      image: '/placeholder-avatar.jpg',
      social: { twitter: '#', instagram: '#', linkedin: '#' },
      order: teamMembers.length + 1
    };
    saveTeamMember(newMember, true);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">About Page Management</h1>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('about')}
          className={`px-4 py-2 rounded ${activeTab === 'about' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
        >
          About Content
        </button>
        <button
          onClick={() => setActiveTab('statistics')}
          className={`px-4 py-2 rounded ${activeTab === 'statistics' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
        >
          Statistics
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`px-4 py-2 rounded ${activeTab === 'team' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
        >
          Team Members
        </button>
      </div>

      {/* About Content Tab */}
      {activeTab === 'about' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Edit About Content</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={aboutData.title}
              onChange={(e) => setAboutData({...aboutData, title: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">First Paragraph</label>
            <textarea
              value={aboutData.description[0]}
              onChange={(e) => {
                const newDesc = [...aboutData.description];
                newDesc[0] = e.target.value;
                setAboutData({...aboutData, description: newDesc});
              }}
              rows="4"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Second Paragraph</label>
            <textarea
              value={aboutData.description[1]}
              onChange={(e) => {
                const newDesc = [...aboutData.description];
                newDesc[1] = e.target.value;
                setAboutData({...aboutData, description: newDesc});
              }}
              rows="4"
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">About Page Image</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Upload Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAboutImageUpload}
                  disabled={uploading || saving}
                  className="w-full p-2 border rounded"
                />
                {uploading && <p className="text-blue-500 text-xs mt-1">Uploading...</p>}
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Or Enter Image URL</label>
                <input
                  type="url"
                  value={aboutData.image}
                  onChange={handleAboutImageUrlChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-2">
                <label className="block text-xs text-gray-600 mb-1">Preview</label>
                <img 
                  src={imagePreview} 
                  alt="About page preview" 
                  className="w-32 h-32 object-cover border rounded"
                  onError={() => setImagePreview('')}
                />
              </div>
            )}
          </div>

          <button
            onClick={saveAboutData}
            disabled={saving || uploading}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : uploading ? 'Uploading...' : 'Save About Content'}
          </button>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'statistics' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Manage Statistics</h2>
            <button
              onClick={addNewStatistic}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add New Statistic
            </button>
          </div>

          <div className="grid gap-4">
            {statistics.map((stat, index) => (
              <StatisticEditor
                key={stat.id}
                statistic={stat}
                onSave={(updatedStat) => saveStatistic(updatedStat)}
                onDelete={() => deleteStatistic(stat.id)}
                saving={saving}
              />
            ))}
          </div>
        </div>
      )}

      {/* Team Members Tab */}
      {activeTab === 'team' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Manage Team Members</h2>
            <button
              onClick={addNewTeamMember}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add New Team Member
            </button>
          </div>

          <div className="grid gap-4">
            {teamMembers.map((member, index) => (
              <TeamMemberEditor
                key={member.id}
                member={member}
                onSave={(updatedMember) => saveTeamMember(updatedMember)}
                onDelete={() => deleteTeamMember(member.id)}
                saving={saving}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Statistic Editor Component
const StatisticEditor = ({ statistic, onSave, onDelete, saving }) => {
  const [stat, setStat] = useState(statistic);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(stat.image || '');

  const handleSave = () => {
    onSave(stat);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      
      // Create a reference to the file in Firebase Storage
      const timestamp = Date.now();
      const fileName = `statistics/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update the statistic with the new image URL
      setStat({...stat, image: downloadURL});
      setImagePreview(downloadURL);
      
      console.log('Image uploaded successfully:', downloadURL);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setStat({...stat, image: url});
    setImagePreview(url);
  };

  return (
    <div className="border p-4 rounded">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Icon/Emoji</label>
          <input
            type="text"
            value={stat.icon}
            onChange={(e) => setStat({...stat, icon: e.target.value})}
            className="w-full p-2 border rounded"
            placeholder="🏪 or leave empty for image"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Number</label>
          <input
            type="text"
            value={stat.number}
            onChange={(e) => setStat({...stat, number: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Label</label>
          <input
            type="text"
            value={stat.label}
            onChange={(e) => setStat({...stat, label: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Order</label>
          <input
            type="number"
            value={stat.order || 0}
            onChange={(e) => setStat({...stat, order: parseInt(e.target.value)})}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
      
      {/* Image Upload Section */}
      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">Statistic Image (Optional - will override icon)</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Upload Image File</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="w-full p-2 border rounded"
            />
            {uploading && <p className="text-blue-500 text-xs mt-1">Uploading...</p>}
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Or Enter Image URL</label>
            <input
              type="url"
              value={stat.image || ''}
              onChange={handleImageUrlChange}
              placeholder="https://example.com/image.jpg"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        {/* Image Preview */}
        {imagePreview && (
          <div className="mt-2">
            <label className="block text-xs text-gray-600 mb-1">Preview</label>
            <img 
              src={imagePreview} 
              alt="Statistic preview" 
              className="w-16 h-16 object-contain border rounded"
              onError={() => setImagePreview('')}
            />
          </div>
        )}
      </div>

      <div className="flex space-x-2 mt-4">
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={onDelete}
          disabled={saving || uploading}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

// Team Member Editor Component
const TeamMemberEditor = ({ member, onSave, onDelete, saving }) => {
  const [teamMember, setTeamMember] = useState(member);

  const handleSave = () => {
    onSave(teamMember);
  };

  return (
    <div className="border p-4 rounded">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={teamMember.name}
            onChange={(e) => setTeamMember({...teamMember, name: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <input
            type="text"
            value={teamMember.role}
            onChange={(e) => setTeamMember({...teamMember, role: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Image URL</label>
          <input
            type="text"
            value={teamMember.image}
            onChange={(e) => setTeamMember({...teamMember, image: e.target.value})}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Order</label>
          <input
            type="number"
            value={teamMember.order || 0}
            onChange={(e) => setTeamMember({...teamMember, order: parseInt(e.target.value)})}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">Social Links</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            type="text"
            placeholder="Twitter URL"
            value={teamMember.social?.twitter || ''}
            onChange={(e) => setTeamMember({
              ...teamMember, 
              social: {...teamMember.social, twitter: e.target.value}
            })}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Instagram URL"
            value={teamMember.social?.instagram || ''}
            onChange={(e) => setTeamMember({
              ...teamMember, 
              social: {...teamMember.social, instagram: e.target.value}
            })}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="LinkedIn URL"
            value={teamMember.social?.linkedin || ''}
            onChange={(e) => setTeamMember({
              ...teamMember, 
              social: {...teamMember.social, linkedin: e.target.value}
            })}
            className="p-2 border rounded"
          />
        </div>
      </div>

      <div className="flex space-x-2 mt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Save
        </button>
        <button
          onClick={onDelete}
          disabled={saving}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default AboutAdmin;
