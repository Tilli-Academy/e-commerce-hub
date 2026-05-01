import { useSelector } from 'react-redux';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Name</span>
            <span className="text-gray-900">{user?.name}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Email</span>
            <span className="text-gray-900">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600 font-medium">Role</span>
            <span className="inline-block px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-700 rounded-full capitalize">
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
