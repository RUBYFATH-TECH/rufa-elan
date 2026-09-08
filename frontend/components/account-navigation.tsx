"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  User, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  CreditCard, 
  Bell, 
  Settings,
  Store
} from "lucide-react";

type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
};

interface AccountNavigationProps {
  userProfile: UserProfile;
}

export default function AccountNavigation({ userProfile }: AccountNavigationProps) {
  const pathname = usePathname();
  
  const navigation = [
    { name: 'Overview', href: '/account', icon: User },
    { name: 'Orders', href: '/account/orders', icon: ShoppingBag },
    { name: 'Shop Products', href: '/shop', icon: Store },
    { name: 'Wishlist', href: '/wishlist', icon: Heart },
    { name: 'Addresses', href: '/account/addresses', icon: MapPin },
    { name: 'Payment Methods', href: '/account/payments', icon: CreditCard },
    { name: 'Notifications', href: '/account/notifications', icon: Bell },
    { name: 'Settings', href: '/account/settings', icon: Settings },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col overflow-hidden">
      <div className="p-4 flex-1 overflow-hidden flex flex-col">
        {/* User Profile Section */}
        <div className="flex items-center mb-4 flex-shrink-0">
          <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {userProfile.avatar_url ? (
              <img 
                src={userProfile.avatar_url} 
                alt="Profile" 
                className="h-full w-full object-cover object-center" 
              />
            ) : (
              <span className="text-orange-600 font-semibold">
                {userProfile.full_name?.charAt(0) || userProfile.email.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userProfile.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">{userProfile.email}</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1 flex-1 overflow-y-auto pr-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors w-full ${
                  isActive
                    ? 'bg-orange-100 text-orange-900'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className={`mr-3 h-4 w-4 flex-shrink-0 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}