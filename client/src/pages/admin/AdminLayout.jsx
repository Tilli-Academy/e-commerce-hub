import { NavLink, Outlet } from 'react-router-dom';
import {
  HiOutlineChartBarSquare,
  HiOutlineCube,
  HiOutlineClipboardDocumentList,
  HiOutlineUsers,
} from 'react-icons/hi2';

const NAV_ITEMS = [
  { to: '/admin', icon: HiOutlineChartBarSquare, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: HiOutlineCube, label: 'Products' },
  { to: '/admin/orders', icon: HiOutlineClipboardDocumentList, label: 'Orders' },
  { to: '/admin/users', icon: HiOutlineUsers, label: 'Users' },
];

const AdminLayout = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Admin Dashboard
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-56 flex-shrink-0">
          <nav className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 lg:sticky lg:top-24">
            <div className="flex lg:flex-col gap-1 overflow-x-auto">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
